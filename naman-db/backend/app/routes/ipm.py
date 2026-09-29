"""
IPM (Integrated Pest Management) Routes
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

from ..services import IPMStrategyService
from ..models.schemas import IPMStrategyRequest, AgriGuardResponse

router = APIRouter(prefix="/ipm", tags=["IPM Strategy"])

ipm_service = IPMStrategyService()


class StrategyRequest(BaseModel):
    disease: str
    crop: str = "general"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    context: Optional[str] = ""


@router.post("/strategy")
async def generate_ipm_strategy(request: StrategyRequest):
    """
    Generate a comprehensive IPM strategy
    
    Provides:
    - Immediate action plan
    - Weekly treatment schedule
    - Organic solutions
    - Chemical options with safety info
    - Companion planting recommendations
    - Biological controls
    - Prevention measures
    """
    try:
        strategy = await ipm_service.generate_strategy(
            disease=request.disease,
            crop=request.crop,
            latitude=request.latitude,
            longitude=request.longitude,
            context=request.context or ""
        )
        
        return AgriGuardResponse(
            status="success",
            data=strategy
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quick/{disease}")
async def quick_recommendation(disease: str, crop: str = "general"):
    """
    Get a quick, conversational recommendation for a disease/pest
    """
    try:
        recommendation = await ipm_service.get_quick_recommendation(disease, crop)
        
        return {
            "status": "success",
            "disease": disease,
            "crop": crop,
            "recommendation": recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predict-outbreak")
async def predict_outbreak(latitude: float, longitude: float, crop: str = "general"):
    """
    Predict disease outbreak risk for the next 7 days
    
    Based on weather forecast and crop-specific risk factors
    """
    try:
        prediction = await ipm_service.predict_outbreak_risk(latitude, longitude, crop)
        
        if "error" in prediction:
            raise HTTPException(status_code=400, detail=prediction["error"])
        
        return AgriGuardResponse(
            status="success",
            data=prediction
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Preset disease recommendations
COMMON_DISEASES_DB = {
    "late_blight": {
        "name": "Late Blight",
        "crops": ["tomato", "potato"],
        "organic": ["Copper fungicide", "Baking soda spray", "Remove infected leaves"],
        "chemical": ["Mancozeb", "Chlorothalonil", "Metalaxyl"],
        "prevention": ["Avoid overhead watering", "Improve air circulation", "Resistant varieties"]
    },
    "powdery_mildew": {
        "name": "Powdery Mildew",
        "crops": ["cucumber", "squash", "grapes", "roses"],
        "organic": ["Neem oil", "Milk spray (40% milk)", "Sulfur"],
        "chemical": ["Myclobutanil", "Propiconazole"],
        "prevention": ["Space plants properly", "Morning watering", "Prune for airflow"]
    },
    "aphids": {
        "name": "Aphid Infestation",
        "crops": ["all"],
        "organic": ["Neem oil", "Insecticidal soap", "Ladybugs", "Strong water spray"],
        "chemical": ["Imidacloprid", "Acetamiprid"],
        "prevention": ["Companion planting with marigolds", "Remove weeds", "Attract beneficial insects"]
    },
    "fall_armyworm": {
        "name": "Fall Armyworm",
        "crops": ["corn", "rice", "sorghum"],
        "organic": ["Bt (Bacillus thuringiensis)", "Neem oil", "Trichogramma wasps"],
        "chemical": ["Spinosad", "Chlorantraniliprole", "Emamectin benzoate"],
        "prevention": ["Early planting", "Pheromone traps", "Destroy crop residue"]
    }
}


@router.get("/database/{disease_key}")
async def get_disease_info(disease_key: str):
    """
    Get preset information about common diseases
    """
    disease = COMMON_DISEASES_DB.get(disease_key.lower())
    
    if not disease:
        available = list(COMMON_DISEASES_DB.keys())
        raise HTTPException(
            status_code=404, 
            detail=f"Disease not found. Available: {available}"
        )
    
    return {
        "status": "success",
        "data": disease
    }


@router.get("/database")
async def list_diseases():
    """
    List all diseases in the database
    """
    return {
        "status": "success",
        "diseases": list(COMMON_DISEASES_DB.keys()),
        "data": COMMON_DISEASES_DB
    }
