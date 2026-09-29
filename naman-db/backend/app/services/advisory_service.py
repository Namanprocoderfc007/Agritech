from typing import Dict, Any, List
from datetime import datetime, timedelta
from .weather_service import WeatherService

class AdvisoryService:
    """Service for generating personalized crop schedules"""
    
    def __init__(self):
        self.weather_service = WeatherService()
        # Basic crop lifecycle data (days from sowing)
        self.crop_stages = {
            "wheat": [
                {"day": 0, "stage": "Sowing", "water_need": "Low", "fertilizer": "Basal NPK"},
                {"day": 21, "stage": "Crown Root Initiation (CRI)", "water_need": "Critical", "fertilizer": "First Top Dressing (Urea)"},
                {"day": 45, "stage": "Tillering", "water_need": "Medium", "fertilizer": "Second Top Dressing"},
                {"day": 65, "stage": "Jointing", "water_need": "Medium", "fertilizer": "None"},
                {"day": 85, "stage": "Flowering", "water_need": "Critical", "fertilizer": "None"},
                {"day": 105, "stage": "Milking", "water_need": "Medium", "fertilizer": "None"},
                {"day": 130, "stage": "Harvesting", "water_need": "None", "fertilizer": "None"}
            ],
            "rice": [
                {"day": 0, "stage": "Transplanting", "water_need": "High (Standing Water)", "fertilizer": "Basal NPK + Zinc"},
                {"day": 20, "stage": "Active Tillering", "water_need": "High", "fertilizer": "First Nitrogen Top Dressing"},
                {"day": 45, "stage": "Panicle Initiation", "water_need": "Critical", "fertilizer": "Second Nitrogen Top Dressing"},
                {"day": 70, "stage": "Flowering", "water_need": "Critical", "fertilizer": "None"},
                {"day": 90, "stage": "Grain Filling", "water_need": "Medium", "fertilizer": "None"},
                {"day": 120, "stage": "Harvesting", "water_need": "Drain field", "fertilizer": "None"}
            ],
            "tomato": [
                {"day": 0, "stage": "Transplanting", "water_need": "Medium", "fertilizer": "Basal Application"},
                {"day": 30, "stage": "Vegetative Growth", "water_need": "Medium", "fertilizer": "First Top Dressing (N+K)"},
                {"day": 50, "stage": "Flowering", "water_need": "Critical", "fertilizer": "Micronutrients (Boron/Calcium)"},
                {"day": 70, "stage": "Fruit Set", "water_need": "High", "fertilizer": "Second Top Dressing (K rich)"},
                {"day": 90, "stage": "First Harvest", "water_need": "Medium", "fertilizer": "Maintenance doses"}
            ],
            "cotton": [
                {"day": 0, "stage": "Sowing", "water_need": "Medium", "fertilizer": "Basal Application"},
                {"day": 45, "stage": "Square Formation", "water_need": "Critical", "fertilizer": "First N Top Dressing"},
                {"day": 75, "stage": "Flowering", "water_need": "Critical", "fertilizer": "Second N+K Top Dressing"},
                {"day": 105, "stage": "Boll Development", "water_need": "High", "fertilizer": "Foliar Spray if deficient"},
                {"day": 140, "stage": "Boll Bursting", "water_need": "Low", "fertilizer": "None"}
            ]
        }
        
        # Default fallback for unknown crops
        self.default_stages = [
            {"day": 0, "stage": "Sowing", "water_need": "Medium", "fertilizer": "Basal Dose"},
            {"day": 30, "stage": "Vegetative", "water_need": "Medium", "fertilizer": "Top Dressing"},
            {"day": 60, "stage": "Flowering", "water_need": "Critical", "fertilizer": "Micronutrients"},
            {"day": 90, "stage": "Maturity", "water_need": "Low", "fertilizer": "None"}
        ]

    def _analyze_soil(self, n: int, p: int, k: int) -> List[Dict[str, str]]:
        """Generate soil health insights and deficiency alerts"""
        alerts = []
        
        # Typical threshold values (simplified for demonstration)
        if n < 280:
            alerts.append({"type": "warning", "message": "Low Nitrogen (N). Plan for additional urea/nitrogenous fertilizer during vegetative stage."})
        elif n > 560:
            alerts.append({"type": "info", "message": "High Nitrogen (N). Reduce initial urea application to prevent excessive vegetative growth."})
            
        if p < 10:
            alerts.append({"type": "warning", "message": "Low Phosphorus (P). Ensure adequate DAP/SSP during basal application for root development."})
            
        if k < 120:
            alerts.append({"type": "warning", "message": "Low Potassium (K). Add MOP to improve stress tolerance and fruit/grain quality."})
            
        if not alerts:
            alerts.append({"type": "success", "message": "Soil NPK levels are optimally balanced."})
            
        return alerts

    async def generate_schedule(self, crop: str, sowing_date_str: str, soil_n: int, soil_p: int, soil_k: int, lat: float = None, lon: float = None) -> Dict[str, Any]:
        """
        Generates a personalized farm advisory schedule.
        """
        crop_key = crop.lower().strip()
        stages = self.crop_stages.get(crop_key, self.default_stages)
        
        try:
            sowing_date = datetime.strptime(sowing_date_str, "%Y-%m-%d")
        except ValueError:
            sowing_date = datetime.now()
            
        today = datetime.now()
        
        # Determine current stage
        days_since_sowing = (today - sowing_date).days
        current_stage = "Not planted yet"
        
        # Get weather forecast if location is provided
        rain_forecasted = False
        if lat is not None and lon is not None:
            try:
                forecast = await self.weather_service.get_forecast(lat, lon)
                for day in forecast:
                    if "Rain" in day.get("condition", "") or day.get("precipitation_prob", 0) > 40:
                        rain_forecasted = True
                        break
            except Exception as e:
                print(f"Error fetching weather for advisory: {e}")
        
        timeline = []
        
        for i, stage in enumerate(stages):
            stage_date = sowing_date + timedelta(days=stage["day"])
            status = "pending"
            
            if days_since_sowing >= stage["day"]:
                if i == len(stages) - 1 or days_since_sowing < stages[i+1]["day"]:
                    status = "current"
                    current_stage = stage["stage"]
                else:
                    status = "completed"
            
            # Add dynamic fertilization advice based on soil health if this is a basal application
            fert_advice = stage["fertilizer"]
            if "basal" in fert_advice.lower():
                if soil_p < 10: fert_advice += " (Increase P dosage by 20%)"
                if soil_k < 120: fert_advice += " (Ensure K availability)"
            
            # Modify water needs based on weather forecast for the CURRENT stage
            water_advice = stage["water_need"]
            if status == "current" and rain_forecasted and "Critical" not in water_advice and "High" not in water_advice:
                water_advice = "Skip (Rain Expected)"
            elif status == "current" and rain_forecasted:
                water_advice += " (Reduce due to rain)"
            
            timeline.append({
                "day_offset": stage["day"],
                "date": stage_date.strftime("%Y-%m-%d"),
                "stage": stage["stage"],
                "water_need": water_advice,
                "fertilizer_recommendation": fert_advice,
                "status": status,
                "is_critical_water": "Critical" in stage["water_need"]
            })
            
        soil_alerts = self._analyze_soil(soil_n, soil_p, soil_k)
        
        return {
            "crop": crop.capitalize(),
            "sowing_date": sowing_date_str,
            "days_since_sowing": max(0, days_since_sowing),
            "current_stage": current_stage,
            "soil_health_alerts": soil_alerts,
            "timeline": timeline,
            "next_action": next((t for t in timeline if t["status"] in ["current", "pending"]), None)
        }
