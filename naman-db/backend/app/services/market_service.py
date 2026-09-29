import random
import math
from typing import List, Dict, Any
from datetime import datetime

class MarketService:
    """
    Service for fetching real-time Mandi (Market) prices and calculating profitability.
    In a production environment, this would integrate with Agmarknet or data.gov.in APIs.
    """
    
    def __init__(self):
        # Base realistic prices (per Quintal / 100kg) in INR for Indian crops
        self.base_prices = {
            "wheat": 2275, # MSP approx
            "rice": 2183,  # Paddy MSP approx
            "tomato": 1500,
            "cotton": 6620,
            "onion": 1800,
            "potato": 1200,
            "soyabean": 4600
        }

    def _generate_realistic_price(self, base_price: int, demand: str) -> int:
        """Add realistic market fluctuation based on demand"""
        fluctuation = 0
        if demand == "Very High":
            fluctuation = random.uniform(0.15, 0.30)  # 15-30% premium
        elif demand == "High":
            fluctuation = random.uniform(0.05, 0.15)
        elif demand == "Low":
            fluctuation = random.uniform(-0.15, -0.05) # 5-15% discount
        else:
            fluctuation = random.uniform(-0.05, 0.05)
            
        final_price = base_price * (1 + fluctuation)
        return int(math.ceil(final_price / 10.0)) * 10 # Round to nearest 10

    def get_market_prices(self, crop: str, quantity_quintals: float, lat: float = None, lon: float = None) -> Dict[str, Any]:
        """
        Fetch market prices for a specific crop across different mandis,
        calculate transport costs, and recommend the best place to sell.
        """
        crop_key = crop.lower().strip()
        base_price = self.base_prices.get(crop_key, 2000) # Default 2000 if unknown
        
        # Generate dynamic mandis based on location presence
        mandis = []
        if lat and lon:
            # Simulate real-time local markets near the provided coordinates
            import hashlib
            import httpx
            
            city_name = "Local"
            district_name = "District"
            state_name = "Regional"
            
            try:
                # Reverse geocode to get actual city/state
                headers = {'User-Agent': 'AgriguardHackathonApp/1.0'}
                url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
                response = httpx.get(url, headers=headers, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    address = data.get('address', {})
                    city_name = address.get('city', address.get('town', address.get('village', 'Local')))
                    district_name = address.get('county', address.get('state_district', 'District'))
                    state_name = address.get('state', 'Regional')
            except Exception as e:
                print(f"Geocoding error: {e}")
                
            seed = int(hashlib.md5(f"{lat},{lon}".encode()).hexdigest(), 16) % 1000
            
            mandis = [
                {"name": f"{city_name} APMC", "distance_km": 5 + (seed % 10), "transport_cost_per_q": 20 + (seed % 10), "demand": "Medium"},
                {"name": f"{district_name} Wholesale Market", "distance_km": 25 + (seed % 20), "transport_cost_per_q": 60 + (seed % 20), "demand": "High"},
                {"name": f"{state_name} Main Agricultural Market", "distance_km": 75 + (seed % 50), "transport_cost_per_q": 150 + (seed % 30), "demand": "Very High"},
                {"name": f"Secondary {district_name} Local Market", "distance_km": 40 + (seed % 15), "transport_cost_per_q": 90 + (seed % 10), "demand": "Low"}
            ]
        else:
            # Fallback mandis if no location provided
            mandis = [
                {"name": "Lasalgaon Mandi", "distance_km": 15, "transport_cost_per_q": 50, "demand": "High"},
                {"name": "Pune APMC", "distance_km": 85, "transport_cost_per_q": 200, "demand": "Very High"},
                {"name": "Nashik Market", "distance_km": 40, "transport_cost_per_q": 100, "demand": "Medium"},
                {"name": "Local Village Market", "distance_km": 5, "transport_cost_per_q": 20, "demand": "Low"}
            ]
        
        results = []
        best_profit = -float('inf')
        best_mandi = None
        
        for mandi in mandis:
            # Current selling price at this mandi
            current_price = self._generate_realistic_price(base_price, mandi["demand"])
            
            # Gross revenue
            gross_revenue = current_price * quantity_quintals
            
            # Transport cost
            total_transport_cost = mandi["transport_cost_per_q"] * quantity_quintals
            
            # Net profit (excluding production cost, just revenue - transport)
            net_profit = gross_revenue - total_transport_cost
            
            mandi_data = {
                "mandi_name": mandi["name"],
                "distance_km": mandi["distance_km"],
                "price_per_quintal": current_price,
                "price_trend": "up" if current_price > base_price else ("down" if current_price < base_price else "stable"),
                "demand": mandi["demand"],
                "transport_cost_total": total_transport_cost,
                "gross_revenue": gross_revenue,
                "net_profit": net_profit,
                "is_recommended": False
            }
            results.append(mandi_data)
            
            if net_profit > best_profit:
                best_profit = net_profit
                best_mandi = mandi_data
                
        # Mark the most profitable mandi
        if best_mandi:
            best_mandi["is_recommended"] = True
            
        # Sort results by net profit descending
        results.sort(key=lambda x: x["net_profit"], reverse=True)
        
        return {
            "crop": crop.capitalize(),
            "quantity_quintals": quantity_quintals,
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "base_msp_approx": base_price,
            "markets": results,
            "summary": f"Selling at {best_mandi['mandi_name']} will yield the highest net profit of ₹{best_mandi['net_profit']:,.2f} after transport costs." if best_mandi else ""
        }
