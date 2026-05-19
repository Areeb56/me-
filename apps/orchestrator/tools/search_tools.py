import httpx
import json
from typing import Optional

async def search_web(query: str, num_results: int = 5) -> list[dict]:
    results = []
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://html.duckduckgo.com/html/",
                params={"q": query},
                headers={"User-Agent": "Mozilla/5.0"},
            )
            if response.status_code == 200:
                results = [{"title": "Search result", "url": "", "snippet": ""}]
    except Exception:
        pass
    return results

async def fetch_url(url: str) -> dict:
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
            response = await client.get(url)
            return {
                "status": response.status_code,
                "content": response.text[:10000],
                "headers": dict(response.headers),
            }
    except Exception as e:
        return {"error": str(e)}
