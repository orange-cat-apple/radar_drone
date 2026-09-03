import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse

app = FastAPI()
FILE_PATH = '/home/fullord/radar_drone_ws/data/offline_queue.jsonl'

@app.get("/")
async def get_index():
    return FileResponse("index.html")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    while not os.path.exists(FILE_PATH):
        await asyncio.sleep(1)
        
    try:
        with open(FILE_PATH, 'r') as file:
            file.seek(0, 0)
            while True:
                line = file.readline()
                if not line:
                    await asyncio.sleep(0.1)
                    continue
                await websocket.send_text(line)
    except WebSocketDisconnect:
        pass