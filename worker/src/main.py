import logging
from fastapi import FastAPI, Request, HTTPException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Kelwin AI Worker")


def verify_oidc_token(request: Request) -> bool:
    """Verify the OIDC token from Cloud Tasks."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return False

    token = auth_header.replace("Bearer ", "")
    try:
        from google.auth.transport import requests as google_requests
        from google.oauth2 import id_token

        id_token.verify_oauth2_token(token, google_requests.Request())
        return True
    except Exception as e:
        logger.warning(f"OIDC verification failed: {e}")
        return False


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/tasks/analysis")
async def task_analysis(request: Request):
    if not verify_oidc_token(request):
        raise HTTPException(status_code=401, detail="Invalid OIDC token")

    body = await request.json()
    application_id = body.get("applicationId")
    user_id = body.get("userId")

    if not application_id or not user_id:
        raise HTTPException(status_code=400, detail="Missing applicationId or userId")

    from .firebase_client import get_application, update_application_status, add_activity_log

    # Guard: skip if already terminal
    app_doc = get_application(application_id)
    if app_doc.get("status") in ("failed", "applied"):
        logger.info(f"Skipping analysis for {application_id}: already {app_doc['status']}")
        return {"status": "skipped"}

    logger.info(f"Starting analysis for application {application_id}")

    try:
        from .tasks.analysis import handle_analysis

        await handle_analysis(application_id, user_id)
        return {"status": "completed"}
    except Exception as e:
        logger.error(f"Analysis failed for {application_id}: {e}")
        add_activity_log(application_id, f"Analysis failed: {e}", "error")
        update_application_status(
            application_id,
            "failed",
            failureReason=str(e),
            currentTaskType="analysis",
        )
        # Return 200 so Cloud Tasks does NOT retry
        return {"status": "failed", "error": str(e)}


@app.post("/tasks/submission")
async def task_submission(request: Request):
    if not verify_oidc_token(request):
        raise HTTPException(status_code=401, detail="Invalid OIDC token")

    body = await request.json()
    application_id = body.get("applicationId")
    user_id = body.get("userId")

    if not application_id or not user_id:
        raise HTTPException(status_code=400, detail="Missing applicationId or userId")

    from .firebase_client import get_application, update_application_status, add_activity_log

    # Guard: skip if already terminal
    app_doc = get_application(application_id)
    if app_doc.get("status") in ("failed", "applied"):
        logger.info(f"Skipping submission for {application_id}: already {app_doc['status']}")
        return {"status": "skipped"}

    logger.info(f"Starting submission for application {application_id}")

    try:
        from .tasks.submission import handle_submission

        await handle_submission(application_id, user_id)
        return {"status": "completed"}
    except Exception as e:
        logger.error(f"Submission failed for {application_id}: {e}")
        add_activity_log(application_id, f"Submission failed: {e}", "error")
        update_application_status(
            application_id,
            "failed",
            failureReason=str(e),
            currentTaskType="submission",
        )
        # Return 200 so Cloud Tasks does NOT retry
        return {"status": "failed", "error": str(e)}
