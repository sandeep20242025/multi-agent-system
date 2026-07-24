from app.tools.calculator_tool import CalculatorTool


class ToolRegistry:

    def __init__(self):

        self.tools = {
            "calculator": CalculatorTool(),
        }

    def get(self, name):

        return self.tools.get(name)

    def list_tools(self):

        return list(self.tools.keys())


tool_registry = ToolRegistry()