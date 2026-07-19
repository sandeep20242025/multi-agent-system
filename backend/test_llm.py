import asyncio

from app.services.llm_service import llm_service


async def main():
    response = await llm_service.generate(
        "Explain Multi-Agent AI in 5 lines."
    )

    print(response)


asyncio.run(main())