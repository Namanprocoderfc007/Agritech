from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from ..services.market_service import MarketService

router = APIRouter()
market_service = MarketService()
    
class AgriGuardResponse(BaseModel):
    status: str
    data: dict

@router.get("/prices", response_model=AgriGuardResponse)
def get_market_prices(
    crop: str = Query(..., description="Name of the crop (e.g. wheat, tomato)"),
    quantity: float = Query(1.0, description="Quantity in Quintals (100kg)"),
    lat: Optional[float] = None,
    lon: Optional[float] = None
):
    """
    Get real-time mandi prices and profitability recommendations for a crop.
    """
    try:
        result = market_service.get_market_prices(crop=crop, quantity_quintals=quantity, lat=lat, lon=lon)
        return AgriGuardResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
