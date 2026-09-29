"""
Analysis Routes - Disease detection, health mapping
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import base64

from ..services import DiseaseDetectionService
from ..models.schemas import ImageAnalysisRequest, AgriGuardResponse

router = APIRouter(prefix="/analysis", tags=["Analysis"])

disease_service = DiseaseDetectionService()


@router.post("/leaf", response_model=AgriGuardResponse)
async def analyze_leaf(request: ImageAnalysisRequest):
    """
    Analyze a leaf image for diseases and pests
    
    Upload a base64-encoded image of a plant leaf to get:
    - Disease identification
    - Pest detection
    - Treatment recommendations (organic + chemical)
    - Urgency assessment
    """
    try:
        result = await disease_service.analyze_leaf(
            image_base64=request.image_base64,
            context=request.field_context or ""
        )
        
        return AgriGuardResponse(
            status="success",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leaf/upload")
async def analyze_leaf_upload(
    file: UploadFile = File(...),
    crop_type: Optional[str] = Form(None),
    context: Optional[str] = Form(None),
    language: Optional[str] = Form("en-US")
):
    """
    Upload an image file directly for analysis
    """
    try:
        # Read and encode image
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")
        
        # Analyze
        result = await disease_service.analyze_leaf(
            image_base64=image_base64,
            context=f"Crop: {crop_type}. {context}" if crop_type else context or "",
            language=language
        )
        
        return AgriGuardResponse(
            status="success",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/field", response_model=AgriGuardResponse)
async def analyze_field(request: ImageAnalysisRequest):
    """
    Analyze satellite/drone field imagery
    
    Get a health map with:
    - Zone-by-zone health assessment
    - Stress indicators
    - Priority action areas
    - Watering recommendations
    """
    try:
        result = await disease_service.analyze_field(
            image_base64=request.image_base64,
            field_info=request.field_context or ""
        )
        
        return AgriGuardResponse(
            status="success",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick")
async def quick_diagnosis(
    file: UploadFile = File(...),
    question: str = Form("What's wrong with this plant?")
):
    """
    Quick conversational diagnosis
    Upload an image and ask a question about it
    """
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")
        
        result = await disease_service.quick_diagnosis(image_base64, question)
        
        return {
            "status": "success",
            "response": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
