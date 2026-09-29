"""
AI Provider Service - Supports Ollama (local) and Groq (cloud)
Handles vision analysis and text generation for AgriGuard
"""

import base64
import json
import httpx
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class AIProvider(ABC):
    """Abstract base class for AI providers"""
    
    @abstractmethod
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """Analyze an image and return description"""
        pass
    
    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate text response"""
        pass
    
    @abstractmethod
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """Multi-turn conversation"""
        pass




class GroqProvider(AIProvider):
    """
    Groq - Free Cloud API with blazing fast inference
    Models: Llama 3.3 70B, Mixtral, Gemma
    Free tier: 30 requests/minute
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "qwen/qwen3.8-27b"  # Groq's current fast model
        self.vision_model = "llama-3.2-11b-vision-preview"  # Current vision model
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """
        Analyze image using Groq's vision model
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.vision_model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ],
            "max_tokens": 2048
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    error = resp.text
                    return f"Groq API Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate text using Groq's Llama 3.1"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        return await self.chat(messages)
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """Multi-turn chat with Groq"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)
        
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "max_tokens": 2048,
            "temperature": 0.7
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    error = resp.text
                    return f"Groq API Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"


class GeminiProvider(AIProvider):
    """
    Google Gemini - Free tier available
    Best for: Vision + reasoning combined
    Free: 15 requests/minute
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY", "")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-3.8-flash"
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """Analyze image with Gemini Vision"""
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }]
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.post(url, json=payload, timeout=30.0)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                else:
                    error = resp.text
                    return f"Gemini Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate text with Gemini"""
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}]
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                else:
                    error = resp.text
                    return f"Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """Chat with Gemini"""
        # Convert to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        payload = {"contents": contents}
        
        if system_prompt:
            payload["system_instruction"] = {"parts": [{"text": system_prompt}]}
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.post(url, json=payload, timeout=30.0)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                else:
                    error = resp.text
                    return f"Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"

class OpenAIProvider(AIProvider):
    """
    OpenAI API for GPT-4o-mini Vision & Text
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.base_url = "https://api.openai.com/v1"
        self.model = "gpt-4o-mini"
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                    ]
                }
            ],
            "max_tokens": 1000
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
                return f"OpenAI API Error: {resp.text}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return await self.chat(messages)
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        formatted = []
        if system_prompt:
            formatted.append({"role": "system", "content": system_prompt})
        formatted.extend(messages)
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json={"model": self.model, "messages": formatted},
                    timeout=30.0
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
                return f"OpenAI API Error: {resp.text}"
        except Exception as e:
            return f"Error: {str(e)}"


