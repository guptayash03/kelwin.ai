import os


class Config:
    FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "")
    FIREBASE_STORAGE_BUCKET = os.environ.get("FIREBASE_STORAGE_BUCKET", "")

    GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "")
    GCP_LOCATION = os.environ.get("GCP_LOCATION", "asia-south1")
    GCP_QUEUE_NAME = os.environ.get("GCP_QUEUE_NAME", "application-tasks")

    WORKER_URL = os.environ.get("WORKER_URL", "")
    WORKER_SERVICE_ACCOUNT = os.environ.get(
        "WORKER_SERVICE_ACCOUNT", "kelwin-worker@kelwin-ai-app.iam.gserviceaccount.com"
    )

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY", "")
    AZURE_OPENAI_DEPLOYMENT = os.environ.get("AZURE_OPENAI_DEPLOYMENT", "")
    ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
    AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

    BROWSER_USE_HEADLESS = os.environ.get("BROWSER_USE_HEADLESS", "true").lower() == "true"


config = Config()
