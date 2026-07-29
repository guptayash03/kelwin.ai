import json
import logging
import tempfile
import os
from ..firebase_client import (
    get_db,
    update_application_status,
    get_application,
    get_user_profile,
    download_resume,
    add_activity_log,
)
from ..browser.session import create_browser
from ..ai.llm import get_llm
from ._agent_runner import run_agent_safely, AgentTimeoutError

logger = logging.getLogger(__name__)

EXTEND_SYSTEM = """CRITICAL: If an action does not produce the expected result, try a DIFFERENT approach.
NEVER repeat the exact same action more than twice. If stuck, return a failure JSON immediately."""


def _build_submission_task(
    detected_fields: list,
    screening_questions: list,
    parsed_data: dict,
    resume_path: str | None,
) -> str:
    """Build the browser-use agent task prompt for form submission."""
    personal = parsed_data.get("personalInfo", {})
    skills = parsed_data.get("skills", {})
    experience = parsed_data.get("experience", [])
    education = parsed_data.get("education", [])

    all_skills = (
        skills.get("technical", [])
        + skills.get("frameworks", [])
        + skills.get("languages", [])
    )

    exp_summary = "; ".join(
        f"{e.get('title', '')} at {e.get('company', '')} ({e.get('duration', '')})"
        for e in experience[:3]
    )

    edu_summary = "; ".join(
        f"{e.get('degree', '')} in {e.get('field', '')} from {e.get('institution', '')}"
        for e in education[:2]
    )

    profile_info = f"""
APPLICANT PROFILE:
- Full Name: {personal.get('fullName', 'N/A')}
- Email: {personal.get('email', 'N/A')}
- Phone: {personal.get('phone', 'N/A')}
- Location: {personal.get('location', 'N/A')}
- LinkedIn: {personal.get('linkedIn', 'N/A')}
- GitHub: {personal.get('github', 'N/A')}
- Portfolio/Website: {personal.get('portfolio', '') or personal.get('website', 'N/A')}
- Skills: {', '.join(all_skills[:20])}
- Experience: {exp_summary or 'Entry-level / Fresh graduate'}
- Education: {edu_summary or 'N/A'}
"""

    field_instructions = ""
    if detected_fields:
        field_instructions = "\nFIELDS TO FILL:\n"
        for f in detected_fields:
            value = f.get("value") or f.get("mappedProfileField", "")
            req = "(REQUIRED)" if f.get("required") else "(optional)"
            field_instructions += f"- {f['label']} [{f['type']}] {req}: {value}\n"

    screening_instructions = ""
    if screening_questions:
        screening_instructions = "\nSCREENING QUESTIONS TO ANSWER:\n"
        for q in screening_questions:
            ai_answer = q.get("aiGeneratedAnswer", "")
            options = f" Options: {q.get('options')}" if q.get("options") else ""
            screening_instructions += f"- {q['question']}{options}\n  Answer: {ai_answer}\n"

    resume_instruction = ""
    if resume_path:
        resume_instruction = f"\nRESUME FILE: {resume_path}\nUpload this when you see a resume/CV file upload field.\n"

    return f"""Fill this job application form. Do NOT click Submit.

{profile_info}
{field_instructions}
{screening_instructions}
{resume_instruction}
RULES:
- If you see an "Apply" button, click it to reach the form
- Fill ALL required fields using the profile data above
- For dropdowns, pick the closest match
- Upload the resume if there's a file upload field
- If you see a CAPTCHA, return failure
- DO NOT click the final Submit/Apply button

When done, return ONLY this JSON (no markdown):
{{"success": true, "filled_values": {{"Field Label": "value entered"}}}}

On failure return:
{{"success": false, "reason": "explanation"}}"""