class HuggingFaceProvider(AIProvider):
    """
    Hugging Face Inference API - Completely FREE!
    No API key needed, rate limited but generous
    Models: LLaVA, BLIP-2, Salesforce BLIP
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("HUGGINGFACE_API_KEY", "")
        self.vision_model = "llava-hf/llava-1.5-7b-hf"  # Free LLaVA model
        self.base_url = "https://api-inference.huggingface.co/models"
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """Analyze image using Hugging Face LLaVA"""
        import base64
        
        # Convert base64 to bytes
        image_bytes = base64.b64decode(image_base64)
        
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        
        # HuggingFace expects multipart form data
        url = f"{self.base_url}/{self.vision_model}"
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500
            }
        }
        
        try:
            async with httpx.AsyncClient() as session:
                # First request - send image and prompt
                form = {}
                files = {'file': ('image.jpg', image_bytes, 'image/jpeg')}
                data = {'data': json.dumps(payload)}
                
                resp = await session.post(
                    url,
                    headers=headers,
                    data=data, files=files,
                    timeout=60.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        return data[0].get("generated_text", "Unable to analyze")
                    return str(data)
                elif resp.status_code == 503:
                    return "Model is loading, please try again in a moment"
                else:
                    error = resp.text
                    return f"HuggingFace Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate text using HuggingFace"""
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        
        # Use a text generation model
        text_model = "mistralai/Mistral-7B-Instruct-v0.2"
        url = f"{self.base_url}/{text_model}"
        
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        
        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7
            }
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        return data[0].get("generated_text", "")
                    return str(data)
                else:
                    error = resp.text
                    return f"Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """Chat using HuggingFace"""
        # Convert messages to single prompt
        full_prompt = ""
        if system_prompt:
            full_prompt = f"System: {system_prompt}\n\n"
        
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            full_prompt += f"{role.title()}: {content}\n"
        
        full_prompt += "Assistant: "
        
        return await self.generate_text(full_prompt)


# ==================== Factory Function ====================

class OpenRouterProvider(AIProvider):
    """OpenRouter - Aggregator that offers free models"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1"
        # Multiple free vision models to try in order of reliability
        self.vision_models = [
            "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
            "google/gemma-4-31b-it:free",
            "google/gemma-4-26b-a4b-it:free"
        ]
        
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """Analyze image using OpenRouter - tries multiple free models"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "AgriGuard",
            "Content-Type": "application/json"
        }
        
        for model in self.vision_models:
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                        ]
                    }
                ],
                "max_tokens": 2048
            }
            
            try:
                async with httpx.AsyncClient() as session:
                    resp = await session.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload,
                        timeout=45.0
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if "choices" in data and len(data["choices"]) > 0:
                            content = data["choices"][0]["message"]["content"]
                            if content and len(content) > 10:
                                print(f"[OpenRouter] OK: {model} succeeded!")
                                return content
                    else:
                        print(f"[OpenRouter] FAIL: {model} HTTP {resp.status_code}, trying next...")
                        continue
            except Exception as e:
                print(f"[OpenRouter] FAIL: {model} exception: {str(e)[:100]}, trying next...")
                continue
        
        return f"OpenRouter Error: All vision models failed"
            
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        return ""
        
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        return ""


def get_ai_provider(provider_name: str = None) -> AIProvider:
    """
    Factory function to get the appropriate AI provider
    Priority: Groq (fast cloud) -> Gemini (paid) -> Ollama (local)
    """
    provider = provider_name or os.getenv("AI_PROVIDER", "groq")
    
    if provider == "groq":
        return GroqProvider()
    elif provider == "gemini":
        return GeminiProvider()
    else:
        # Default to Groq
        return GroqProvider()


# ==================== Smart Provider (Auto-fallback) ====================

class SmartAIProvider(AIProvider):
    """
    Intelligent provider that auto-selects based on availability
    Uses: Groq for EVERYTHING (vision + text) - fast & free
    Falls back: Gemini → Ollama (local)
    """
    
    def __init__(self):
        self.groq = GroqProvider()
        self.openai = OpenAIProvider() if os.getenv("OPENAI_API_KEY") else None
        self.gemini = GeminiProvider() if os.getenv("GOOGLE_API_KEY") else None
        self.openrouter = OpenRouterProvider() if os.getenv("OPENROUTER_API_KEY") else None
        self.hf = HuggingFaceProvider() # 100% Free Vision!
        self.current_provider = None
    
    async def _get_available_provider(self, need_vision: bool = False) -> AIProvider:
        """Get the best provider - OpenRouter/HuggingFace for vision, Groq for text"""
        
        if need_vision:
            # 1. Prefer OpenRouter (Nemotron) as it avoids Gemini rate limits
            if self.openrouter and self.openrouter.api_key:
                self.current_provider = "openrouter"
                return self.openrouter
            # 2. Fallback to free HuggingFace (LLaVA)
            if self.hf and self.hf.api_key:
                self.current_provider = "huggingface"
                return self.hf
            # 3. Fallback to Gemini if nothing else works
            if self.gemini and self.gemini.api_key:
                self.current_provider = "gemini"
                return self.gemini
            
        # Try Groq for text tasks (it's faster)
        if self.groq and self.groq.api_key:
            self.current_provider = "groq"
            return self.groq
        
        # Fallback to Gemini for everything
        if self.gemini and self.gemini.api_key:
            self.current_provider = "gemini"
            return self.gemini
        
        # Return Groq as fallback even if key is missing (it will return an auth error instead of crashing)
        self.current_provider = "groq"
        return self.groq
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """Smart fallback for vision models: OpenAI -> OpenRouter -> Gemini -> HF -> Groq"""
        errors = []
        
        # 0. Try OpenAI if key is present
        if self.openai and self.openai.api_key:
            self.current_provider = "openai"
            result = await self.openai.analyze_image(image_base64, prompt)
            if not result.startswith("Error") and not result.startswith("OpenAI API Error"):
                print(f"[SmartAIProvider] OK: OpenAI succeeded!")
                return result
            errors.append(f"OpenAI: {result}")
            print(f"[SmartAIProvider] OpenAI failed, falling back... {result[:100]}")

        # 1. Try OpenRouter FIRST (multiple free vision models with auto-fallback)
        if self.openrouter and self.openrouter.api_key:
            self.current_provider = "openrouter"
            result = await self.openrouter.analyze_image(image_base64, prompt)
            if not result.startswith("Error") and not result.startswith("OpenRouter Error"):
                print(f"[SmartAIProvider] OK: OpenRouter succeeded!")
                return result
            errors.append(f"OpenRouter: {result}")
            print(f"[SmartAIProvider] OpenRouter failed, falling back... {result[:100]}")
            
        # 2. Try Gemini as backup
        if self.gemini and self.gemini.api_key:
            self.current_provider = "gemini"
            result = await self.gemini.analyze_image(image_base64, prompt)
            if not result.startswith("Error") and not result.startswith("Gemini Error"):
                print(f"[SmartAIProvider] OK: Gemini succeeded!")
                return result
            errors.append(f"Gemini: {result}")
            print(f"[SmartAIProvider] Gemini failed... {result[:100]}")
            
        # 3. Try HuggingFace (Free) as backup
        if self.hf:
            self.current_provider = "huggingface"
            result = await self.hf.analyze_image(image_base64, prompt)
            if not result.startswith("Error") and not result.startswith("HuggingFace Error"):
                print(f"[SmartAIProvider] OK: HuggingFace succeeded!")
                return result
            errors.append(f"HuggingFace: {result}")
            print(f"[SmartAIProvider] HuggingFace failed... {result[:100]}")
            
        # 4. Try Groq as backup
        if self.groq and self.groq.api_key:
            self.current_provider = "groq"
            result = await self.groq.analyze_image(image_base64, prompt)
            if not result.startswith("Error") and not result.startswith("Groq API Error"):
                print(f"[SmartAIProvider] OK: Groq succeeded!")
                return result
            errors.append(f"Groq: {result}")
            print(f"[SmartAIProvider] Groq failed... {result[:100]}")
            
        return f"Error: All vision providers failed. {' | '.join(errors)}"
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Use Groq for text (fastest)"""
        provider = await self._get_available_provider(need_vision=False)
        return await provider.generate_text(prompt, system_prompt)
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """Use Groq for chat (fastest)"""
        provider = await self._get_available_provider(need_vision=False)
        return await provider.chat(messages, system_prompt)

