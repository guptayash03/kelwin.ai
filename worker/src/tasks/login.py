import json
import logging
from ..firebase_client import (
    get_db,
    update_application_status,
    get_application,
    add_activity_log,
)
from ..browser.session import create_browser
from ..encryption import decrypt_password
from ..ai.llm import get_llm
from ._agent_runner import run_agent_safely, AgentTimeoutError
from firebase_admin import firestore as fs

logger = logging.getLogger(__name__)

PORTALS_REQUIRING_LOGIN = {
    "workday", "oracle", "taleo", "successfactors", "icims", "eightfold", "smartrecruiters"
}

EXTEND_SYSTEM = """CRITICAL: If an action does not produce the expected result, try a DIFFERENT approach.
NEVER repeat the exact same action more than twice. If stuck, return a failure JSON immediately."""


def _build_login_task(email: str, password: str, otp_code: str | None = None) -> str:
    """Build the browser-use agent task prompt for portal login."""
    base = f"""You are logging into a job portal. Complete the login process.

CREDENTIALS:
- Email/Username: {email}
- Password: {password}

INSTRUCTIONS:
1. Look for the login form on the page.
2. Enter the email/username in the appropriate field.
3. Enter the password in the appropriate field.
4. Click the Sign In / Login / Submit button.
5. Wait for the page to load after submission.
"""

    if otp_code:
        base += f"""
6. If you see a verification code / OTP input field, enter: {otp_code}
7. Click Verify / Submit / Continue.
8. Wait for the page to load.
"""

    base += """
After attempting login, evaluate what you see:

If login was SUCCESSFUL (you see a dashboard, profile, or job application page):
Return: {"success": true, "page_url": "the current URL"}

If a VERIFICATION CODE / OTP / 2FA input field appeared (asking for a code sent via email/SMS):
Return: {"success": false, "needs_otp": true, "otp_page_url": "the current URL"}

If login FAILED (wrong password, account locked, error message):
Return: {"success": false, "reason": "the error message you see"}

Return ONLY the JSON response, no markdown.
"""
    return base


def _build_otp_entry_task(otp_code: str) -> str:
    """Build the agent task for entering an OTP on a pre-loaded page."""
    return f"""You are on a verification/OTP page. Enter the code and proceed.

VERIFICATION CODE: {otp_code}

INSTRUCTIONS:
1. Find the verification code / OTP input field on this page.
2. Enter the code: {otp_code}
3. Click Verify / Submit / Continue button.
4. Wait for the page to load.

After entering the code, evaluate what you see:

If verification was SUCCESSFUL (you see a dashboard, profile, or job application page):
Return: {{"success": true, "page_url": "the current URL"}}

If the code was EXPIRED or INVALID:
Return: {{"success": false, "reason": "code expired or invalid"}}

If login FAILED for another reason:
Return: {{"success": false, "reason": "the error message you see"}}

Return ONLY the JSON response, no markdown.
"""


def requires_login(platform: str) -> bool:
    return platform in PORTALS_REQUIRING_LOGIN


def get_portal_credentials(user_id: str, portal: str) -> dict | None:
    db = get_db()
    cred_doc = (
        db.collection("users")
        .document(user_id)
        .collection("portalCredentials")
        .document(portal)
        .get()
    )
    if not cred_doc.exists:
        return None
    return cred_doc.to_dict()


async def handle_login(application_id: str, user_id: str, otp_code: str | None = None):
    """Handle portal login, including OTP entry if resuming."""
    from browser_use import Agent

    application = get_application(application_id)
    portal = application.get("detectedPortal", "")
    job_url = application["jobUrl"]

    add_activity_log(application_id, f"Starting login to {portal}", "info", "applying")

    # Get credentials
    cred_data = get_portal_credentials(user_id, portal)
    if not cred_data:
        add_activity_log(application_id, f"No credentials found for {portal}", "error", "applying")
        update_application_status(
            application_id, "waiting_for_credentials",
            detectedPortal=portal,
            currentTaskType=None,
        )
        return

    email = cred_data["email"]
    password = decrypt_password(
        cred_data["encryptedPassword"],
        cred_data["iv"],
        cred_data["authTag"],
    )

    llm = get_llm(user_id)

    # If we have an OTP code and saved cookies, restore the session
    if otp_code:
        saved_cookies = application.get("sessionCookies", [])
        otp_page_url = application.get("otpPageUrl", "")

        add_activity_log(application_id, "Entering verification code", "action", "applying")

        try:
            async with create_browser() as browser:
                context = await browser.get_browser_context()
                if saved_cookies:
                    await context.add_cookies(saved_cookies)

                agent = Agent(
                    task=f"Navigate to {otp_page_url} and then:\n\n{_build_otp_entry_task(otp_code)}",
                    llm=llm,
                    browser=browser,
                    max_actions_per_step=4,
                    max_failures=3,
                    step_timeout=45,
                    extend_system_message=EXTEND_SYSTEM,
                )

                raw_output = await run_agent_safely(
                    agent=agent,
                    browser=browser,
                    max_steps=15,
                    wall_timeout=180,
                )

                login_result = _parse_result(raw_output)

                if login_result.get("success"):
                    add_activity_log(application_id, "Verification successful — logged in", "success", "applying")
                    cookies = await context.cookies()
                    update_application_status(
                        application_id, "applying",
                        sessionCookies=cookies,
                        currentTaskType="submission",
                    )
                    _enqueue_submission(application_id, user_id)
                else:
                    reason = login_result.get("reason", "OTP verification failed")
                    add_activity_log(application_id, f"OTP failed: {reason}", "warning", "applying")
                    # OTP expired — re-do login to trigger new OTP
                    update_application_status(application_id, "applying")
                    await _do_fresh_login(application_id, user_id, email, password, job_url, llm)
        except (AgentTimeoutError, Exception) as e:
            error_msg = str(e)[:200]
            logger.error(f"OTP entry failed for {application_id}: {error_msg}")
            add_activity_log(application_id, f"OTP entry failed: {error_msg}", "error", "applying")
            raise
        return

    # Fresh login (no OTP)
    await _do_fresh_login(application_id, user_id, email, password, job_url, llm)


