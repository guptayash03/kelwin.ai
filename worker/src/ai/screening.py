import logging
from ..config import config

logger = logging.getLogger(__name__)

SCREENING_PROMPT = """You are helping a job applicant answer a screening question on a job application form.

Applicant Profile:
- Name: {name}
- Location: {location}
- Skills: {skills}
- Experience: {experience_summary}
- Education: {education_summary}

Job: {job_title} at {company}

Answer the following screening question concisely and professionally.
If it's a yes/no or multiple choice question, just give the answer.
If it requires a written response, keep it to 2-3 sentences maximum.
Be honest but present the applicant in the best light.

Question: {question}
{options_text}

Answer:"""


def _build_profile_context(parsed_data: dict, application: dict) -> dict:
    personal = parsed_data.get("personalInfo", {})
    skills = parsed_data.get("skills", {})
    experience = parsed_data.get("experience", [])
    education = parsed_data.get("education", [])

    all_skills = (
        skills.get("technical", [])
        + skills.get("frameworks", [])
        + skills.get("languages", [])
    )

    exp_summary = "; ".join(
        f"{e.get('title', '')} at {e.get('company', '')}" for e in experience[:3]
    )

    edu_summary = "; ".join(
        f"{e.get('degree', '')} in {e.get('field', '')} from {e.get('institution', '')}"
        for e in education[:2]
    )

    return {
        "name": personal.get("fullName", ""),
        "location": personal.get("location", ""),
        "skills": ", ".join(all_skills[:15]),
        "experience_summary": exp_summary or "Entry-level / Fresh graduate",
        "education_summary": edu_summary,
        "job_title": application.get("jobTitle", ""),
        "company": application.get("company", ""),
    }


async def generate_screening_answers(
    screening_questions: list,
    parsed_data: dict,
    application: dict,
    ai_provider: str,
) -> list:
    """Generate AI answers for all screening questions."""
    context = _build_profile_context(parsed_data, application)

    for question in screening_questions:
        if question.get("aiGeneratedAnswer"):
            continue

        options_text = ""
        if question.get("options"):
            options_text = f"Options: {', '.join(question['options'])}"

        prompt = SCREENING_PROMPT.format(
            question=question["question"],
            options_text=options_text,
            **context,
        )

        try:
            answer = await _call_ai_provider(prompt, ai_provider)
            question["aiGeneratedAnswer"] = answer.strip()
        except Exception as e:
            logger.error(f"Failed to generate answer for: {question['question']}: {e}")
            question["aiGeneratedAnswer"] = ""

    return screening_questions


async def _call_ai_provider(prompt: str, provider: str) -> str:
    """Call the specified AI provider to generate text."""
    if provider == "gemini":
        from google import genai

        client = genai.Client(api_key=config.GEMINI_API_KEY)
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text

    elif provider == "azure-openai":
        from openai import AsyncAzureOpenAI

        client = AsyncAzureOpenAI(
            azure_endpoint=config.AZURE_OPENAI_ENDPOINT,
            api_key=config.AZURE_OPENAI_API_KEY,
            api_version="2024-12-01-preview",
        )
        response = await client.chat.completions.create(
            model=config.AZURE_OPENAI_DEPLOYMENT,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
        )
        return response.choices[0].message.content or ""

    elif provider == "bedrock-claude":
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text

    else:
        return await _call_ai_provider(prompt, "gemini")
