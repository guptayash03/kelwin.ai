import logging
from ..config import config

logger = logging.getLogger(__name__)


def get_llm(user_id: str):
    """Get the browser-use LLM instance. Uses Gemini 2.5 Pro for accurate form filling."""
    from browser_use import ChatGoogle

    return ChatGoogle(
        model="gemini-2.5-pro",
        api_key=config.GEMINI_API_KEY,
    )
