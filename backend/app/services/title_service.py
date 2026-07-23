from app.services.llm_service import llm_service


class TitleService:

    async def generate_title(self, message: str) -> str:
        prompt = f"""
Generate a short chat title (maximum 5 words).

User message:
{message}

Return ONLY the title.
"""

        try:
            title = await llm_service.generate(prompt)
            return title.strip().replace('"', "")
        except Exception:
            return message[:40]


title_service = TitleService()