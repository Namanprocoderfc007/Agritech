from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

# ==================== Request Models ====================

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    image_type: str = "leaf"  # leaf, field, soil
    location: Optional[Dict[str, float]] = None  # {lat, lng}
    field_context: Optional[str] = None

class WeatherDataRequest(BaseModel):
    latitude: float
    longitude: float

class IPMStrategyRequest(BaseModel):
    disease_detected: str
    location: Optional[Dict[str, float]] = None
    crop_type: str = "general"
    field_id: Optional[str] = None

class ConversationRequest(BaseModel):
    message: str
    context: Optional[Dict] = None
    field_id: Optional[str] = None

# ==================== Response Models ====================

class DiseaseDetectionResult(BaseModel):
    disease_name: str
    confidence: float  # 0-1
    pest_type: Optional[str] = None
    lifecycle_stage: str  # egg, larva, pupa, adult
    urgency_level: str  # low, medium, high, critical
    description: str
    treatment_organic: Dict[str, str]  # {product: description}
    treatment_chemical: Dict[str, str]  # {product: dosage, safety}
    image_analysis: str

class HealthMapAnalysis(BaseModel):
    overall_health: float  # 0-100
    zones: List[Dict]  # [{zone_id, health_score, concerns}]
    recommendations: List[str]
    watering_priority_zones: List[str]

class IPMStrategy(BaseModel):
    disease: str
    strategy_timeline: List[Dict]  # [{week, action, rationale}]
    companion_plants: List[str]
    predicted_outbreak_date: Optional[str] = None
    prevention_measures: List[str]
    monitoring_schedule: str

class WeatherData(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    precipitation: float
    forecast_7days: List[Dict]

class AgriGuardResponse(BaseModel):
    status: str = "success"
    data: Optional[Dict] = None
    error: Optional[str] = None
    timestamp: datetime = datetime.now()

class AnalysisResult(BaseModel):
    analysis_type: str
    result: Dict
    timestamp: datetime = datetime.now()
