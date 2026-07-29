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

    from .firebase_client import get_db, update_application_status, add_activity_log
    from google.cloud.firestore_v1 import transactional

    db = get_db()
    app_ref = db.collection("applications").document(application_id)

    @transactional
    def claim_for_analysis(transaction):
        snapshot = app_ref.get(transaction=transaction)
        if not snapshot.exists:
            return "not_found"
        data = snapshot.to_dict()
        if data.get("status") in ("failed", "applied", "analyzing"):
            return data.get("status")
        transaction.update(app_ref, {"status": "analyzing", "currentTaskType": "analysis"})
        return None

    transaction = db.transaction()
    existing_status = claim_for_analysis(transaction)
    if existing_status:
        logger.info(f"Skipping analysis for {application_id}: already {existing_status}")
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


@app.post("/tasks/login")
async def task_login(request: Request):
    if not verify_oidc_token(request):
        raise HTTPException(status_code=401, detail="Invalid OIDC token")

    body = await request.json()
    application_id = body.get("applicationId")
    user_id = body.get("userId")
    otp_code = body.get("otpCode")

    if not application_id or not user_id:
        raise HTTPException(status_code=400, detail="Missing applicationId or userId")

    from .firebase_client import get_db, update_application_status, add_activity_log
    from google.cloud.firestore_v1 import transactional

    db = get_db()
    app_ref = db.collection("applications").document(application_id)

    @transactional
    def claim_for_login(transaction):
        snapshot = app_ref.get(transaction=transaction)
        if not snapshot.exists:
            return "not_found"
        data = snapshot.to_dict()
        if data.get("status") in ("failed", "applied", "applying"):
            return data.get("status")
        transaction.update(app_ref, {"status": "applying", "currentTaskType": "login"})
        return None

    transaction = db.transaction()
    existing_status = claim_for_login(transaction)
    if existing_status:
        logger.info(f"Skipping login for {application_id}: already {existing_status}")
        return {"status": "skipped"}

    logger.info(f"Starting login for application {application_id}")

    try:
        from .tasks.login import handle_login

        await handle_login(application_id, user_id, otp_code)
        return {"status": "completed"}
    except Exception as e:
        logger.error(f"Login failed for {application_id}: {e}")
        add_activity_log(application_id, f"Login failed: {e}", "error")
        update_application_status(
            application_id,
            "failed",
            failureReason=str(e),
            currentTaskType="login",
        )
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

    from .firebase_client import get_db, update_application_status, add_activity_log
    from google.cloud.firestore_v1 import transactional

    db = get_db()
    app_ref = db.collection("applications").document(application_id)

    @transactional
    def claim_for_submission(transaction):
        snapshot = app_ref.get(transaction=transaction)
        if not snapshot.exists:
            return "not_found"
        data = snapshot.to_dict()
        if data.get("status") in ("failed", "applied", "applying"):
            return data.get("status")
        transaction.update(app_ref, {"status": "applying", "currentTaskType": "submission"})
        return None

    transaction = db.transaction()
    existing_status = claim_for_submission(transaction)
    if existing_status:
        logger.info(f"Skipping submission for {application_id}: already {existing_status}")
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


@app.post("/tasks/final_submit")
async def task_final_submit(request: Request):
    if not verify_oidc_token(request):
        raise HTTPException(status_code=401, detail="Invalid OIDC token")

    body = await request.json()
    application_id = body.get("applicationId")
    user_id = body.get("userId")
    otp_code = body.get("otpCode")

    if not application_id or not user_id:
        raise HTTPException(status_code=400, detail="Missing applicationId or userId")

    from .firebase_client import get_db, update_application_status, add_activity_log
    from google.cloud.firestore_v1 import transactional

    db = get_db()
    app_ref = db.collection("applications").document(application_id)

    @transactional
    def claim_for_final_submit(transaction):
        snapshot = app_ref.get(transaction=transaction)
        if not snapshot.exists:
            return "not_found"
        data = snapshot.to_dict()
        if data.get("status") in ("failed", "applied", "submitting"):
            return data.get("status")
        transaction.update(app_ref, {"status": "submitting", "currentTaskType": "final_submit"})
        return None

    transaction = db.transaction()
    existing_status = claim_for_final_submit(transaction)
    if existing_status:
        logger.info(f"Skipping final submit for {application_id}: already {existing_status}")
        return {"status": "skipped"}

    logger.info(f"Starting final submit for application {application_id}")

    try:
        from .tasks.final_submit import handle_final_submit, handle_verification_code

        if otp_code:
            await handle_verification_code(application_id, user_id, otp_code)
        else:
            await handle_final_submit(application_id, user_id)
        return {"status": "completed"}
    except Exception as e:
        logger.error(f"Final submit failed for {application_id}: {e}")
        add_activity_log(application_id, f"Final submission failed: {e}", "error")
        update_application_status(
            application_id,
            "failed",
            failureReason=str(e),
            currentTaskType="final_submit",
        )
        return {"status": "failed", "error": str(e)}
