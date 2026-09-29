import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test():
    async with httpx.AsyncClient() as c:
        r = await c.get('https://openrouter.ai/api/v1/models')
        models = [m['id'] for m in r.json().get('data', []) if 'free' in m['id']]
        print("Free OpenRouter models:")
        for m in models:
            print(m)

asyncio.run(test())
