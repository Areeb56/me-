"""
LiteLLM router configuration for managing multiple LLM providers.
Handles load balancing, failover, and routing between different models.
"""

import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import litellm
from litellm import Router
import logging

logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    model_name: str
    litellm_params: Dict[str, Any]
    # Optional: specific configuration for this model
    max_tokens: Optional[int] = None
    temperature: float = 0.7

class LiteLLMRouter:
    def __init__(self):
        self.router: Optional[Router] = None
        self.model_configs: List[ModelConfig] = []
        self._initialize_router()

    def _initialize_router(self):
        """Initialize the LiteLLM router with model configurations"""
        # Get API keys from environment
        openai_key = os.getenv("OPENAI_KEY")
        anthropic_key = os.getenv("ANTHROPIC_KEY")
        # ollama doesn't need an API key for local usage

        # Define model configurations
        self.model_configs = [
            ModelConfig(
                model_name="gpt-4o",
                litellm_params={
                    "model": "gpt-4o",
                    "api_key": openai_key,
                }
            ),
            ModelConfig(
                model_name="claude-sonnet-4-20250514",
                litellm_params={
                    "model": "claude-sonnet-4-20250514",
                    "api_key": anthropic_key,
                }
            ),
            ModelConfig(
                model_name="ollama/llama3",
                litellm_params={
                    "model": "ollama/llama3",
                    "api_base": "http://ollama:11434",
                }
            ),
            ModelConfig(
                model_name="openrouter/deepseek-r1",
                litellm_params={
                    "model": "openrouter/deepseek-r1",
                    "api_key": os.getenv("OPENROUTER_KEY"),
                }
            )
        ]

        # Filter out models with missing API keys (except Ollama which doesn't need one)
        valid_configs = []
        for config in self.model_configs:
            if "ollama" in config.model_name:
                valid_configs.append(config)  # Ollama doesn't need API key
            elif config.litellm_params.get("api_key"):
                valid_configs.append(config)
            else:
                logger.warning(f"Skipping model {config.model_name} due to missing API key")

        if not valid_configs:
            logger.error("No valid model configurations found!")
            # Add a fallback to prevent crashes
            valid_configs = [
                ModelConfig(
                    model_name="ollama/llama3",
                    litellm_params={
                        "model": "ollama/llama3",
                        "api_base": "http://ollama:11434",
                    }
                )
            ]

        # Configure router settings
        router_settings = {
            "routing_strategy": "least_busy",  # or "round_robin", "weighted"
            "fallbacks": ["ollama/llama3"],  # Always fallback to local model
            "num_retries": 3,
            "timeout": 30,
        }

        # Initialize the router
        try:
            self.router = Router(
                model_list=[asdict(config) for config in valid_configs],
                **router_settings
            )
            logger.info(f"Initialized LiteLLM router with {len(valid_configs)} models")
        except Exception as e:
            logger.error(f"Failed to initialize LiteLLM router: {e}")
            # Fallback to a simple direct call approach
            self.router = None

    async def completion(self, model: str, messages: List[Dict[str, str]],
                        temperature: float = 0.7, max_tokens: Optional[int] = None,
                        stream: bool = False) -> Dict[str, Any]:
        """Generate a completion using the router"""
        if not self.router:
            # Fallback: try to use the model directly
            try:
                response = await litellm.acompletion(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=stream
                )
                return response
            except Exception as e:
                logger.error(f"Direct completion failed: {e}")
                raise

        try:
            # Use the router for load balancing and failover
            response = await self.router.acompletion(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream
            )
            return response
        except Exception as e:
            logger.error(f"Router completion failed: {e}")
            # Try fallback to ollama/llama3 as last resort
            try:
                response = await litellm.acompletion(
                    model="ollama/llama3",
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=stream,
                    api_base="http://ollama:11434"
                )
                return response
            except Exception as fallback_error:
                logger.error(f"Fallback completion failed: {fallback_error}")
                raise

    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        if self.router:
            return [model.model_name for model in self.model_configs]
        return [model.model_name for model in self.model_configs]

    def get_model_info(self, model_name: str) -> Optional[ModelConfig]:
        """Get information about a specific model"""
        for model in self.model_configs:
            if model.model_name == model_name:
                return model
        return None

# Global instance
llm_router = LiteLLMRouter()