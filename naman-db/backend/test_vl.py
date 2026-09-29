import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test():
    async with httpx.AsyncClient() as c:
        payload = {
            "model": "nvidia/nemotron-nano-12b-v2-vl:free",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What is in this image?"},
                        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k="}}
                    ]
                }
            ],
            "max_tokens": 100
        }
        headers = {
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Test"
        }
        r = await c.post('https://openrouter.ai/api/v1/chat/completions', json=payload, headers=headers)
        print(r.status_code)
        print(r.text)

asyncio.run(test())
