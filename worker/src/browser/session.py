from contextlib import asynccontextmanager
import asyncio
import logging
from browser_use import Browser
from ..config import config

logger = logging.getLogger(__name__)


@asynccontextmanager
async def create_browser():
    """Create a managed browser-use Browser instance with production settings."""
    browser = Browser(
        headless=config.BROWSER_USE_HEADLESS,
        disable_security=True,
        args=[
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-software-rasterizer",
            "--disable-extensions",
            "--disable-background-networking",
            "--disable-default-apps",
            "--disable-sync",
            "--disable-translate",
            "--no-first-run",
            "--disable-blink-features=AutomationControlled",
            "--js-flags=--max-old-space-size=512",
        ],
        viewport={"width": 1280, "height": 720},
    )
    try:
        yield browser
    finally:
        try:
            await asyncio.wait_for(browser.close(), timeout=10)
        except Exception as e:
            logger.warning(f"Browser close failed: {e}")
