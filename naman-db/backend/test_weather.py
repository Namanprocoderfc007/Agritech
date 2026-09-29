import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as c:
        r = await c.get('https://api.open-meteo.com/v1/forecast?latitude=22.67&longitude=88.38&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto')
        print(r.status_code, r.text)

asyncio.run(test())
