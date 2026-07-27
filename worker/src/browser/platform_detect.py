from urllib.parse import urlparse


def detect_platform(url: str) -> str:
    """Detect the ATS platform from a job URL."""
    parsed = urlparse(url)
    hostname = parsed.hostname or ""

    if "greenhouse.io" in hostname or "boards.greenhouse.io" in hostname:
        return "greenhouse"
    if "jobs.lever.co" in hostname or "lever.co" in hostname:
        return "lever"
    if "ashbyhq.com" in hostname or "jobs.ashbyhq.com" in hostname:
        return "ashby"
    if "myworkdayjobs.com" in hostname or "workday.com" in hostname:
        return "workday"
    if "icims.com" in hostname:
        return "icims"
    if "smartrecruiters.com" in hostname:
        return "smartrecruiters"
    if "taleo" in hostname:
        return "taleo"
    if "successfactors" in hostname:
        return "successfactors"

    return "generic"
