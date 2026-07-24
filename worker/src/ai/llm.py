import logging
from ..config import config

logger = logging.getLogger(__name__)


def get_llm(user_id: str):
    """Get the browser-use LLM instance based on user's selected provider."""
    from ..firebase_client import get_db

    db = get_db()
    user_doc = db.collection("users").document(user_id).get()
    provider = "gemini"
    if user_doc.exists:
        user_data = user_doc.to_dict()
        provider = user_data.get("selectedAIProvider", "gemini")

    return _create_llm(provider)


def _create_llm(provider: str):
    """Create a browser-use compatible LLM (ChatGoogle, ChatAzureOpenAI, or ChatAnthropic)."""
    if provider == "gemini":
        from browser_use import ChatGoogle

        return ChatGoogle(
            model="gemini-2.0-flash",
            api_key=config.GEMINI_API_KEY,
        )

    elif provider == "azure-openai":
        from browser_use import ChatAzureOpenAI

        return ChatAzureOpenAI(
            model=config.AZURE_OPENAI_DEPLOYMENT or "gpt-4.1",
            azure_endpoint=config.AZURE_OPENAI_ENDPOINT,
            api_key=config.AZURE_OPENAI_API_KEY,
            api_version="2024-12-01-preview",
        )

    elif provider == "bedrock-claude":
        from browser_use import ChatAnthropic

        return ChatAnthropic(
            model="claude-sonnet-4-20250514",
            api_key=config.ANTHROPIC_API_KEY,
        )

    else:
        from browser_use import ChatGoogle

        return ChatGoogle(
            model="gemini-2.0-flash",
            api_key=config.GEMINI_API_KEY,
        )
