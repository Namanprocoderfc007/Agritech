"""
Weather Routes - Weather data and disease risk prediction
"""

from fastapi import APIRouter, HTTPException
from typing import Optional

from ..services import WeatherService
from ..models.schemas import WeatherDataRequest, AgriGuardResponse

router = APIRouter(prefix="/weather", tags=["Weather"])

weather_service = WeatherService()


@router.get("/current")
async def get_current_weather(latitude: float, longitude: float):
    """
    Get current weather conditions for a location
    """
    try:
        weather = await weather_service.get_current_weather(latitude, longitude)
        
        if "error" in weather:
            raise HTTPException(status_code=400, detail=weather["error"])
        
        return AgriGuardResponse(
            status="success",
            data=weather
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast")
async def get_forecast(latitude: float, longitude: float, days: int = 7):
    """
    Get weather forecast for up to 16 days
    """
    try:
        forecast = await weather_service.get_forecast(latitude, longitude, days)
        
        if "error" in forecast:
            raise HTTPException(status_code=400, detail=forecast["error"])
        
        return AgriGuardResponse(
            status="success",
            data=forecast
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/disease-risk")
async def get_disease_risk(latitude: float, longitude: float):
    """
    Get disease risk assessment based on current weather
    
    Returns risk levels for:
    - Fungal diseases
    - Bacterial diseases  
    - Pest activity
    - Spray conditions
    """
    try:
        # Get current weather
        weather = await weather_service.get_current_weather(latitude, longitude)
        
        if "error" in weather:
            raise HTTPException(status_code=400, detail=weather["error"])
        
        # Analyze risks
        risks = weather_service.analyze_disease_risk(weather)
        
        return AgriGuardResponse(
            status="success",
            data={
                "weather": weather,
                "risks": risks
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/spray-windows")
async def get_spray_windows(latitude: float, longitude: float):
    """
    Find optimal spray windows in the next 7 days
    
    Returns best times to apply treatments based on:
    - Wind speed
    - Precipitation
    - Humidity
    """
    try:
        forecast = await weather_service.get_forecast(latitude, longitude, 7)
        
        if "error" in forecast:
            raise HTTPException(status_code=400, detail=forecast["error"])
        
        windows = weather_service.get_optimal_spray_windows(forecast.get("forecast", []))
        
        return AgriGuardResponse(
            status="success",
            data={
                "optimal_windows": windows,
                "total_good_days": len(windows)
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
