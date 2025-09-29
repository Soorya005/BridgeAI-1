from fastapi import APIRouter
from pydantic import BaseModel
from ..services.model_service import generate_response
from ..services.memory import clear_history

router = APIRouter()

class ChatRequest(BaseModel):
    session_id:str
    query:str

class ChatResponse(BaseModel):
    response:str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    reply = generate_response(request.session_id, request.query)
    return ChatResponse(response=reply) # type: ignore

@router.post("/chat/clear/{session_id}")
async def reset_chat(session_id: str):
    clear_history(session_id)
    return {"message": "Chat history cleared."}