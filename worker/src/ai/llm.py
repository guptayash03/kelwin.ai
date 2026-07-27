import logging
from ..config import config

logger = logging.getLogger(__name__)


def get_llm(user_id: str):
    """
    Create a configured browser-use LLM instance using Gemini 3.6 Flash.
    
    Returns:
        ChatGoogle: The configured Gemini 3.6 Flash LLM instance.
    """
    from browser_use import ChatGoogle

    return ChatGoogle(
        model="gemini-3.6-flash",
        api_key=config.GEMINI_API_KEY,
    )
