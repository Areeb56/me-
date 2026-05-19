import chromadb
import os
import json
import uuid
from datetime import datetime
from typing import Optional

class VectorMemory:
    def __init__(self):
        host = os.getenv("CHROMA_HOST", "http://localhost:8000")
        self.client = chromadb.HttpClient(host=host)
        self.collection = self.client.get_or_create_collection(
            name="aios_memories",
            metadata={"hnsw:space": "cosine"}
        )

    def add(self, content: str, agent_type: Optional[str] = None, metadata: Optional[dict] = None, importance: float = 0.5) -> str:
        memory_id = str(uuid.uuid4())
        doc_metadata = {
            "id": memory_id,
            "agent_type": agent_type or "unknown",
            "importance": importance,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": json.dumps(metadata or {}),
        }
        self.collection.add(
            ids=[memory_id],
            documents=[content],
            metadatas=[doc_metadata],
        )
        return memory_id

    def search(self, query: str, agent_type: Optional[str] = None, limit: int = 10) -> list[dict]:
        where_filter = None
        if agent_type:
            where_filter = {"agent_type": agent_type}

        results = self.collection.query(
            query_texts=[query],
            n_results=limit,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )

        memories = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][i] if results["metadatas"] else {}
                distance = results["distances"][0][i] if results["distances"] else 0
                memories.append({
                    "id": meta.get("id", ""),
                    "content": doc,
                    "agent_type": meta.get("agent_type", ""),
                    "importance": meta.get("importance", 0),
                    "created_at": meta.get("created_at", ""),
                    "metadata": json.loads(meta.get("metadata", "{}")),
                    "relevance_score": 1 - distance,
                })

        return memories

    def get_by_agent(self, agent_type: str, limit: int = 20) -> list[dict]:
        results = self.collection.get(
            where={"agent_type": agent_type},
            limit=limit,
            include=["documents", "metadatas"],
        )

        memories = []
        if results["documents"]:
            for i, doc in enumerate(results["documents"]):
                meta = results["metadatas"][i] if results["metadatas"] else {}
                memories.append({
                    "id": meta.get("id", ""),
                    "content": doc,
                    "agent_type": meta.get("agent_type", ""),
                    "importance": meta.get("importance", 0),
                    "created_at": meta.get("created_at", ""),
                    "metadata": json.loads(meta.get("metadata", "{}")),
                })

        return memories

    def delete(self, memory_id: str) -> bool:
        try:
            self.collection.delete(ids=[memory_id])
            return True
        except Exception:
            return False

    def count(self) -> int:
        return self.collection.count()
