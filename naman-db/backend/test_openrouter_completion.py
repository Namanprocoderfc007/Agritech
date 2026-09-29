import os
import asyncio
import httpx
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

# 1 pixel base64 image
image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

async def test():
    payload = {
        "model": "nvidia/nemotron-nano-12b-v2-vl:free",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "What is this?"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                ]
            }
        ],
        "max_tokens": 2048
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
        data = resp.json()
        print(json.dumps(data, indent=2))

asyncio.run(test())
