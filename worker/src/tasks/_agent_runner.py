import asyncio
import time
import logging

logger = logging.getLogger(__name__)

DEFAULT_WALL_TIMEOUT = 540


class AgentTimeoutError(Exception):
    pass


class AgentLoopError(Exception):
    pass


def create_should_stop(wall_timeout):
    start = time.monotonic()
    _force = False

    async def should_stop():
        if _force or (time.monotonic() - start > wall_timeout):
            return True
        return False

    def force():
        nonlocal _force
        _force = True

    return should_stop, force


async def run_agent_safely(agent, browser, max_steps, wall_timeout=DEFAULT_WALL_TIMEOUT):
    """
    Run a browser-use Agent with all safety mechanisms.
    MUST be called INSIDE the browser context manager.
    Returns the raw final_result string or raises on failure.
    """
    should_stop, force_stop = create_should_stop(wall_timeout)
    agent.register_should_stop_callback = should_stop

    try:
        result = await asyncio.wait_for(
            agent.run(max_steps=max_steps),
            timeout=wall_timeout + 30,
        )
    except asyncio.TimeoutError:
        force_stop()
        raise AgentTimeoutError(f"Agent exceeded {wall_timeout}s timeout")
    except InterruptedError:
        raise AgentTimeoutError("Agent stopped by external callback")

    raw_output = result.final_result()
    if not raw_output:
        raise RuntimeError("Agent completed but produced no output")
    return raw_output
