from contextlib import asynccontextmanager
from browser_use import Browser
from ..config import config


@asynccontextmanager
async def create_browser():
    """Create a managed browser-use Browser instance with optimized settings."""
    browser = Browser(
        headless=config.BROWSER_USE_HEADLESS,
        args=[
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-blink-features=AutomationControlled",
            "--window-size=1920,1080",
        ],
    )
    try:
        yield browser
    finally:
        await browser.close()
