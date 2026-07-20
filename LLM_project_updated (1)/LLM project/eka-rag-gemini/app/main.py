from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .rag_pipeline import generate_answer

app = FastAPI(title="EKA - Enterprise Knowledge Assistant")

# Allow the standalone HTML/CSS/JS frontend (opened from disk or served
# from any origin) to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    query: str


@app.get("/")
def home():
    return {"message": "EKA Gemini Running"}


@app.get("/ask")
def ask_get(query: str):
    try:
        return {"answer": generate_answer(query)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask")
def ask_post(payload: AskRequest):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return {"answer": generate_answer(payload.query)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))