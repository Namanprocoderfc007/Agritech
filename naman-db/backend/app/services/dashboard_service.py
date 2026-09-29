from typing import Dict, Any, List
import random
from datetime import datetime, timedelta

class DashboardService:
    """
    Mock service to simulate IoT hardware sensor data for Field Analytics.
    Returns dynamic data for Yield Trends, Soil Health, and Field Stats.
    """
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        # Generate some slightly dynamic data to simulate live sensors
        
        # 1. Soil Health Data (NPK, pH, Moisture)
        soil_health_data = [
            {"name": "pH Level", "current": round(random.uniform(6.0, 7.5), 1), "optimal": 7.0},
            {"name": "Nitrogen", "current": random.randint(70, 95), "optimal": 90},
            {"name": "Phosphorus", "current": random.randint(65, 85), "optimal": 80},
            {"name": "Potassium", "current": random.randint(80, 95), "optimal": 85},
            {"name": "Organic Matter", "current": random.randint(60, 75), "optimal": 75},
        ]
        
        # 2. Yield Trend Data (Mock historical data)
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        yield_trend_data = []
        base_corn = 60
        base_wheat = 130
        base_soybeans = 190
        
        for month in months:
            yield_trend_data.append({
                "month": month,
                "corn": base_corn + random.randint(0, 10),
                "wheat": base_wheat + random.randint(0, 15),
                "soybeans": base_soybeans + random.randint(0, 20)
            })
            base_corn += 5
            base_wheat += 10
            base_soybeans += 15
            
        # 3. Top Level Stats
        stats = {
            "yield_index": {
                "value": round(random.uniform(88.0, 95.0), 1),
                "change": round(random.uniform(-2.0, 8.0), 1)
            },
            "water_efficiency": {
                "value": f"{random.randint(80, 95)}%",
                "change": round(random.uniform(0.5, 3.5), 1)
            },
            "soil_score": {
                "value": round(random.uniform(70.0, 85.0), 1),
                "change": round(random.uniform(-3.0, 2.0), 1)
            }
        }
        
        # 4. Overview numbers
        overview = {
            "active_fields": random.randint(10, 15),
            "total_acreage": random.randint(800, 900),
            "active_alerts": random.randint(0, 5),
            "tasks_due": random.randint(2, 10)
        }
        
        return {
            "stats": stats,
            "soilHealthData": soil_health_data,
            "yieldTrendData": yield_trend_data,
            "overview": overview
        }
