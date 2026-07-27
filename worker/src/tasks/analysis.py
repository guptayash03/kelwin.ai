import json
import logging
from ..firebase_client import (
    update_application_status,
    get_application,
    get_user_profile,
)
from ..browser.session import create_browser
from ..browser.platform_detect import detect_platform
from ..ai.llm import get_llm

logger = logging.getLogger(__name__)

ANALYSIS_TASK = """You are on a job application page. Your task is to analyze this page and extract all form fields and screening questions.

DO NOT fill any fields or click submit. Only observe and extract information.

Steps:
1. Look at the current page and identify if this is a job application form
2. If you need to click "Apply" or "Apply Now" to get to the actual form, do so
3. Once you see the application form, identify ALL fields including:
   - Text inputs (name, email, phone, URLs, etc.)
   - File upload fields (resume/CV)
   - Dropdown selects
   - Textareas
   - Radio buttons / checkboxes
   - Screening questions (work authorization, salary expectations, years of experience, etc.)
4. For each field, note: the label, whether it's required, field type, and any dropdown options

Return your findings as a JSON object with this EXACT structure (output ONLY the JSON, no markdown):
{{
  "detected_fields": [
    {{
      "fieldId": "unique_id",
      "label": "Field Label",
      "type": "text|email|phone|url|select|textarea|file|checkbox|radio",
      "required": true/false,
      "options": ["option1", "option2"]
    }}
  ],
  "screening_questions": [
    {{
      "questionId": "unique_id",
      "question": "The full question text",
      "type": "text|textarea|select|radio",
      "required": true/false,
      "options": ["option1", "option2"]
    }}
  ]
}}

Screening questions are typically about: work authorization, visa sponsorship, relocation, salary expectations, years of experience, start date, why you want to work here, cover letters, or any open-ended question.

Regular fields are: name, email, phone, LinkedIn, GitHub, portfolio/website, location, resume upload."""


def compare_profile_to_fields(detected_fields: list, parsed_data: dict) -> list:
    """Compare detected form fields against user profile. Returns missing field names."""
    missing = []
    personal = parsed_data.get("personalInfo", {})

    profile_data = {
        "email": personal.get("email"),
        "phone": personal.get("phone"),
        "name": personal.get("fullName"),
        "full name": personal.get("fullName"),
        "first name": personal.get("fullName", "").split(" ")[0] if personal.get("fullName") else None,
        "last name": personal.get("fullName", "").split(" ")[-1] if personal.get("fullName") else None,
        "linkedin": personal.get("linkedIn"),
        "github": personal.get("github"),
        "portfolio": personal.get("portfolio") or personal.get("website"),
        "website": personal.get("website") or personal.get("portfolio"),
        "location": personal.get("location"),
        "city": personal.get("location"),
    }

    for field in detected_fields:
        if not field.get("required"):
            continue

        label_lower = field.get("label", "").lower()
        field_type = field.get("type", "")

        if field_type == "file":
            continue

        matched = False
        for key, value in profile_data.items():
            if key in label_lower and value:
                field["mappedProfileField"] = key
                field["value"] = value
                matched = True
                break

        if not matched and field.get("required"):
            if field_type in ("textarea", "select", "radio"):
                continue
            missing.append(field.get("label", "Unknown field"))

    return missing


async def handle_analysis(application_id: str, user_id: str):
    """Phase 1: Use browser-use Agent to analyze the application form."""
    from browser_use import Agent

    update_application_status(application_id, "detecting_platform")

    application = get_application(application_id)
    job_url = application["jobUrl"]

    platform = detect_platform(job_url)
    logger.info(f"Detected platform: {platform} for {job_url}")

    update_application_status(application_id, "analyzing_application")

    llm = get_llm(user_id)

    task_with_url = f"Navigate to {job_url} and then:\n\n{ANALYSIS_TASK}"

    async with create_browser() as browser:
        agent = Agent(
            task=task_with_url,
            llm=llm,
            browser=browser,
            max_actions_per_step=10,
            max_steps=20,
        )

        result = await agent.run()

    raw_output = result.final_result()
    if not raw_output:
        raise Exception("Agent failed to extract form fields")

    try:
        clean = raw_output.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
        extracted = json.loads(clean)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse agent output: {raw_output[:500]}")
        raise Exception(f"Failed to parse form analysis: {e}")

    detected_fields = extracted.get("detected_fields", [])
    screening_questions = extracted.get("screening_questions", [])

    update_application_status(application_id, "comparing_profile")

    profile = get_user_profile(user_id)
    parsed_data = profile["parsedData"]

    missing_fields = compare_profile_to_fields(detected_fields, parsed_data)

    if missing_fields:
        update_application_status(
            application_id,
            "missing_profile_info",
            platform=platform,
            detectedFields=detected_fields,
            screeningQuestions=screening_questions,
            missingFields=missing_fields,
            currentTaskType=None,
        )
        logger.info(f"Application {application_id}: missing fields: {missing_fields}")
    else:
        update_application_status(
            application_id,
            "ready_to_apply",
            platform=platform,
            detectedFields=detected_fields,
            screeningQuestions=screening_questions,
            missingFields=[],
            currentTaskType="submission",
        )
        logger.info(f"Application {application_id}: ready to apply, enqueueing submission")
        _enqueue_submission(application_id, user_id)


def _enqueue_submission(application_id: str, user_id: str):
    """Enqueue Phase 2 (submission) Cloud Task."""
    from google.cloud import tasks_v2
    from ..config import config

    client = tasks_v2.CloudTasksClient()
    parent = client.queue_path(config.GCP_PROJECT_ID, config.GCP_LOCATION, config.GCP_QUEUE_NAME)

    worker_url = config.WORKER_URL
    payload = json.dumps({"applicationId": application_id, "userId": user_id}).encode()

    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": f"{worker_url}/tasks/submission",
            "headers": {"Content-Type": "application/json"},
            "body": payload,
            "oidc_token": {
                "service_account_email": config.WORKER_SERVICE_ACCOUNT,
                "audience": worker_url,
            },
        }
    }
    client.create_task(request={"parent": parent, "task": task})
