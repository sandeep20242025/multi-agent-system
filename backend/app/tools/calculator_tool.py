from app.tools.base_tool import BaseTool


class CalculatorTool(BaseTool):

    def __init__(self):
        super().__init__("calculator")

    async def execute(self, expression: str):

        try:
            result = eval(expression)

            return {
                "success": True,
                "result": result,
            }

        except Exception as e:

            return {
                "success": False,
                "error": str(e),
            }