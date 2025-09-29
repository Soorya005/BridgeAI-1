from fastapi import APIRouter
from pydantic import BaseModel
from ..services.model_service import generate_response

router = APIRouter()

class ChatRequest(BaseModel):
    query:str

class ChatResponse(BaseModel):
    response:str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    reply = generate_response(request.query)
    return ChatResponse(response=reply) # type: ignore