async def _do_fresh_login(application_id, user_id, email, password, job_url, llm):
    """Perform a fresh login attempt."""
    from browser_use import Agent

    add_activity_log(application_id, "Logging into portal", "action", "applying")

    task_prompt = _build_login_task(email, password)

    async with create_browser() as browser:
        agent = Agent(
            task=f"Navigate to {job_url} and then:\n\n{task_prompt}",
            llm=llm,
            browser=browser,
            max_actions_per_step=4,
            max_failures=3,
            step_timeout=45,
            extend_system_message=EXTEND_SYSTEM,
        )

        raw_output = await run_agent_safely(
            agent=agent,
            browser=browser,
            max_steps=20,
            wall_timeout=180,
        )

        login_result = _parse_result(raw_output)

        if login_result.get("success"):
            add_activity_log(application_id, "Login successful", "success", "applying")
            context = await browser.get_browser_context()
            cookies = await context.cookies()
            update_application_status(
                application_id, "applying",
                sessionCookies=cookies,
                currentTaskType="submission",
            )
            _enqueue_submission(application_id, user_id)

        elif login_result.get("needs_otp"):
            otp_page_url = login_result.get("otp_page_url", job_url)
            add_activity_log(application_id, "Verification code required", "warning", "applying")
            context = await browser.get_browser_context()
            cookies = await context.cookies()
            update_application_status(
                application_id, "waiting_for_otp",
                sessionCookies=cookies,
                otpPageUrl=otp_page_url,
                otpRequestedAt=fs.SERVER_TIMESTAMP,
                currentTaskType=None,
            )
            _send_otp_notification(application_id, user_id)

        else:
            reason = login_result.get("reason", "Login failed")
            add_activity_log(application_id, f"Login failed: {reason}", "error", "applying")
            raise Exception(f"Portal login failed: {reason}")


def _parse_result(raw_output: str) -> dict:
    try:
        clean = raw_output.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(clean)
    except json.JSONDecodeError:
        return {"success": False, "reason": raw_output[:200]}


def _enqueue_submission(application_id: str, user_id: str):
    """Enqueue the submission task."""
    from google.cloud import tasks_v2
    from google.protobuf import duration_pb2
    from ..config import config

    client = tasks_v2.CloudTasksClient()
    parent = client.queue_path(config.GCP_PROJECT_ID, config.GCP_LOCATION, config.GCP_QUEUE_NAME)

    worker_url = config.WORKER_URL
    payload = json.dumps({"applicationId": application_id, "userId": user_id}).encode()

    task = {
        "dispatch_deadline": duration_pb2.Duration(seconds=1800),
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": f"{worker_url}/tasks/submission",
            "headers": {"Content-Type": "application/json"},
            "body": payload,
            "oidc_token": {
                "service_account_email": config.WORKER_SERVICE_ACCOUNT,
                "audience": worker_url,
            },
        },
    }
    client.create_task(request={"parent": parent, "task": task})


def _send_otp_notification(application_id: str, user_id: str):
    """Write a notification request for the platform to send an OTP email."""
    try:
        from ..firebase_client import get_application
        app_data = get_application(application_id)
        db = get_db()
        db.collection("mail").add({
            "to": _get_user_email(user_id),
            "message": {
                "subject": f"Verification code needed — {app_data.get('jobTitle', '')} at {app_data.get('company', '')}",
                "html": f"<p>Your application requires a verification code. <a href='https://kelwin.ai/dashboard/applications/{application_id}'>Enter code here</a></p>",
            },
        })
    except Exception as e:
        logger.warning(f"Failed to send OTP notification: {e}")


def _get_user_email(user_id: str) -> str:
    db = get_db()
    user_doc = db.collection("users").document(user_id).get()
    if user_doc.exists:
        return user_doc.to_dict().get("email", "")
    return ""
