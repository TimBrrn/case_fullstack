from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel, Field

from dotenv import load_dotenv
from agent.loader import load_datasets
from backend.sse import stream
from agent.agent import create_agent
from agent.context import AgentContext

load_dotenv()

# --- Config ---

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
    expose_headers=["Content-Type"],
)

# --- Startup ---

datasets, dataset_info = load_datasets()
if not datasets:
    raise Exception("Add CSV files to the data/ directory and try again.")

agent = create_agent(dataset_info)


# --- Models ---


class ChatRequest(BaseModel):
    session_id: str = "default"
    question: str = Field(min_length=1)


# --- Routes ---
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(request: ChatRequest) -> EventSourceResponse:
    context = AgentContext(datasets=datasets, dataset_info=dataset_info)
    return EventSourceResponse(
        stream(request.question, agent, context, request.session_id)
    )
