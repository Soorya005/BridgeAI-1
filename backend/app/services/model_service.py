from llama_cpp import Llama
from ..config import MODEL_PATH, N_CTX, SYSTEM_PROMPT
from .memory import add_to_history, get_history

llm = Llama(model_path=MODEL_PATH, n_ctx=N_CTX)

def generate_response(session_id:str, user_query: str):
    history = get_history(session_id)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history + [{"role": "user", "content": user_query}]
    prompt = ""
    for msg in messages:
        prompt +=f"{msg['role'].capitalize()}: {msg['content']}\n"
    prompt += "Assistant:"

    output = llm(prompt, max_tokens = 512, stop=["User:", "Assistant:"], echo=False)
    response = output["choices"][0]["text"].strip() # type: ignore

    add_to_history(session_id, "user", user_query)
    add_to_history(session_id, "assistant", response)

    return response


# def generate_response(user_query: str) -> str:
#     """
#     Prepend system prompt + user query and get model response.
#     """
#     prompt = f"{SYSTEM_PROMPT}\nUser: {user_query}\nAssistant:"
    
#     output = llm(
#         prompt,
#         max_tokens=256,
#         stop=["User:"],
#         echo=False
#     )
#     return output["choices"][0]["text"].strip() # type: ignore
