import asyncio
from app.services.weather_service import WeatherService

async def test():
    service = WeatherService()
    res = await service.get_current_weather(22.67, 88.38)
    print("CURRENT:", res)
    
    res2 = await service.get_forecast(22.67, 88.38)
    print("FORECAST:", res2)

asyncio.run(test())