async def handle_submission(application_id: str, user_id: str):
    """Phase 2: Use browser-use Agent to fill and submit the application."""
    from browser_use import Agent

    add_activity_log(application_id, "Starting form submission", "info", "applying")
    update_application_status(application_id, "applying")

    application = get_application(application_id)
    profile = get_user_profile(user_id)
    parsed_data = profile["parsedData"]
    user_data = profile["user"]

    job_url = application["jobUrl"]
    detected_fields = application.get("detectedFields", [])
    screening_questions = application.get("screeningQuestions", [])

    # Generate AI answers for screening questions
    if screening_questions:
        update_application_status(application_id, "generating_ai_answers")
        add_activity_log(
            application_id,
            f"Generating AI answers for {len(screening_questions)} screening questions",
            "action",
            "generating_ai_answers",
        )
        from ..ai.screening import generate_screening_answers

        ai_provider = user_data.get("selectedAIProvider", "gemini")
        screening_questions = await generate_screening_answers(
            screening_questions, parsed_data, application, ai_provider
        )
        add_activity_log(application_id, "AI answers generated successfully", "success", "generating_ai_answers")
        update_application_status(
            application_id, "applying", screeningQuestions=screening_questions
        )

    # Download resume
    update_application_status(application_id, "uploading_resume")
    add_activity_log(application_id, "Preparing resume for upload", "action", "uploading_resume")
    resume_data = profile["resume"]
    storage_path = resume_data.get("storagePath", "")
    resume_path = None

    if storage_path:
        resume_bytes = download_resume(user_id, storage_path)
        if resume_bytes:
            tmp = tempfile.NamedTemporaryFile(
                suffix=".pdf",
                prefix="resume_",
                delete=False,
                dir="/tmp",
            )
            tmp.write(resume_bytes)
            tmp.close()
            resume_path = tmp.name
            add_activity_log(application_id, "Resume downloaded and ready", "success", "uploading_resume")

    # Build the submission task prompt
    task_prompt = _build_submission_task(
        detected_fields, screening_questions, parsed_data, resume_path
    )

    update_application_status(application_id, "applying")
    add_activity_log(application_id, f"Navigating to {job_url}", "action", "applying")

    llm = get_llm(user_id)

    task_with_url = f"Navigate to {job_url} and then:\n\n{task_prompt}"

    add_activity_log(application_id, "Launching browser to fill application form", "action", "applying")

    try:
        async with create_browser() as browser:
            # Restore session cookies if available
            application_data = get_application(application_id)
            saved_cookies = application_data.get("sessionCookies", [])
            if saved_cookies:
                context = await browser.get_browser_context()
                await context.add_cookies(saved_cookies)

            agent = Agent(
                task=task_with_url,
                llm=llm,
                browser=browser,
                available_file_paths=[resume_path] if resume_path else None,
                max_actions_per_step=5,
                max_failures=3,
                step_timeout=90,
                enable_planning=True,
                extend_system_message=EXTEND_SYSTEM,
            )

            raw_output = await run_agent_safely(
                agent=agent,
                browser=browser,
                max_steps=25,
                wall_timeout=540,
            )

            add_activity_log(application_id, "Browser agent completed form filling", "info", "applying")

            try:
                clean = raw_output.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
                fill_result = json.loads(clean)
            except json.JSONDecodeError:
                logger.warning(f"Could not parse fill result: {raw_output[:500]}")
                fill_result = {"success": True, "filled_values": {}}

            if not fill_result.get("success", False):
                reason = fill_result.get("reason", "Unknown form filling failure")
                add_activity_log(application_id, f"Form filling failed: {reason}", "error", "applying")
                raise Exception(reason)

            # Save filled values and capture cookies while browser is still open
            filled_values = fill_result.get("filled_values", {})
            cookies = []
            try:
                ctx = await browser.get_browser_context()
                cookies = await ctx.cookies()
            except Exception:
                pass

            add_activity_log(
                application_id,
                f"Form filled with {len(filled_values)} fields — awaiting your review",
                "success",
                "applying",
            )

            update_application_status(
                application_id,
                "waiting_for_review",
                filledFieldValues=filled_values,
                sessionCookies=cookies,
                currentTaskType=None,
            )

            add_activity_log(
                application_id,
                "Please review the filled answers and confirm submission",
                "info",
                "waiting_for_review",
            )
            logger.info(f"Application {application_id}: waiting for user review")

    except Exception as e:
        error_msg = str(e)[:200]
        logger.error(f"Application {application_id} submission failed: {error_msg}")
        add_activity_log(application_id, f"Application failed: {error_msg}", "error", "applying")
        update_application_status(application_id, "failed", failureReason=error_msg)
    finally:
        if resume_path and os.path.exists(resume_path):
            os.unlink(resume_path)

    # Send notification (only runs if status is waiting_for_review)
    try:
        app_check = get_application(application_id)
        if app_check.get("status") == "waiting_for_review":
            _send_review_notification(application_id, user_id)
    except Exception:
        pass


def _advance_queue(user_id: str):
    """Check for the next queued application and enqueue it."""
    from ..firebase_client import get_db
    from google.cloud import tasks_v2
    from ..config import config

    db = get_db()
    query = (
        db.collection("applications")
        .where("userId", "==", user_id)
        .where("status", "==", "queued")
        .order_by("createdAt")
        .limit(1)
    )
    docs = query.stream()

    next_app = None
    for doc in docs:
        next_app = doc
        break

    if not next_app:
        return

    next_id = next_app.id
    logger.info(f"Advancing queue: starting analysis for {next_id}")

    client = tasks_v2.CloudTasksClient()
    parent = client.queue_path(config.GCP_PROJECT_ID, config.GCP_LOCATION, config.GCP_QUEUE_NAME)

    worker_url = config.WORKER_URL
    payload = json.dumps({"applicationId": next_id, "userId": user_id}).encode()

    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": f"{worker_url}/tasks/analysis",
            "headers": {"Content-Type": "application/json"},
            "body": payload,
            "oidc_token": {
                "service_account_email": config.WORKER_SERVICE_ACCOUNT,
                "audience": worker_url,
            },
        }
    }
    client.create_task(request={"parent": parent, "task": task})


def _send_review_notification(application_id: str, user_id: str):
    """Write a notification for the user to review their application before submission."""
    try:
        db = get_db()
        app_data = get_application(application_id)
        user_doc = db.collection("users").document(user_id).get()
        user_email = user_doc.to_dict().get("email", "") if user_doc.exists else ""
        if not user_email:
            return

        db.collection("mail").add({
            "to": user_email,
            "message": {
                "subject": f"Review your application — {app_data.get('jobTitle', '')} at {app_data.get('company', '')}",
                "html": f"<p>Your application for <strong>{app_data.get('jobTitle', '')}</strong> at <strong>{app_data.get('company', '')}</strong> has been filled out and is ready for review.</p><p><a href='https://kelwin.ai/dashboard/applications/{application_id}'>Review & Submit</a></p>",
            },
        })
    except Exception as e:
        logger.warning(f"Failed to send review notification: {e}")
