from collections import defaultdict
from ..config import MAX_HISTORY

chat_hist = defaultdict(list)

def add_to_history(session_id: str, role: str, content: str):
    chat_hist[session_id].append({"role": role, "content": content})
    
    if len(chat_hist[session_id]) > MAX_HISTORY * 2:
        chat_hist[session_id] = chat_hist[session_id][-MAX_HISTORY*2:] 

def get_history(session_id: str):
    return chat_hist[session_id]

def clear_history(session_id: str):
    if session_id in chat_hist:
        del chat_hist[session_id]