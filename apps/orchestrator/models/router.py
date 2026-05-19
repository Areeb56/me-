from typing import Optional, Literal
import httpx
import os
import json
from datetime import datetime

class ModelRouter:
    def __init__(self):
        self.ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.default_model = os.getenv("DEFAULT_MODEL", "llama3:70b")
        self.fallback_model = os.getenv("FALLBACK_MODEL", "openrouter/anthropic/claude-3.5-sonnet")
        self.call_log = []

    def get_status(self):
        return {
            "ollama_host": self.ollama_host,
            "openrouter_configured": bool(self.openrouter_key),
            "gemini_configured": bool(self.gemini_key),
            "default_model": self.default_model,
            "fallback_model": self.fallback_model,
        }

    def _select_model(self, task_type: str) -> tuple[str, str]:
        if task_type in ["classification", "routing", "scoring"]:
            return "mistral:7b", "ollama"
        elif task_type in ["reasoning", "research", "strategy"]:
            return self.default_model, "ollama"
        elif task_type in ["long_context", "analysis"]:
            return "gemini-1.5-pro", "gemini"
        else:
            return self.default_model, "ollama"

    async def call(self, prompt: str, system: str = "", task_type: str = "general", max_tokens: int = 2000) -> str:
        model, provider = self._select_model(task_type)

        for attempt in range(3):
            try:
                if provider == "ollama":
                    return await self._call_ollama(model, prompt, system, max_tokens)
                elif provider == "openrouter":
                    return await self._call_openrouter(model, prompt, system, max_tokens)
                elif provider == "gemini":
                    return await self._call_gemini(model, prompt, system, max_tokens)
            except Exception as e:
                if attempt == 2:
                    if provider != "openrouter":
                        return await self._call_openrouter(self.fallback_model, prompt, system, max_tokens)
                    raise
                await asyncio.sleep(2 ** attempt)

        raise Exception("All model calls failed")

    async def _call_ollama(self, model: str, prompt: str, system: str, max_tokens: int) -> str:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{self.ollama_host}/api/chat",
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": 0.7,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()
            result = data.get("message", {}).get("content", "")
            self.call_log.append({
                "model": model,
                "provider": "ollama",
                "tokens": data.get("eval_count", 0),
                "timestamp": datetime.utcnow().isoformat(),
            })
            return result

    async def _call_openrouter(self, model: str, prompt: str, system: str, max_tokens: int) -> str:
        if not self.openrouter_key:
            raise Exception("OpenRouter API key not configured")

        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openrouter_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://aios.local",
                    "X-Title": "AIOS",
                },
                json={
                    "model": model.replace("openrouter/", ""),
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": max_tokens,
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            data = response.json()
            result = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            usage = data.get("usage", {})
            self.call_log.append({
                "model": model,
                "provider": "openrouter",
                "tokens": usage.get("total_tokens", 0),
                "timestamp": datetime.utcnow().isoformat(),
            })
            return result

    async def _call_gemini(self, model: str, prompt: str, system: str, max_tokens: int) -> str:
        if not self.gemini_key:
            raise Exception("Gemini API key not configured")

        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                params={"key": self.gemini_key},
                json={
                    "contents": [
                        {"role": "user", "parts": [{"text": f"{system}\n\n{prompt}"}]}
                    ],
                    "generationConfig": {
                        "maxOutputTokens": max_tokens,
                        "temperature": 0.7,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()
            result = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            self.call_log.append({
                "model": model,
                "provider": "gemini",
                "tokens": 0,
                "timestamp": datetime.utcnow().isoformat(),
            })
            return result

    def get_usage_stats(self):
        total_tokens = sum(log.get("tokens", 0) for log in self.call_log)
        by_provider = {}
        for log in self.call_log:
            provider = log.get("provider", "unknown")
            if provider not in by_provider:
                by_provider[provider] = {"calls": 0, "tokens": 0}
            by_provider[provider]["calls"] += 1
            by_provider[provider]["tokens"] += log.get("tokens", 0)

        return {
            "total_calls": len(self.call_log),
            "total_tokens": total_tokens,
            "by_provider": by_provider,
        }

import asyncio
