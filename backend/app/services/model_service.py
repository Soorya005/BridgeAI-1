from llama_cpp import Llama
from ..config import MODEL_PATH, N_CTX, SYSTEM_PROMPT

llm = Llama(model_path=MODEL_PATH, n_ctx=N_CTX)

def generate_response(user_query: str) -> str:
    """
    Prepend system prompt + user query and get model response.
    """
    prompt = f"{SYSTEM_PROMPT}\nUser: {user_query}\nAssistant:"
    
    output = llm(
        prompt,
        max_tokens=256,
        stop=["User:"],
        echo=False
    )
    return output["choices"][0]["text"].strip() # type: ignore
