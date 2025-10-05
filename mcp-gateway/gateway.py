# type: ignore
"""
MCP Gateway - Network-aware routing between Cerebras and local model
Automatically detects internet connectivity and routes requests accordingly
"""
import os
import json
import logging
import asyncio
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="MCP Gateway", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY", "")
CEREBRAS_MODEL = "llama-3.3-70b"

# System prompts from config
SYSTEM_PROMPT_ONLINE = """You are BridgeAI (online mode) - an advanced AI powered by Cerebras, built by Team Cyber_Samurais for FutureStack GenAI Hackathon 2025.

On first query: briefly introduce yourself (name, creator, purpose), then answer.

ONLINE CAPABILITIES:
- Detailed, comprehensive answers with clear structure
- Markdown formatting: headers, lists, **bold**, *italic*
- Examples and step-by-step explanations
- Context, analogies, and deeper insights
- Educational and thorough responses

Respond naturally and completely without meta-commentary about response length."""

# Cerebras client (lazy initialization)
cerebras_client = None


class ChatRequest(BaseModel):
    messages: list
    session_id: str
    stream: bool = True


class NetworkStatus(BaseModel):
    online: bool
    cerebras_available: bool
    last_check: str


# Network detection cache
network_cache = {
    "online": False,
    "cerebras_available": False,
    "last_check": None,
    "check_interval": 10  # seconds
}


async def check_internet_connectivity() -> bool:
    """Check if internet is available by pinging reliable endpoints"""
    test_urls = [
        "https://www.google.com",
        "https://1.1.1.1",  # Cloudflare DNS
        "https://8.8.8.8",  # Google DNS
    ]
    
    async with httpx.AsyncClient(timeout=3.0) as client:
        for url in test_urls:
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    logger.info(f"Internet connectivity confirmed via {url}")
                    return True
            except Exception as e:
                logger.debug(f"Failed to reach {url}: {e}")
                continue
    
    logger.warning("No internet connectivity detected")
    return False


async def check_cerebras_availability() -> bool:
    """Check if Cerebras API is available and responding"""
    if not CEREBRAS_API_KEY:
        logger.warning("No Cerebras API key configured")
        return False
    
    try:
        global cerebras_client
        if cerebras_client is None:
            cerebras_client = Cerebras(api_key=CEREBRAS_API_KEY)
        
        # Try a minimal API call to check availability
        # This is a lightweight check
        response = cerebras_client.chat.completions.create(
            model=CEREBRAS_MODEL,
            messages=[{"role": "user", "content": "test"}],
            max_tokens=1,
            stream=False
        )
        
        logger.info("Cerebras API is available")
        return True
    except Exception as e:
        logger.error(f"Cerebras API unavailable: {e}")
        return False


async def detect_network_status() -> dict:
    """
    Comprehensive network detection
    Returns: dict with online and cerebras_available status
    """
    import datetime
    
    # Check if we need to refresh (avoid checking too frequently)
    now = datetime.datetime.now()
    if network_cache["last_check"]:
        elapsed = (now - network_cache["last_check"]).seconds
        if elapsed < network_cache["check_interval"]:
            logger.info("Using cached network status")
            return {
                "online": network_cache["online"],
                "cerebras_available": network_cache["cerebras_available"]
            }
    
    # Perform network checks
    logger.info("Performing network detection...")
    
    # Check internet connectivity
    online = await check_internet_connectivity()
    network_cache["online"] = online
    
    # Check Cerebras availability (only if online)
    cerebras_available = False
    if online:
        cerebras_available = await check_cerebras_availability()
    
    network_cache["cerebras_available"] = cerebras_available
    network_cache["last_check"] = now
    
    logger.info(f"Network status: Online={online}, Cerebras={cerebras_available}")
    
    return {
        "online": online,
        "cerebras_available": cerebras_available
    }


async def stream_from_cerebras(messages: list, session_id: str):
    """Stream response from Cerebras API with proper system prompt"""
    global cerebras_client
    
    if cerebras_client is None:
        cerebras_client = Cerebras(api_key=CEREBRAS_API_KEY)
    
    # Ensure system prompt is present (prepend if not already there)
    if not messages or messages[0].get("role") != "system":
        messages = [{"role": "system", "content": SYSTEM_PROMPT_ONLINE}] + messages
    
    try:
        response = cerebras_client.chat.completions.create(
            model=CEREBRAS_MODEL,
            messages=messages,
            temperature=0.8,
            max_tokens=1024,
            stream=True
        )
        
        for chunk in response:
            if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    yield f"data: {json.dumps({'content': delta.content, 'source': 'online'})}\n\n"
        
        yield f"data: {json.dumps({'done': True, 'source': 'online'})}\n\n"
        
    except Exception as e:
        logger.error(f"Cerebras streaming error: {e}")
        raise


async def stream_from_local_model(messages: list, session_id: str):
    """Forward to local model service (llama.cpp)"""
    # Forward request to the backend's local model service
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            # Call the backend's local model endpoint
            response = await client.post(
                "http://backend:8000/api/local/stream",
                json={"messages": messages, "session_id": session_id},
                timeout=120.0
            )
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    yield f"{line}\n\n"
                    
        except Exception as e:
            logger.error(f"Local model streaming error: {e}")
            yield f"data: {json.dumps({'error': str(e), 'content': 'Local model failed'})}\n\n"


@app.get("/")
def root():
    return {"service": "MCP Gateway", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint with network status"""
    status = await detect_network_status()
    return {
        "status": "healthy",
        "online": status["online"],
        "cerebras_available": status["cerebras_available"]
    }


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint with automatic routing
    Routes to Cerebras if online, falls back to local model if offline
    """
    try:
        # Detect network status
        network_status = await detect_network_status()
        
        # Decide routing
        use_cerebras = network_status["cerebras_available"]
        
        logger.info(f"Routing request: {'CEREBRAS' if use_cerebras else 'LOCAL MODEL'}")
        
        if use_cerebras:
            # Try Cerebras first
            try:
                return StreamingResponse(
                    stream_from_cerebras(request.messages, request.session_id),
                    media_type="text/event-stream"
                )
            except Exception as e:
                logger.warning(f"Cerebras failed, falling back to local: {e}")
                # Send fallback notification
                async def fallback_stream():
                    yield f"data: {json.dumps({'fallback': True, 'content': ''})}\n\n"
                    async for chunk in stream_from_local_model(request.messages, request.session_id):
                        yield chunk
                
                return StreamingResponse(
                    fallback_stream(),
                    media_type="text/event-stream"
                )
        else:
            # Use local model directly
            return StreamingResponse(
                stream_from_local_model(request.messages, request.session_id),
                media_type="text/event-stream"
            )
    
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/refresh-network")
async def refresh_network_status():
    """Force refresh network status (bypasses cache)"""
    network_cache["last_check"] = None
    status = await detect_network_status()
    return status


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
