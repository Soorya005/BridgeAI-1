# type: ignore
import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras
from ..config import SYSTEM_PROMPT_ONLINE
from .memory import get_history, add_to_history

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
API_KEY = os.getenv("CEREBRAS_API_KEY", "")

# Initialize client only if API key is available
# In Docker setup, MCP Gateway handles Cerebras calls, so this is optional
cerebras_client = None
if API_KEY:
    cerebras_client = Cerebras(api_key=API_KEY)
    logger.info("Cerebras client initialized")
else:
    logger.warning("CEREBRAS_API_KEY not found - MCP Gateway will handle online requests")

CEREMODEL = "llama-3.3-70b"

def log_api_usage(session_id: str, usage_info: Any, model_used: str):
    """Log API usage to a file for later analysis."""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "session_id": session_id,
        "model_requested": CEREMODEL,
        "model_used": model_used,
        "prompt_tokens": usage_info.prompt_tokens,
        "completion_tokens": usage_info.completion_tokens,
        "total_tokens": usage_info.total_tokens
    }
    
    with open("cerebras_usage.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

def generate_online_response_stream(session_id: str, user_input: str):
    """Generator function for streaming Cerebras responses."""
    global cerebras_client
    
    # Check if client is available
    if cerebras_client is None:
        logger.error("Cerebras client not initialized - API key missing")
        raise ValueError("Cerebras API key not configured. Please set CEREBRAS_API_KEY environment variable.")
    
    history = get_history(session_id)
    
    messages: List[Any] = [
        {"role": "system", "content": SYSTEM_PROMPT_ONLINE}
    ]
    messages.extend(history)
    messages.append({"role": "user", "content": user_input})

    try:
        response = cerebras_client.chat.completions.create(
            model=CEREMODEL,
            messages=messages,  # type: ignore
            temperature=0.8,
            max_tokens=1024,
            stream=True
        )
        
        full_response = ""
        usage_info = None
        model_used = None
        
        for chunk in response:
            if hasattr(chunk, 'model'):
                model_used = chunk.model
            
            if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    full_response += delta.content
                    # Yield chunk to client
                    yield f"data: {json.dumps({'content': delta.content, 'source': 'online'})}\n\n"
            
            if hasattr(chunk, 'usage') and chunk.usage:
                usage_info = chunk.usage
        
        # Send completion signal
        yield f"data: {json.dumps({'done': True})}\n\n"
        
        # Log usage and check for model mismatch
        if usage_info and model_used:
            log_api_usage(session_id, usage_info, model_used)
            logger.info(
                f"Cerebras API Call | Model: {model_used} | "
                f"Session: {session_id[:8]}... | "
                f"Tokens: {usage_info.total_tokens}"
            )
            
            if model_used != CEREMODEL:
                logger.warning(
                    f"Model mismatch! Requested: {CEREMODEL}, "
                    f"Got: {model_used}"
                )
        
        # Save to history with 'online' source marker
        add_to_history(session_id, "user", user_input, source="online")
        add_to_history(session_id, "assistant", full_response.strip(), source="online")

    except Exception as e:
        logger.error(f"Cerebras API error: {e}")
        raise ValueError(f"Failed to generate response: {str(e)}")

# def generate_online_response(session_id: str, user_input: str) -> str:
#     """Generate a non-streaming response using the Cerebras API (for backward compatibility)."""
#     history = get_history(session_id)
    
#     messages: List[Any] = [
#         {"role": "system", "content": SYSTEM_PROMPT}
#     ]
#     messages.extend(history)
#     messages.append({"role": "user", "content": user_input})

#     try:
#         response = cerebras_client.chat.completions.create(
#             model=CEREMODEL,
#             messages=messages,  # type: ignore
#             temperature=0.7,
#             max_tokens=256,
#             stream=True
#         )
        
#         full_response = ""
#         usage_info = None
#         model_used = None
        
#         for chunk in response:
#             if hasattr(chunk, 'model'):
#                 model_used = chunk.model
            
#             if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
#                 delta = chunk.choices[0].delta
#                 if hasattr(delta, 'content') and delta.content:
#                     full_response += delta.content
            
#             if hasattr(chunk, 'usage') and chunk.usage:
#                 usage_info = chunk.usage
        
#         # Log usage and check for model mismatch
#         if usage_info and model_used:
#             log_api_usage(session_id, usage_info, model_used)
#             logger.info(
#                 f"Cerebras API Call | Model: {model_used} | "
#                 f"Session: {session_id[:8]}... | "
#                 f"Tokens: {usage_info.total_tokens}"
#             )
            
#             if model_used != CEREMODEL:
#                 logger.warning(
#                     f"Model mismatch! Requested: {CEREMODEL}, "
#                     f"Got: {model_used}"
#                 )
        
#         if not full_response:
#             raise ValueError("No content generated from stream")
        
#         add_to_history(session_id, "user", user_input)
#         add_to_history(session_id, "assistant", full_response.strip())
            
#         return full_response.strip()

#     except Exception as e:
#         logger.error(f"Cerebras API error: {e}")
#         raise ValueError(f"Failed to generate response: {str(e)}")