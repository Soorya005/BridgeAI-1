from collections import defaultdict
from ..config import MAX_HISTORY

chat_hist = defaultdict(list)
offline_hist = defaultdict(list)  # Separate history for offline model

def add_to_history(session_id: str, role: str, content: str, source: str = "mixed"):
    """Add to main history (used by online model)"""
    chat_hist[session_id].append({"role": role, "content": content})
    
    if len(chat_hist[session_id]) > MAX_HISTORY * 2:
        chat_hist[session_id] = chat_hist[session_id][-MAX_HISTORY*2:]
    
    # Add to offline history with smart truncation
    # ALWAYS add user queries in full
    if role == "user":
        offline_hist[session_id].append({"role": role, "content": content})
    # For assistant responses, check length and source
    elif role == "assistant":
        if len(content) > 300:
            # Truncate long responses (likely from online model) for offline context
            truncated_content = content[:250] + "... [response continues]"
            offline_hist[session_id].append({"role": role, "content": truncated_content})
        else:
            # Keep short responses in full (already concise)
            offline_hist[session_id].append({"role": role, "content": content})
    
    # Keep offline history manageable
    if len(offline_hist[session_id]) > MAX_HISTORY * 2:
        offline_hist[session_id] = offline_hist[session_id][-MAX_HISTORY*2:]

def get_history(session_id: str):
    """Get full history (for online model)"""
    return chat_hist[session_id]

def get_offline_history(session_id: str):
    """Get truncated history optimized for offline model"""
    return offline_hist[session_id]

def clear_history(session_id: str):
    if session_id in chat_hist:
        del chat_hist[session_id]
    if session_id in offline_hist:
        del offline_hist[session_id]