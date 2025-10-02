from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ..services.model_service import generate_offline_response_stream
from ..services.cerebras_service import generate_online_response_stream
from ..services.memory import clear_history
import json

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    query: str
    online: bool = False


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        actual_source = "offline"
        
        if request.online:
            try:
                return StreamingResponse(
                    generate_online_response_stream(request.session_id, request.query),
                    media_type="text/event-stream"
                )
            except Exception as e:
                print(f"Online model failed, falling back to offline: {e}")
                actual_source = "offline"
        
        return StreamingResponse(
            generate_offline_response_stream(request.session_id, request.query),
            media_type="text/event-stream"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/clear/{session_id}")
async def reset_chat(session_id: str):
    clear_history(session_id)
    return {"message": "Chat history cleared."}