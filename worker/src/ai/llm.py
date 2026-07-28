import logging
from ..config import config

logger = logging.getLogger(__name__)


def get_llm(user_id: str):
    """Get the browser-use LLM instance optimized for form filling."""
    from browser_use import ChatGoogle

    return ChatGoogle(
        model="gemini-3.6-flash",
        api_key=config.GEMINI_API_KEY,
        temperature=0.1,
        max_output_tokens=4096,
        max_retries=3,
    )
