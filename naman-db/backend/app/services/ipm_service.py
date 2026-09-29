"""
IPM (Integrated Pest Management) Strategy Service
Generates comprehensive, sustainable pest management plans
"""

from typing import Dict, Any, List, Optional
from .ai_provider import SmartAIProvider
from .weather_service import WeatherService
import json
import re


IPM_STRATEGY_PROMPT = """You are an expert integrated pest management (IPM) specialist. 
Generate a comprehensive, sustainable pest management strategy based on the following information.

Disease/Pest Detected: {disease}
Crop Type: {crop}
Location Weather: {weather}
Field Context: {context}

Provide your IPM strategy in the following JSON format:
{{
    "strategy_name": "Name of the strategy",
    "disease_pest": "{disease}",
    "risk_assessment": {{
        "current_severity": "low/medium/high/critical",
        "spread_risk": "low/medium/high",
        "yield_impact_if_untreated": "X% potential loss"
    }},
    "immediate_actions": [
        {{
            "action": "What to do",
            "timing": "When to do it",
            "priority": "high/medium/low"
        }}
    ],
    "weekly_plan": [
        {{
            "week": 1,
            "actions": ["action 1", "action 2"],
            "monitoring": "What to monitor",
            "expected_outcome": "What should improve"
        }},
        {{
            "week": 2,
            "actions": ["action 1"],
            "monitoring": "What to monitor",
            "expected_outcome": "Expected improvement"
        }}
    ],
    "organic_solutions": [
        {{
            "product": "Product name",
            "application": "How to apply",
            "frequency": "How often",
            "effectiveness": "Expected effectiveness %"
        }}
    ],
    "chemical_solutions": [
        {{
            "product": "Product name",
            "active_ingredient": "Chemical name",
            "dosage": "X ml/L or g/L",
            "safety_period": "Days before harvest",
            "safety_precautions": ["precaution 1", "precaution 2"]
        }}
    ],
    "companion_planting": [
        {{
            "plant": "Plant name",
            "benefit": "How it helps",
            "placement": "Where to plant"
        }}
    ],
    "biological_controls": [
        {{
            "organism": "Beneficial organism",
            "target_pest": "What it controls",
            "application": "How to introduce"
        }}
    ],
    "cultural_practices": [
        "Practice 1: Description",
        "Practice 2: Description"
    ],
    "monitoring_schedule": {{
        "frequency": "Daily/Weekly/Bi-weekly",
        "what_to_check": ["symptom 1", "symptom 2"],
        "action_thresholds": "When to take action"
    }},
    "prevention_for_next_season": [
        "Preventive measure 1",
        "Preventive measure 2"
    ],
    "weather_considerations": {{
        "spray_timing": "Best conditions for spraying",
        "outbreak_risk_factors": ["factor 1", "factor 2"]
    }},
    "success_metrics": {{
        "week_1_target": "Expected improvement",
        "week_4_target": "Disease should be controlled",
        "season_end_goal": "Full recovery"
    }}
}}

Make the strategy practical, sustainable, and farmer-friendly. Prioritize organic solutions but include chemical options for severe cases."""


