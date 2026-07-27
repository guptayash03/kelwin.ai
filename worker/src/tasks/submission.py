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

logger = logging.getLogger(__name__)


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
        resume_instruction = f"\nRESUME FILE TO UPLOAD: {resume_path}\nUpload this file when you see a resume/CV file upload field.\n"

    return f"""You are filling out a job application form. Complete ALL fields and submit the application.

{profile_info}
{field_instructions}
{screening_instructions}
{resume_instruction}

INSTRUCTIONS:
1. You are already on the application page. If you see an "Apply" button to get to the form, click it first.
2. Fill in ALL form fields using the applicant's profile data above.
3. For screening questions, use the provided answers above. If no answer is provided, give a brief professional answer based on the profile.
4. For dropdown/select fields, choose the most appropriate option.
5. Upload the resume file if there's a file upload field.
6. After ALL fields are filled, click the Submit/Apply button.
7. Wait for the confirmation page to load.
8. Report the confirmation message or URL you see after submission.

IMPORTANT:
- Fill fields carefully and accurately
- Do NOT skip required fields
- Do NOT submit until all required fields are filled
- If you see a CAPTCHA or verification you cannot solve, report it as a failure

After submission, return a JSON response (ONLY the JSON, no markdown):
{{"success": true, "confirmation_message": "the confirmation text you see", "confirmation_url": "the current URL after submission"}}

If you cannot complete the submission, return:
{{"success": false, "reason": "why it failed"}}"""


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
            agent = Agent(
                task=task_with_url,
                llm=llm,
                browser=browser,
                available_file_paths=[resume_path] if resume_path else None,
                max_actions_per_step=15,
                max_steps=50,
            )

            result = await agent.run()
    finally:
        if resume_path and os.path.exists(resume_path):
            os.unlink(resume_path)

    add_activity_log(application_id, "Browser agent completed form filling", "info", "applying")

    raw_output = result.final_result()
    if not raw_output:
        add_activity_log(application_id, "Agent failed to complete form submission", "error", "applying")
        raise Exception("Agent failed to complete form submission")

    try:
        clean = raw_output.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
        submission_result = json.loads(clean)
    except json.JSONDecodeError:
        logger.warning(f"Could not parse submission result: {raw_output[:500]}")
        submission_result = {"success": True, "confirmation_message": raw_output[:200]}

    if not submission_result.get("success", False):
        reason = submission_result.get("reason", "Unknown submission failure")
        add_activity_log(application_id, f"Submission failed: {reason}", "error", "applying")
        raise Exception(reason)

    # Mark as applied
    update_application_status(application_id, "submitting")
    add_activity_log(application_id, "Submitting application", "action", "submitting")

    from firebase_admin import firestore as fs

    update_application_status(
        application_id,
        "applied",
        confirmationMessage=submission_result.get("confirmation_message"),
        confirmationUrl=submission_result.get("confirmation_url"),
        submittedAt=fs.SERVER_TIMESTAMP,
        currentTaskType=None,
    )

    add_activity_log(application_id, "Application submitted successfully!", "success", "applied")
    logger.info(f"Application {application_id} submitted successfully")

    # Advance queue
    _advance_queue(user_id)


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
