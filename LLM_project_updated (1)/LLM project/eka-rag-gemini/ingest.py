import os
from app.ingestion import extract_text
from app.chunking import chunk_text
from app.embeddings import get_embeddings
from app.vectorstore import store_chunks

folder = "data/docs"

for file in os.listdir(folder):
    path = os.path.join(folder, file)

    print(f"Processing {file}...")

    text = extract_text(path)
    chunks = chunk_text(text)
    embeddings = get_embeddings(chunks)

    store_chunks(chunks, embeddings)

print("✅ Ingestion Complete")