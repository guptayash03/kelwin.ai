from contextlib import asynccontextmanager
from browser_use import Browser
from ..config import config


@asynccontextmanager
async def create_browser():
    """Create a managed browser-use Browser instance."""
    browser = Browser(
        headless=config.BROWSER_USE_HEADLESS,
        args=[
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ],
    )
    try:
        yield browser
    finally:
        await browser.close()
