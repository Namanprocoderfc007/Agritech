from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from ..services.sms_service import SMSService

router = APIRouter()
sms_service = SMSService()
    
class SMSRequest(BaseModel):
    phone_number: str
    message: Optional[str] = None
    crop: Optional[str] = None
    alert_type: Optional[str] = None # 'weather' or 'pest'
    condition_or_pest: Optional[str] = None
    is_whatsapp: Optional[bool] = False
    
class AgriGuardResponse(BaseModel):
    status: str
    data: dict

@router.post("/send", response_model=AgriGuardResponse)
async def send_sms_alert(req: SMSRequest):
    """
    Send an SMS or WhatsApp alert to a farmer. 
    Can either pass a direct `message` or pass `alert_type`, `crop`, and `condition_or_pest` to generate one.
    """
    try:
        final_message = req.message
        
        if not final_message:
            if req.alert_type == 'weather':
                final_message = sms_service.generate_weather_alert(req.crop or "crop", req.condition_or_pest or "normal")
            elif req.alert_type == 'pest':
                final_message = sms_service.generate_pest_alert(req.crop or "crop", req.condition_or_pest or "unknown pest")
            else:
                raise HTTPException(status_code=400, detail="Must provide either 'message' or 'alert_type' with context.")
                
        result = sms_service.send_alert(to_phone=req.phone_number, message=final_message, is_whatsapp=req.is_whatsapp)
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
            
        return AgriGuardResponse(status="success", data=result)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
