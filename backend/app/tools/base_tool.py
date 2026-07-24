from abc import ABC, abstractmethod


class BaseTool(ABC):

    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def execute(self, *args, **kwargs):
        pass