class IPMStrategyService:
    """Generate comprehensive Integrated Pest Management strategies"""
    
    def __init__(self):
        self.ai = SmartAIProvider()
        self.weather_service = WeatherService()
    
    async def generate_strategy(
        self,
        disease: str,
        crop: str = "general",
        latitude: float = None,
        longitude: float = None,
        context: str = ""
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive IPM strategy
        
        Args:
            disease: Detected disease or pest
            crop: Type of crop
            latitude: Location latitude
            longitude: Location longitude
            context: Additional context
        
        Returns:
            Complete IPM strategy
        """
        # Get weather data if location provided
        weather_info = "Not available"
        weather_risks = {}
        
        if latitude and longitude:
            current = await self.weather_service.get_current_weather(latitude, longitude)
            forecast = await self.weather_service.get_forecast(latitude, longitude, days=7)
            
            if "error" not in current:
                weather_risks = self.weather_service.analyze_disease_risk(current)
                weather_info = f"""
                Temperature: {current.get('temperature')}°C
                Humidity: {current.get('humidity')}%
                Conditions: {current.get('condition')}
                Disease Risk: {weather_risks.get('overall_risk_level', 'unknown')}
                """
        
        # Generate IPM strategy using AI
        prompt = IPM_STRATEGY_PROMPT.format(
            disease=disease,
            crop=crop,
            weather=weather_info,
            context=context
        )
        
        response = await self.ai.generate_text(prompt)
        strategy = self._parse_strategy_response(response)
        
        # Enhance with weather-based recommendations
        if weather_risks:
            strategy["weather_analysis"] = weather_risks
            if latitude and longitude:
                spray_windows = self.weather_service.get_optimal_spray_windows(
                    forecast.get("forecast", [])
                )
                strategy["optimal_spray_windows"] = spray_windows[:3]  # Top 3
        
        # Add companion planting if not present
        if not strategy.get("companion_planting"):
            strategy["companion_planting"] = self._get_companion_plants(crop, disease)
        
        return strategy
    
    async def get_quick_recommendation(self, disease: str, crop: str = "general") -> str:
        """Get a quick, conversational recommendation"""
        prompt = f"""A farmer has detected {disease} in their {crop} crop.
        
Give a brief, friendly recommendation covering:
1. How serious is this? (1 sentence)
2. What should they do RIGHT NOW? (2-3 bullet points)
3. One organic solution and one chemical solution
4. How to prevent this in the future (1-2 tips)

Keep it concise and practical."""
        
        return await self.ai.generate_text(prompt)
    
    async def predict_outbreak_risk(
        self,
        latitude: float,
        longitude: float,
        crop: str
    ) -> Dict[str, Any]:
        """
        Predict disease outbreak risk based on weather
        """
        # Get forecast
        forecast = await self.weather_service.get_forecast(latitude, longitude, days=7)
        
        if "error" in forecast:
            return {"error": forecast["error"]}
        
        # Analyze each day for risk
        daily_risks = []
        for day in forecast.get("forecast", []):
            temp = (day.get("temp_max", 20) + day.get("temp_min", 10)) / 2
            humidity = day.get("humidity", 50)
            rain = day.get("precipitation", 0)
            
            # Calculate risk score
            risk_score = 0
            risk_factors = []
            
            if humidity > 80:
                risk_score += 30
                risk_factors.append("High humidity")
            elif humidity > 70:
                risk_score += 15
            
            if 15 <= temp <= 25:
                risk_score += 20
                risk_factors.append("Optimal fungal growth temperature")
            
            if rain > 5:
                risk_score += 25
                risk_factors.append("Significant rainfall")
            elif rain > 0:
                risk_score += 10
            
            daily_risks.append({
                "date": day.get("date"),
                "risk_score": min(risk_score, 100),
                "risk_level": "low" if risk_score < 30 else "medium" if risk_score < 60 else "high",
                "factors": risk_factors,
                "diseases_at_risk": self._get_diseases_at_risk(temp, humidity, rain, crop)
            })
        
        # Find peak risk days
        peak_risk_days = [d for d in daily_risks if d["risk_level"] == "high"]
        
        return {
            "crop": crop,
            "location": {"latitude": latitude, "longitude": longitude},
            "daily_risks": daily_risks,
            "peak_risk_days": peak_risk_days,
            "overall_outlook": "high_alert" if len(peak_risk_days) >= 3 else "moderate" if len(peak_risk_days) >= 1 else "favorable",
            "recommendations": self._get_predictive_recommendations(daily_risks, crop)
        }
    
    def _parse_strategy_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response into structured strategy"""
        try:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
        
        return {
            "strategy_name": "Generated Strategy",
            "raw_strategy": response,
            "immediate_actions": [{"action": "See detailed analysis", "priority": "high"}],
            "parse_error": True
        }
    
    def _get_companion_plants(self, crop: str, disease: str) -> List[Dict]:
        """Get companion planting recommendations"""
        companions = {
            "tomato": [
                {"plant": "Basil", "benefit": "Repels aphids, whiteflies, and improves flavor", "placement": "Interplant every 2-3 tomato plants"},
                {"plant": "Marigold", "benefit": "Deters nematodes, whiteflies, and many pests", "placement": "Border planting around field"},
                {"plant": "Garlic", "benefit": "Natural fungicide, repels spider mites", "placement": "Interplant throughout"}
            ],
            "potato": [
                {"plant": "Horseradish", "benefit": "Deters potato beetles", "placement": "Corners of the field"},
                {"plant": "Marigold", "benefit": "Reduces nematode population", "placement": "Border rows"}
            ],
            "corn": [
                {"plant": "Beans", "benefit": "Fixes nitrogen, supports corn stalks", "placement": "Three Sisters method"},
                {"plant": "Squash", "benefit": "Shades soil, deters raccoons", "placement": "Three Sisters method"}
            ],
            "default": [
                {"plant": "Marigold", "benefit": "General pest deterrent", "placement": "Field borders"},
                {"plant": "Nasturtium", "benefit": "Trap crop for aphids", "placement": "Field edges"}
            ]
        }
        return companions.get(crop.lower(), companions["default"])
    
    def _get_diseases_at_risk(self, temp: float, humidity: float, rain: float, crop: str) -> List[str]:
        """Get diseases most likely under given conditions"""
        diseases = []
        
        if humidity > 80 and 15 <= temp <= 25:
            diseases.extend(["Late Blight", "Downy Mildew", "Powdery Mildew"])
        
        if temp > 25 and humidity > 70:
            diseases.extend(["Bacterial Spot", "Bacterial Wilt"])
        
        if rain > 10:
            diseases.extend(["Root Rot", "Damping Off"])
        
        if humidity < 50 and temp > 25:
            diseases.extend(["Spider Mite infestation", "Aphid outbreak"])
        
        return diseases[:4]  # Top 4 risks
    
    def _get_predictive_recommendations(self, daily_risks: List[Dict], crop: str) -> List[str]:
        """Generate recommendations based on predicted risks"""
        recommendations = []
        
        high_risk_count = sum(1 for d in daily_risks if d["risk_level"] == "high")
        
        if high_risk_count >= 3:
            recommendations.append("🚨 HIGH ALERT: Apply preventive fungicide treatment immediately")
            recommendations.append("Increase field monitoring to daily inspections")
        elif high_risk_count >= 1:
            recommendations.append("⚠️ Apply preventive organic treatment (neem oil or copper spray)")
            recommendations.append("Monitor closely for early disease symptoms")
        
        # Check for rain
        rainy_days = [d for d in daily_risks if d.get("factors") and "rainfall" in str(d["factors"]).lower()]
        if rainy_days:
            recommendations.append("Ensure proper drainage before rainfall")
            recommendations.append("Apply treatments before rain, not after")
        
        recommendations.append("Remove any diseased plant material immediately")
        
        return recommendations
