#type:ignore
from llama_cpp import Llama
from ..config import MODEL_PATH, N_CTX, SYSTEM_PROMPT_OFFLINE
from .memory import add_to_history, get_offline_history
import json
import time

llm = Llama(model_path=MODEL_PATH, n_ctx=N_CTX)

def generate_offline_response_stream(session_id: str, user_query: str):
    """Generator function that yields response chunks for streaming with buffering for smoother output."""
    # Use offline-optimized history instead of full history
    history = get_offline_history(session_id)
    messages = [{"role": "system", "content": SYSTEM_PROMPT_OFFLINE}] + history + [{"role": "user", "content": user_query}]
    
    prompt = ""
    for msg in messages:
        prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
    prompt += "Assistant:"

    full_response = ""
    buffer = ""
    buffer_size = 3
    last_send_time = time.time()
    min_time_between_sends = 0.05
    
    stream = llm(
        prompt, 
        max_tokens=512, 
        temperature=0.5,
        stop=["User:", "Assistant:"], 
        echo=False,
        stream=True
    )
    
    # -----Streaming Response with Buffering (Offline Layer)-----
    
    # Yield each chunk with buffering
    for output in stream:
        chunk = output["choices"][0]["text"]
        full_response += chunk
        buffer += chunk
        
        current_time = time.time()
        time_since_last_send = current_time - last_send_time
        
        # Send buffer if it's large enough OR enough time has passed
        if len(buffer) >= buffer_size or time_since_last_send >= min_time_between_sends:
            if buffer:  # Only send if buffer has content
                yield f"data: {json.dumps({'content': buffer, 'source': 'offline'})}\n\n"
                buffer = ""
                last_send_time = current_time
    
    # Send any remaining buffered content
    if buffer:
        yield f"data: {json.dumps({'content': buffer, 'source': 'offline'})}\n\n"
    
    # Send completion signal
    yield f"data: {json.dumps({'done': True})}\n\n"
    
    # Save to history with 'offline' source marker
    add_to_history(session_id, "user", user_query, source="offline")
    add_to_history(session_id, "assistant", full_response.strip(), source="offline")


# # ----- Non-streaming function (backward compatibility) -----
# def generate_offline_response(session_id: str, user_query: str):
#     history = get_history(session_id)
#     messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history + [{"role": "user", "content": user_query}]
    
#     prompt = ""
#     for msg in messages:
#         prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
#     prompt += "Assistant:"

#     full_response = ""
#     stream = llm(prompt, max_tokens=512, stop=["User:", "Assistant:"], echo=False, stream=True)
    
#     for output in stream:
#         chunk = output["choices"][0]["text"]
#         full_response += chunk

#     response = full_response.strip()
#     add_to_history(session_id, "user", user_query)
#     add_to_history(session_id, "assistant", response)

#     return response