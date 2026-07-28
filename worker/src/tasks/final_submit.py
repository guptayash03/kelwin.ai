import json
import logging
import tempfile
import os
from ..firebase_client import (
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


def _build_final_submit_task(
    filled_values: dict,
    screening_questions: list,
    resume_path: str | None,
) -> str:
    """Build the agent task prompt for final submission with confirmed values."""
    field_instructions = "\nFIELDS TO FILL (user-confirmed values):\n"
    for label, value in filled_values.items():
        field_instructions += f"- {label}: {value}\n"

    screening_instructions = ""
    if screening_questions:
        screening_instructions = "\nSCREENING QUESTIONS:\n"
        for q in screening_questions:
            answer = q.get("aiGeneratedAnswer", "")
            screening_instructions += f"- {q['question']}\n  Answer: {answer}\n"

    resume_instruction = ""
    if resume_path:
        resume_instruction = f"\nRESUME FILE: {resume_path}\nUpload this when you see a resume/CV upload field.\n"

    return f"""You are submitting a job application form. Fill ALL fields with the EXACT values below and submit.
{field_instructions}
{screening_instructions}
{resume_instruction}

INSTRUCTIONS:
1. You are on the application page. If you see an "Apply" button, click it first.
2. Fill ALL fields using the EXACT values provided above.
3. For screening questions, use the answers provided.
4. Upload the resume file if there's a file upload field.
5. After ALL fields are filled, click the Submit/Apply button.
6. Wait for the confirmation page.

IMPORTANT:
- Use the EXACT values provided — these were reviewed and confirmed by the user
- Do NOT modify answers
- If you see a CAPTCHA you cannot solve, report failure

After submission, return JSON (ONLY the JSON, no markdown):
{{"success": true, "confirmation_message": "the confirmation text", "confirmation_url": "the URL after submission"}}

If you cannot complete:
{{"success": false, "reason": "why it failed"}}"""


async def handle_final_submit(application_id: str, user_id: str):
    """Phase 4: Submit the application with user-confirmed field values."""
    from browser_use import Agent

    add_activity_log(application_id, "Starting final submission", "info", "submitting")
    update_application_status(application_id, "submitting")

    application = get_application(application_id)
    profile = get_user_profile(user_id)

    job_url = application["jobUrl"]
    filled_values = application.get("filledFieldValues", {})
    screening_questions = application.get("screeningQuestions", [])
    saved_cookies = application.get("sessionCookies", [])

    # Download resume
    resume_data = profile["resume"]
    storage_path = resume_data.get("storagePath", "")
    resume_path = None

    if storage_path:
        resume_bytes = download_resume(user_id, storage_path)
        if resume_bytes:
            tmp = tempfile.NamedTemporaryFile(
                suffix=".pdf", prefix="resume_", delete=False, dir="/tmp"
            )
            tmp.write(resume_bytes)
            tmp.close()
            resume_path = tmp.name

    task_prompt = _build_final_submit_task(filled_values, screening_questions, resume_path)
    llm = get_llm(user_id)

    add_activity_log(application_id, "Launching browser for final submission", "action", "submitting")

    try:
        async with create_browser() as browser:
            # Restore session cookies if available
            if saved_cookies:
                context = await browser.get_browser_context()
                await context.add_cookies(saved_cookies)

            agent = Agent(
                task=f"Navigate to {job_url} and then:\n\n{task_prompt}",
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
                max_steps=30,
                wall_timeout=540,
            )

            # Parse result INSIDE browser context
            try:
                clean = raw_output.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
                submission_result = json.loads(clean)
            except json.JSONDecodeError:
                submission_result = {"success": False, "reason": f"Could not parse agent output: {raw_output[:100]}"}

            if not submission_result.get("success", False):
                reason = submission_result.get("reason", "Unknown submission failure")
                add_activity_log(application_id, f"Submission failed: {reason}", "error", "submitting")
                raise Exception(reason)

        # Success — update status (browser closed cleanly above)
        from firebase_admin import firestore as fs_admin

        update_application_status(
            application_id,
            "applied",
            confirmationMessage=submission_result.get("confirmation_message"),
            confirmationUrl=submission_result.get("confirmation_url"),
            submittedAt=fs_admin.SERVER_TIMESTAMP,
            currentTaskType=None,
            sessionCookies=None,
        )

        add_activity_log(application_id, "Application submitted successfully!", "success", "applied")
        logger.info(f"Application {application_id} submitted successfully via final_submit")

        # Advance queue
        from .submission import _advance_queue
        _advance_queue(user_id)

    except Exception as e:
        error_msg = str(e)[:200]
        logger.error(f"Application {application_id} final submit failed: {error_msg}")
        add_activity_log(application_id, f"Final submission failed: {error_msg}", "error", "submitting")
        update_application_status(application_id, "failed", failureReason=error_msg)
    finally:
        if resume_path and os.path.exists(resume_path):
            os.unlink(resume_path)
