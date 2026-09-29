from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..services.advisory_service import AdvisoryService

router = APIRouter()
advisory_service = AdvisoryService()

class AdvisoryRequest(BaseModel):
    crop: str
    sowing_date: str
    soil_n: int = 150 # default values if not provided
    soil_p: int = 20
    soil_k: int = 100
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
class AgriGuardResponse(BaseModel):
    status: str
    data: dict

@router.post("/schedule", response_model=AgriGuardResponse)
async def generate_schedule(req: AdvisoryRequest):
    """
    Generate a personalized crop schedule based on crop type, sowing date, soil health, and weather.
    """
    try:
        result = await advisory_service.generate_schedule(
            crop=req.crop,
            sowing_date_str=req.sowing_date,
            soil_n=req.soil_n,
            soil_p=req.soil_p,
            soil_k=req.soil_k,
            lat=req.latitude,
            lon=req.longitude
        )
        return AgriGuardResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
