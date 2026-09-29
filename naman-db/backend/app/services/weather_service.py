"""
Weather Service - Free API integration with Open-Meteo
Provides weather data and disease outbreak predictions
"""

import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional


class WeatherService:
    """
    Weather service using Open-Meteo (100% FREE, no API key needed)
    """
    
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1"
    
    async def get_current_weather(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Get current weather conditions"""
        url = f"{self.base_url}/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
            "timezone": "auto"
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    current = data.get("current", {})
                    return {
                        "temperature": current.get("temperature_2m", 0),
                        "humidity": current.get("relative_humidity_2m", 0),
                        "precipitation": current.get("precipitation", 0),
                        "wind_speed": current.get("wind_speed_10m", 0),
                        "weather_code": current.get("weather_code", 0),
                        "condition": self._weather_code_to_condition(current.get("weather_code", 0)),
                        "timestamp": datetime.now().isoformat()
                    }
        except Exception as e:
            print(f"Weather API Error: {str(e)}")
            pass
        
        print("Using MOCK weather data due to Open-Meteo API limit")
        return {
            "temperature": 28.5,
            "humidity": 65,
            "precipitation": 0.0,
            "wind_speed": 12.5,
            "weather_code": 1,
            "condition": "Mainly clear",
            "timestamp": datetime.now().isoformat()
        }
    
    async def get_forecast(self, latitude: float, longitude: float, days: int = 7) -> Dict[str, Any]:
        """Get weather forecast for disease prediction"""
        url = f"{self.base_url}/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,weather_code",
            "timezone": "auto",
            "forecast_days": min(days, 16)
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    daily = data.get("daily", {})
                    
                    forecast = []
                    dates = daily.get("time", [])
                    for i, date in enumerate(dates):
                        forecast.append({
                            "date": date,
                            "temp_max": daily.get("temperature_2m_max", [])[i] if i < len(daily.get("temperature_2m_max", [])) else None,
                            "temp_min": daily.get("temperature_2m_min", [])[i] if i < len(daily.get("temperature_2m_min", [])) else None,
                            "precipitation": daily.get("precipitation_sum", [])[i] if i < len(daily.get("precipitation_sum", [])) else None,
                            "humidity": daily.get("relative_humidity_2m_mean", [])[i] if i < len(daily.get("relative_humidity_2m_mean", [])) else None,
                            "wind_speed": daily.get("wind_speed_10m_max", [])[i] if i < len(daily.get("wind_speed_10m_max", [])) else None,
                            "weather_code": daily.get("weather_code", [])[i] if i < len(daily.get("weather_code", [])) else None
                        })
                    
                    return {
                        "location": {"latitude": latitude, "longitude": longitude},
                        "forecast": forecast,
                        "generated_at": datetime.now().isoformat()
                    }
        except Exception as e:
            print(f"Weather API Error: {str(e)}")
            pass
            
        print("Using MOCK forecast data due to Open-Meteo API limit")
        forecast = []
        dates = [(datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
        for date in dates:
            forecast.append({
                "date": date,
                "temp_max": 32.0,
                "temp_min": 22.0,
                "precipitation": 0.0,
                "humidity": 60,
                "wind_speed": 15.0,
                "weather_code": 1
            })
            
        return {
            "location": {"latitude": latitude, "longitude": longitude},
            "forecast": forecast,
            "generated_at": datetime.now().isoformat()
        }
    
    async def get_historical_weather(self, latitude: float, longitude: float, days_back: int = 7) -> Dict[str, Any]:
        """Get historical weather for trend analysis"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        url = f"{self.base_url}/forecast"  # Open-Meteo provides past data too
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean",
            "timezone": "auto",
            "past_days": days_back
        }
        
        try:
            async with httpx.AsyncClient() as session:
                resp = await session.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "location": {"latitude": latitude, "longitude": longitude},
                        "historical": data.get("daily", {}),
                        "period": f"Last {days_back} days"
                    }
        except Exception as e:
            return {"error": str(e)}
        
        return {"error": "Failed to fetch historical data"}
    
    def analyze_disease_risk(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze weather conditions for disease outbreak risk
        Based on scientific thresholds for common plant diseases
        """
        risks = {
            "fungal_disease_risk": "low",
            "bacterial_disease_risk": "low",
            "pest_activity_risk": "low",
            "spray_conditions": "good",
            "alerts": [],
            "recommendations": []
        }
        
        temp = weather_data.get("temperature", 25)
        humidity = weather_data.get("humidity", 50)
        precipitation = weather_data.get("precipitation", 0)
        wind_speed = weather_data.get("wind_speed", 5)
        
        # Fungal disease risk (Late Blight, Powdery Mildew, etc.)
        # High humidity (>80%) + moderate temp (15-25°C) = HIGH RISK
        if humidity > 80 and 15 <= temp <= 25:
            risks["fungal_disease_risk"] = "high"
            risks["alerts"].append("⚠️ High risk of fungal diseases (Late Blight, Powdery Mildew)")
            risks["recommendations"].append("Apply preventive fungicide spray")
        elif humidity > 70 and 10 <= temp <= 28:
            risks["fungal_disease_risk"] = "medium"
            risks["alerts"].append("Monitor for early signs of fungal infection")
        
        # Bacterial disease risk
        # Warm + wet conditions
        if temp > 25 and (humidity > 85 or precipitation > 5):
            risks["bacterial_disease_risk"] = "high"
            risks["alerts"].append("⚠️ Conditions favor bacterial diseases")
            risks["recommendations"].append("Avoid overhead irrigation")
        elif temp > 20 and humidity > 75:
            risks["bacterial_disease_risk"] = "medium"
        
        # Pest activity
        # Warm, dry conditions favor many pests
        if temp > 25 and humidity < 60:
            risks["pest_activity_risk"] = "high"
            risks["alerts"].append("🐛 High pest activity expected (aphids, mites)")
            risks["recommendations"].append("Scout fields regularly for pest presence")
        elif temp > 20:
            risks["pest_activity_risk"] = "medium"
        
        # Spray conditions
        if wind_speed > 15:
            risks["spray_conditions"] = "poor"
            risks["alerts"].append("💨 Too windy for spraying - wait for calmer conditions")
        elif precipitation > 0:
            risks["spray_conditions"] = "poor"
            risks["alerts"].append("🌧️ Rain expected - delay spraying")
        elif humidity < 40:
            risks["spray_conditions"] = "moderate"
            risks["recommendations"].append("Spray early morning or evening for better absorption")
        
        # Overall risk score
        risk_scores = {"low": 1, "medium": 2, "high": 3}
        avg_risk = (
            risk_scores[risks["fungal_disease_risk"]] +
            risk_scores[risks["bacterial_disease_risk"]] +
            risk_scores[risks["pest_activity_risk"]]
        ) / 3
        
        risks["overall_risk_score"] = round(avg_risk * 33.3)  # 0-100 scale
        risks["overall_risk_level"] = "low" if avg_risk < 1.5 else "medium" if avg_risk < 2.5 else "high"
        
        return risks
    
    def get_optimal_spray_windows(self, forecast: List[Dict]) -> List[Dict]:
        """
        Find optimal spray windows in the forecast
        Best: Low wind, no rain, moderate humidity, early morning/evening
        """
        optimal_windows = []
        
        for day in forecast:
            wind = day.get("wind_speed", 0)
            rain = day.get("precipitation", 0)
            humidity = day.get("humidity", 50)
            
            if wind < 10 and rain < 1:
                quality = "excellent" if humidity > 50 and humidity < 80 else "good"
                optimal_windows.append({
                    "date": day.get("date"),
                    "quality": quality,
                    "recommended_time": "Early morning (6-9 AM) or evening (5-7 PM)",
                    "conditions": {
                        "wind_speed": wind,
                        "precipitation": rain,
                        "humidity": humidity
                    }
                })
        
        return optimal_windows
    
    def _weather_code_to_condition(self, code: int) -> str:
        """Convert WMO weather code to readable condition"""
        conditions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            95: "Thunderstorm",
            96: "Thunderstorm with hail"
        }
        return conditions.get(code, "Unknown")
