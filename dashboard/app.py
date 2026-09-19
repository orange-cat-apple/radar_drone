import os
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FILE_PATH = '/home/fullord/radar_drone_ws/data/offline_queue.jsonl'

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
                
                clean_line = line.strip()
                if clean_line:
                    await websocket.send_text(clean_line)
                    
    except WebSocketDisconnect:
        pass
