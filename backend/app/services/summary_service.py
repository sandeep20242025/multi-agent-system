from app.services.llm_service import llm_service


class SummaryService:
    async def generate_summary(self, conversation: str) -> str:
        prompt = f"""
You are an AI assistant.

Summarize the following conversation in less than 150 words.

Conversation:

{conversation}

Return only the summary.
"""

        try:
            summary = await llm_service.generate(prompt)
            return summary.strip()

        except Exception as e:
            print(f"Summary Error: {e}")
            return ""


summary_service = SummaryService()