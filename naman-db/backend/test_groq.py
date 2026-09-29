import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test():
    async with httpx.AsyncClient() as c:
        r = await c.get('https://api.groq.com/openai/v1/models', headers={'Authorization': f"Bearer {os.environ.get('GROQ_API_KEY')}"})
        models = [m['id'] for m in r.json().get('data', [])]
        print("Groq models:")
        for m in models:
            print(m)

asyncio.run(test())
