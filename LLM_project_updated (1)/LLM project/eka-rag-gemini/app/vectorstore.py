import chromadb

client = chromadb.PersistentClient(path="db")
collection = client.get_or_create_collection(name="eka_docs")

def store_chunks(chunks, embeddings):
    ids = [f"id_{i}" for i in range(len(chunks))]
    
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids
    )

def query_chunks(query_embedding, k=3):
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )
    return results["documents"][0]