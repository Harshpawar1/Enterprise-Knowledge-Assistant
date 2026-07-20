# EKA — Enterprise Knowledge Assistant (Gemini RAG)

A small Retrieval-Augmented-Generation app: it indexes your documents into a
local Chroma vector store, retrieves the most relevant chunks for a question,
and asks Gemini to answer using only that context. Includes a FastAPI backend
and a standalone HTML/CSS/JS chat frontend.

## What changed in this pass

- **Gemini API key** set in `.env`.
- **Swapped the SDK**: `google-generativeai` is fully deprecated (no updates
  since Aug 2025) and `gemini-pro` no longer exists. Now uses the current
  `google-genai` SDK and the `gemini-flash-latest` model alias (auto-tracks
  the current stable Flash model, so it won't die on the next model
  retirement).
- **Fixed the imports**: `app/main.py` and `app/rag_pipeline.py` used bare
  imports (`from rag_pipeline import ...`) that only work if you `cd` into
  `app/` and run it as a loose script. Converted to proper relative imports
  and added `app/__init__.py` so it works as a real Python package, run from
  the project root with `uvicorn app.main:app`.
- **Added CORS** so a browser-based frontend can call the API.
- **Added `POST /ask`** (JSON body) alongside the original `GET /ask`, plus
  basic error handling so a Gemini/Chroma failure returns a clean 500
  instead of crashing the server.
- **Added a frontend** (`frontend/index.html`, `style.css`, `script.js`) — a
  self-contained chat UI, no build step required.

> **Note on the key format:** typical Gemini API keys (from Google AI
> Studio) start with `AIzaSy...`. The key you gave me starts with `AQ.`,
> which looks like it might be a different kind of token (e.g. a Google
> OAuth access token) rather than an AI Studio API key. I've placed it in
> `.env` exactly as given, but if `google.genai.Client(api_key=...)` rejects
> it, grab a proper API key from https://aistudio.google.com/apikey and
> swap it in.

## Project structure

```
eka-rag-gemini/
├── .env                  # GEMINI_API_KEY lives here
├── requirements.txt
├── ingest.py              # run this to index data/docs/*
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI app (GET/POST /ask)
│   ├── rag_pipeline.py     # Gemini call + retrieval glue
│   ├── embeddings.py       # sentence-transformers embeddings
│   ├── vectorstore.py      # Chroma persistent store
│   ├── chunking.py         # text splitter
│   ├── ingestion.py        # docling PDF/doc -> markdown
│   └── prompts.py
├── data/docs/              # put source documents here
├── db/                     # Chroma persists here (auto-created)
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## Setup

```bash
cd eka-rag-gemini
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 1. Index your documents

Drop files into `data/docs/` (a sample `HR-Policy.pdf` is already there),
then run:

```bash
python ingest.py
```

This extracts text, chunks it, embeds it, and stores it in the local
`db/` Chroma database.

## 2. Run the backend

From the **project root** (not inside `app/`):

```bash
uvicorn app.main:app --reload
```

The API comes up at `http://127.0.0.1:8000`. Check it with:

```bash
curl "http://127.0.0.1:8000/ask?query=How many casual leave days do employees get?"
```

## 3. Open the frontend

Just open `frontend/index.html` in your browser (double-click it, or use
"Open with browser"). It calls the backend at `http://127.0.0.1:8000` by
default — click **change** under the message box if your backend runs
somewhere else. As long as the backend is running, the sidebar status dot
turns green and you can start chatting.

## Troubleshooting

- **Status dot stays red** — the backend isn't running, or is on a
  different port/host than shown under the composer; click "change" to fix
  the URL.
- **500 error / Gemini auth failure** — check `.env` has a valid key from
  https://aistudio.google.com/apikey.
- **Empty / "Not found in documents" answers** — you probably haven't run
  `python ingest.py` yet, or your question isn't covered by the indexed
  files.
