import os
from google import genai
from dotenv import load_dotenv

from .embeddings import get_embeddings
from .vectorstore import query_chunks
from .prompts import RAG_PROMPT

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. Add it to your .env file."
    )

# New unified Google Gen AI SDK (google-genai).
# The old `google-generativeai` package is fully deprecated/unsupported.
client = genai.Client(api_key=GEMINI_API_KEY)

# "gemini-flash-latest" is an alias that always points at the current
# stable Flash model, so it won't silently break on the next model
# retirement the way pinning to "gemini-pro" did.
MODEL_NAME = "gemini-flash-latest"


def generate_answer(query: str) -> str:
    query_embedding = get_embeddings([query])[0]

    docs = query_chunks(query_embedding)
    context = "\n".join(docs)

    prompt = RAG_PROMPT.format(
        context=context,
        question=query
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    return response.text
