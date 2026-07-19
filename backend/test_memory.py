import asyncio

from app.services.memory_service import memory_service


async def main():

    session = "demo-session"

    await memory_service.save_message(
        session,
        "user",
        "Hello"
    )

    await memory_service.save_message(
        session,
        "assistant",
        "Hi! How can I help you?"
    )

    history = await memory_service.get_history(session)

    print(history)


asyncio.run(main())