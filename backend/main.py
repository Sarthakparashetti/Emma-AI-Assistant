from uuid import uuid4

import psutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.command_engine import execute_command
from services.title_generator import generate_chat_title
from database.db import initialize_database
from routes.notes import router as notes_router
from routes.security import router as security_router

app = FastAPI(
    title="Emma AI Assistant API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes_router)
app.include_router(security_router)


@app.on_event("startup")
def on_startup():
    initialize_database()


CHAT_ID = str(uuid4())


class ChatRequest(BaseModel):
    chat_id: str | None = None
    message: str


class TitleRequest(BaseModel):
    user_message: str
    assistant_reply: str


@app.get("/")
def home():
    return {
        "status": "online",
        "assistant": "Emma",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/status")
def status():
    return {
        "status": "running"
    }


@app.get("/system")
def system():
    battery = psutil.sensors_battery()

    return {
        "cpu": round(psutil.cpu_percent(interval=0.2), 1),
        "ram": round(psutil.virtual_memory().percent, 1),
        "battery": battery.percent if battery else 100,
        "disk": round(psutil.disk_usage("/").percent, 1),
    }


@app.post("/generate-title")
def generate_title(request: TitleRequest):
    """
    Wires up services/title_generator.py, which existed and worked but
    was never connected to a route. The frontend's api.ts already had a
    generateTitle() call for this endpoint that was never being invoked.
    """

    try:
        title = generate_chat_title(request.user_message, request.assistant_reply)

        return {"title": title}

    except Exception:
        return {"title": request.user_message[:30]}


@app.post("/chat")
def chat(request: ChatRequest):

    try:

        chat_id = request.chat_id or CHAT_ID

        result = execute_command(chat_id, request.message)

        if not result:
            result = "Done."

        return {
            "reply": str(result)
        }

    except Exception as e:

        return {
            "reply": f"Error: {e}"
        }