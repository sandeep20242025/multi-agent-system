from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.connections = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections[session_id] = websocket

    def disconnect(self, session_id: str):
        self.connections.pop(session_id, None)

    async def send(self, session_id: str, message: dict):
        websocket = self.connections.get(session_id)
        if websocket:
            await websocket.send_json(message)


manager = ConnectionManager()
