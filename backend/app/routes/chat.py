from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ..services.model_service import generate_offline_response_stream
from ..services.cerebras_service import generate_online_response_stream
from ..services.memory import clear_history, get_history
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    session_id: str
    query: str
    online: bool = False


class LocalStreamRequest(BaseModel):
    """Request format for MCP Gateway to call local model"""
    messages: list
    session_id: str


def safe_online_stream_with_fallback(session_id: str, query: str):
    """
    Wrapper generator that attempts online streaming but falls back to offline on any error.
    This handles errors that occur during the streaming process itself.
    """
    try:
        # Try to get the online generator
        online_gen = generate_online_response_stream(session_id, query)
        
        # Try to start streaming from online model
        for chunk in online_gen:
            yield chunk
            
    except Exception as e:
        # If any error occurs during online streaming, fall back to offline
        logger.warning(f"Online model failed during streaming, falling back to offline: {e}")
        
        # Send a notification chunk about the fallback
        yield f"data: {json.dumps({'content': '', 'fallback': True, 'source': 'offline'})}\n\n"
        
        # Stream from offline model
        try:
            offline_gen = generate_offline_response_stream(session_id, query)
            for chunk in offline_gen:
                yield chunk
        except Exception as offline_error:
            logger.error(f"Offline model also failed: {offline_error}")
            yield f"data: {json.dumps({'error': 'Both models failed', 'content': 'Error: Could not generate response.'})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        if request.online:
            # Use the safe wrapper that handles fallback during streaming
            return StreamingResponse(
                safe_online_stream_with_fallback(request.session_id, request.query),
                media_type="text/event-stream"
            )
        else:
            # Direct offline streaming
            return StreamingResponse(
                generate_offline_response_stream(request.session_id, request.query),
                media_type="text/event-stream"
            )

    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/clear/{session_id}")
async def reset_chat(session_id: str):
    clear_history(session_id)
    return {"message": "Chat history cleared."}


@router.post("/local/stream")
async def local_stream_endpoint(request: LocalStreamRequest):
    """
    Endpoint for MCP Gateway to call when routing to local model
    Accepts standard messages format and streams response
    """
    try:
        # Extract the user query from messages
        user_message = None
        for msg in reversed(request.messages):
            if msg.get("role") == "user":
                user_message = msg.get("content")
                break
        
        if not user_message:
            raise HTTPException(status_code=400, detail="No user message found")
        
        # Stream from local model
        return StreamingResponse(
            generate_offline_response_stream(request.session_id, user_message),
            media_type="text/event-stream"
        )
    
    except Exception as e:
        logger.error(f"Local stream endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))