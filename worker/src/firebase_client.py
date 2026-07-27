import firebase_admin
from firebase_admin import credentials, firestore, storage
from .config import config

_initialized = False


def _ensure_init():
    global _initialized
    if _initialized:
        return
    if not firebase_admin._apps:
        try:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                "projectId": config.FIREBASE_PROJECT_ID,
                "storageBucket": config.FIREBASE_STORAGE_BUCKET,
            })
        except Exception:
            pass
    _initialized = True


def get_db():
    _ensure_init()
    return firestore.client()


def get_bucket():
    _ensure_init()
    return storage.bucket()


def update_application_status(application_id: str, status: str, **extra_fields):
    db = get_db()
    doc_ref = db.collection("applications").document(application_id)
    update_data = {
        "status": status,
        "updatedAt": firestore.SERVER_TIMESTAMP,
        **extra_fields,
    }
    doc_ref.update(update_data)


def get_application(application_id: str) -> dict:
    db = get_db()
    doc = db.collection("applications").document(application_id).get()
    if not doc.exists:
        raise ValueError(f"Application {application_id} not found")
    return {"id": doc.id, **doc.to_dict()}


def get_user_profile(user_id: str) -> dict:
    db = get_db()
    user_doc = db.collection("users").document(user_id).get()
    if not user_doc.exists:
        raise ValueError(f"User {user_id} not found")
    user_data = user_doc.to_dict()

    resume_id = user_data.get("resumeId")
    if not resume_id:
        raise ValueError("User has no resume")

    resume_doc = db.collection("resumes").document(resume_id).get()
    if not resume_doc.exists:
        raise ValueError(f"Resume {resume_id} not found")

    resume_data = resume_doc.to_dict()
    return {
        "user": user_data,
        "resume": resume_data,
        "parsedData": resume_data.get("parsedData", {}),
    }


def add_activity_log(application_id: str, message: str, level: str = "info", step: str = None):
    db = get_db()
    log_data = {
        "level": level,
        "message": message,
        "step": step,
        "timestamp": firestore.SERVER_TIMESTAMP,
    }
    db.collection("applications").document(application_id).collection("logs").add(log_data)


def download_resume(user_id: str, storage_path: str) -> bytes:
    bucket = get_bucket()
    blob = bucket.blob(storage_path)
    return blob.download_as_bytes()
