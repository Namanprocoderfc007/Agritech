"""
Chat Routes - Conversational AI interface
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from pydantic import BaseModel
import base64
import uuid

from ..services import ConversationalService
from ..models.schemas import ConversationRequest, AgriGuardResponse

router = APIRouter(prefix="/chat", tags=["Chat"])

chat_service = ConversationalService()


class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    image_base64: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    crop_type: Optional[str] = None
    language: Optional[str] = "en-US"  # Language code for multilingual support


class IPMChatRequest(BaseModel):
    session_id: str
    disease: str
    crop: str = "general"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# Language name mapping for prompts
LANGUAGE_NAMES = {
    "en-US": "English",
    "hi-IN": "Hindi",
    "es-ES": "Spanish",
    "fr-FR": "French",
    "pt-BR": "Portuguese",
    "de-DE": "German",
    "zh-CN": "Chinese (Simplified)",
    "ar-SA": "Arabic",
    "bn-IN": "Bengali",
    "ta-IN": "Tamil",
    "te-IN": "Telugu",
    "mr-IN": "Marathi",
    "gu-IN": "Gujarati",
    "kn-IN": "Kannada",
    "pa-IN": "Punjabi",
}


@router.post("/message")
async def send_message(request: ChatMessage):
    """
    Send a message to the AI Agronomist
    
    You can:
    - Ask questions about farming
    - Upload images for analysis (as base64)
    - Get weather-based advice (provide lat/lng)
    - Request treatment plans
    """
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Build context
        context = {}
        if request.latitude and request.longitude:
            context["latitude"] = request.latitude
            context["longitude"] = request.longitude
        if request.crop_type:
            context["crop_type"] = request.crop_type
        
        # Add language to context for multilingual response
        language = request.language or "en-US"
        language_name = LANGUAGE_NAMES.get(language, "English")
        context["language"] = language
        context["language_instruction"] = f"IMPORTANT: Respond in {language_name}. The user speaks {language_name}."
        
        # Process message
        response = await chat_service.chat(
            user_message=request.message,
            session_id=session_id,
            image_base64=request.image_base64,
            context=context
        )
        
        return {
            "status": "success",
            "session_id": session_id,
            **response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/message/upload")
async def send_message_with_image(
    message: str = Form(...),
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    crop_type: Optional[str] = Form(None),
    language: Optional[str] = Form("en-US")
):
    """
    Send a message with an uploaded image
    """
    try:
        # Read and encode image
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")
        
        session_id = session_id or str(uuid.uuid4())
        
        context = {}
        if latitude and longitude:
            context["latitude"] = latitude
            context["longitude"] = longitude
        if crop_type:
            context["crop_type"] = crop_type
        
        # Add language to context for multilingual response
        language_name = LANGUAGE_NAMES.get(language or "en-US", "English")
        context["language"] = language
        context["language_instruction"] = f"IMPORTANT: Respond in {language_name}. The user speaks {language_name}."
        
        response = await chat_service.chat(
            user_message=message,
            session_id=session_id,
            image_base64=image_base64,
            context=context
        )
        
        return {
            "status": "success",
            "session_id": session_id,
            **response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ipm-strategy")
async def get_ipm_in_chat(request: IPMChatRequest):
    """
    Get an IPM strategy as part of a conversation
    """
    try:
        response = await chat_service.get_ipm_for_conversation(
            session_id=request.session_id,
            disease=request.disease,
            crop=request.crop,
            latitude=request.latitude,
            longitude=request.longitude
        )
        
        return {
            "status": "success",
            **response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """
    Clear conversation history for a session
    """
    chat_service.clear_history(session_id)
    return {"status": "success", "message": "Session cleared"}


@router.get("/session/{session_id}")
async def get_session_info(session_id: str):
    """
    Get information about a chat session
    """
    history = chat_service.conversation_history.get(session_id, [])
    return {
        "status": "success",
        "session_id": session_id,
        "message_count": len(history),
        "has_history": len(history) > 0
    }
