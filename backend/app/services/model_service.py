#type:ignore
from llama_cpp import Llama
from ..config import MODEL_PATH, N_CTX, SYSTEM_PROMPT
from .memory import add_to_history, get_history
import json

llm = Llama(model_path=MODEL_PATH, n_ctx=N_CTX)

def generate_offline_response_stream(session_id: str, user_query: str):
    """Generator function that yields response chunks for streaming."""
    history = get_history(session_id)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history + [{"role": "user", "content": user_query}]
    
    prompt = ""
    for msg in messages:
        prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
    prompt += "Assistant:"

    full_response = ""
    stream = llm(
        prompt, 
        max_tokens=512, 
        stop=["User:", "Assistant:"], 
        echo=False,
        stream=True
    )
    
    # -----Testing Streaming Response(Offline Layer)-----
    
    # Yield each chunk as it arrives
    for output in stream:
        chunk = output["choices"][0]["text"]
        full_response += chunk
        
        # Send chunk to client
        yield f"data: {json.dumps({'content': chunk, 'source': 'offline'})}\n\n"
    
    # Send completion signal
    yield f"data: {json.dumps({'done': True})}\n\n"
    
    add_to_history(session_id, "user", user_query)
    add_to_history(session_id, "assistant", full_response.strip())


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