import logging
from ..config import config

logger = logging.getLogger(__name__)


def get_llm(user_id: str):
    """Get the browser-use LLM instance. Uses Gemini 3.5 Flash for fast, accurate form filling."""
    from browser_use import ChatGoogle

    return ChatGoogle(
        model="gemini-3.6-flash",
        api_key=config.GEMINI_API_KEY,
    )
