"""
Codex interface for code generation and manipulation.
This wraps the LLM capabilities specifically for coding tasks.
"""

import logging
from typing import Dict, Any, List, Optional
from .llm_router import llm_router  # Fixed the import to use the correct module name

logger = logging.getLogger(__name__)

class Codex:
    def __init__(self):
        self.llm_router = llm_router

    async def generate_code(self, prompt: str, language: str = "python",
                          context: str = None, examples: List[str] = None) -> str:
        """Generate code based on a prompt"""
        try:
            # Build the prompt for code generation
            full_prompt = f"""
            Generate {language} code for the following task:
            {prompt}
            """

            if context:
                full_prompt += f"\n\nContext:\n{context}"

            if examples:
                full_prompt += f"\n\nExamples:\n" + "\n\n".join(examples)

            full_prompt += "\n\nGenerate clean, well-documented, production-ready code. Return only the code."

            messages = [{"role": "user", "content": full_prompt}]

            # Use the LLM router to get the best available model for coding
            response = await self.llm_router.completion(
                model="auto",  # Let router choose
                messages=messages,
                temperature=0.2,  # Low temperature for consistent code
                max_tokens=4000
            )

            code = response.choices[0].message.content

            # Clean up code formatting
            if code.startswith("```"):
                lines = code.split('\n')
                # Find start and end of code block
                start_idx = 0
                end_idx = len(lines)

                for i, line in enumerate(lines):
                    if not line.strip().startswith('```'):
                        start_idx = i
                        break

                for i in range(len(lines)-1, -1, -1):
                    if not lines[i].strip().startswith('```'):
                        end_idx = i + 1
                        break

                code = '\n'.join(lines[start_idx:end_idx])

            return code

        except Exception as e:
            logger.error(f"Error generating code: {e}")
            raise

    async def explain_code(self, code: str, language: str = "python") -> str:
        """Explain what the code does"""
        try:
            prompt = f"""
            Explain the following {language} code in clear, concise terms:
            {code}

            Explain what the code does, how it works, and any important details.
            """

            messages = [{"role": "user", "content": prompt}]

            response = await self.llm_router.completion(
                model="auto",
                messages=messages,
                temperature=0.3,
                max_tokens=1000
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error explaining code: {e}")
            raise

    async def debug_code(self, code: str, error_message: str, language: str = "python") -> str:
        """Debug code based on an error message"""
        try:
            prompt = f"""
            The following {language} code has an error:
            {code}

            Error message:
            {error_message}

            Please fix the code and explain what was wrong.
            Return only the corrected code.
            """

            messages = [{"role": "user", "content": prompt}]

            response = await self.llm_router.completion(
                model="auto",
                messages=messages,
                temperature=0.2,
                max_tokens=2000
            )

            fixed_code = response.choices[0].message.content

            # Clean up code formatting
            if coded.startswith("```"):
                lines = fixed_code.split('\n')
                # Find start and end of code block
                start_idx = 0
                end_idx = len(lines)

                for i, line in enumerate(lines):
                    if not line.strip().startswith('```'):
                        start_idx = i
                        break

                for i in range(len(lines)-1, -1, -1):
                    if not lines[i].strip().startswith('```'):
                        end_idx = i + 1
                        break

                fixed_code = '\n'.join(lines[start_idx:end_idx])

            return fixed_code

        except Exception as e:
            logger.error(f"Error debugging code: {e}")
            raise

    async def optimize_code(self, code: str, language: str = "python",
                          optimization_goal: str = "performance") -> str:
        """Optimize code for a specific goal"""
        try:
            prompt = f"""
            Optimize the following {language} code for {optimization_goal}:
            {code}

            Provide an optimized version of the code that maintains the same functionality
            but improves {optimization_goal}. Explain the changes made.
            Return only the optimized code.
            """

            messages = [{"role": "user", "content": prompt}]

            response = await self.llm_router.completion(
                model="auto",
                messages=messages,
                temperature=0.2,
                max_tokens=2000
            )

            optimized_code = response.choices[0].message.content

            # Clean up code formatting
            if optimized_code.startswith("```"):
                lines = optimized_code.split('\n')
                # Find start and end of code block
                start_idx = 0
                end_idx = len(lines)

                for i, line in enumerate(lines):
                    if not line.strip().startswith('```'):
                        start_idx = i
                        break

                for i in range(len(lines)-1, -1, -1):
                    if not lines[i].strip().startswith('```'):
                        end_idx = i + 1
                        break

                optimized_code = '\n'.join(lines[start_idx:end_idx])

            return optimized_code

        except Exception as e:
            logger.error(f"Error optimizing code: {e}")
            raise

# Global instance
codex = Codex()