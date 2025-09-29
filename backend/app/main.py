from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from .routes import chat      

app = FastAPI(
    title="BridgeAI",
    description="A Hybrid Knowledge Assistant for Low-Connectivity Environments",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(chat.router, prefix="/api", tags=["Chat"])


@app.on_event("startup")
async def startup_event():
    print("🚀 BridgeAI backend starting up...")
    

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 BridgeAI backend shutting down...")


@app.get("/")
def root():
    return {"message": "Welcome to BridgeAI API!"}
