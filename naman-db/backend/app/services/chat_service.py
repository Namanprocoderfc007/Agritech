"""
Conversational AI Service
Handles chat interactions with the AI Agronomist
"""

from typing import Dict, Any, List, Optional
from .ai_provider import SmartAIProvider
from .disease_detection import DiseaseDetectionService
from .ipm_service import IPMStrategyService
from .weather_service import WeatherService


AGRONOMIST_SYSTEM_PROMPT = """You are AgriGuard AI, a friendly and knowledgeable agricultural advisor. 
You help farmers with:
- Plant disease identification and treatment
- Pest management strategies
- Crop health optimization
- Weather-based farming advice
- Sustainable farming practices

Guidelines:
1. Be conversational and friendly - farmers should feel comfortable asking questions
2. Use simple language, avoid excessive jargon
3. Always provide actionable advice
4. When discussing treatments, mention BOTH organic and chemical options
5. Consider the farmer's context (location, crop type, season)
6. If unsure, ask clarifying questions
7. Prioritize sustainable, long-term solutions over quick fixes
8. Include safety warnings when discussing chemicals

You can analyze images of plants, leaves, and fields when provided.
You have access to weather data and can predict disease outbreaks.
You can create comprehensive IPM (Integrated Pest Management) strategies.

Respond naturally and helpfully. If the farmer sends an image, analyze it thoroughly."""


class ConversationalService:
    """Handles conversational interactions with farmers"""
    
    def __init__(self):
        self.ai = SmartAIProvider()
        self.disease_service = DiseaseDetectionService()
        self.ipm_service = IPMStrategyService()
        self.weather_service = WeatherService()
        self.conversation_history: Dict[str, List[Dict]] = {}
    
    async def chat(
        self,
        user_message: str,
        session_id: str = "default",
        image_base64: str = None,
        context: Dict = None
    ) -> Dict[str, Any]:
        """
        Process a chat message from the farmer
        
        Args:
            user_message: The farmer's message
            session_id: Session ID for conversation history
            image_base64: Optional image for analysis
            context: Additional context (location, crop type, etc.)
        
        Returns:
            AI response with any analysis results
        """
        # Initialize conversation history for session
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        response_data = {
            "message": "",
            "analysis": None,
            "suggestions": [],
            "actions_available": []
        }
        
        # If image is provided, analyze it first
        if image_base64:
            # Build language instruction
            lang_instruction = ""
            if context and context.get("language_instruction"):
                lang_instruction = context["language_instruction"] + " "
            
            # Analyze the image
            image_analysis = await self.disease_service.quick_diagnosis(
                image_base64, 
                lang_instruction + (user_message or "What's wrong with this plant?")
            )
            
            # Get structured analysis too
            detailed_analysis = await self.disease_service.analyze_leaf(
                image_base64,
                context.get("crop_type", "") if context else ""
            )
            
            response_data["analysis"] = detailed_analysis
            response_data["message"] = image_analysis
            
            # Add follow-up suggestions
            if detailed_analysis.get("disease_detected"):
                disease = detailed_analysis.get("disease_name", "detected issue")
                response_data["suggestions"] = [
                    f"Would you like a detailed IPM strategy for {disease}?",
                    "Should I check the weather conditions for spraying?",
                    "Want to see treatment options in detail?"
                ]
                response_data["actions_available"] = [
                    {"action": "get_ipm_strategy", "label": "Get Treatment Plan"},
                    {"action": "check_weather", "label": "Check Spray Conditions"},
                    {"action": "more_info", "label": "Learn More About This Disease"}
                ]
        else:
            # Regular text conversation
            # Add user message to history
            self.conversation_history[session_id].append({
                "role": "user",
                "content": user_message
            })
            
            # Check for special intents
            intent = self._detect_intent(user_message)
            
            if intent == "weather":
                # Handle weather query
                if context and context.get("latitude") and context.get("longitude"):
                    weather = await self.weather_service.get_current_weather(
                        context["latitude"], context["longitude"]
                    )
                    risks = self.weather_service.analyze_disease_risk(weather)
                    
                    weather_msg = f"""Current conditions at your location:
🌡️ Temperature: {weather.get('temperature')}°C
💧 Humidity: {weather.get('humidity')}%
💨 Wind Speed: {weather.get('wind_speed')} km/h
🌤️ Conditions: {weather.get('condition')}

Disease Risk Assessment:
- Fungal Disease Risk: {risks.get('fungal_disease_risk')}
- Pest Activity Risk: {risks.get('pest_activity_risk')}
- Spray Conditions: {risks.get('spray_conditions')}

"""
                    if risks.get("alerts"):
                        weather_msg += "⚠️ Alerts:\n" + "\n".join(risks["alerts"])
                    
                    response_data["message"] = weather_msg
                else:
                    response_data["message"] = "I'd love to check the weather for you! Could you share your location or enter your coordinates?"
                    response_data["actions_available"] = [
                        {"action": "share_location", "label": "Share My Location"}
                    ]
            
            elif intent == "ipm":
                # User wants an IPM strategy
                response_data["message"] = "I can create a comprehensive pest management plan for you. What disease or pest are you dealing with? And what crop is affected?"
                response_data["suggestions"] = [
                    "Late Blight on tomatoes",
                    "Aphids on vegetables",
                    "Powdery Mildew on cucumbers"
                ]
            
            else:
                # General conversation
                # Build system prompt with language instruction
                system_prompt = AGRONOMIST_SYSTEM_PROMPT
                if context and context.get("language_instruction"):
                    system_prompt = context["language_instruction"] + "\n\n" + system_prompt
                
                ai_response = await self.ai.chat(
                    self.conversation_history[session_id],
                    system_prompt
                )
                
                response_data["message"] = ai_response
                
                # Add to history
                self.conversation_history[session_id].append({
                    "role": "assistant",
                    "content": ai_response
                })
        
        return response_data
    
    async def get_ipm_for_conversation(
        self,
        session_id: str,
        disease: str,
        crop: str,
        latitude: float = None,
        longitude: float = None
    ) -> Dict[str, Any]:
        """Get IPM strategy and format it conversationally"""
        strategy = await self.ipm_service.generate_strategy(
            disease=disease,
            crop=crop,
            latitude=latitude,
            longitude=longitude
        )
        
        # Create conversational summary
        summary = f"""Here's your personalized treatment plan for **{disease}** in your {crop} crop:

**🚨 Immediate Actions:**
"""
        for action in strategy.get("immediate_actions", [])[:3]:
            if isinstance(action, dict):
                summary += f"- {action.get('action', '')} ({action.get('timing', 'ASAP')})\n"
            else:
                summary += f"- {action}\n"
        
        summary += "\n**🌿 Organic Solutions:**\n"
        for solution in strategy.get("organic_solutions", [])[:2]:
            if isinstance(solution, dict):
                summary += f"- **{solution.get('product', '')}**: {solution.get('application', '')}\n"
        
        summary += "\n**🧪 Chemical Options (if needed):**\n"
        for solution in strategy.get("chemical_solutions", [])[:2]:
            if isinstance(solution, dict):
                summary += f"- **{solution.get('product', '')}**: {solution.get('dosage', '')} (Wait {solution.get('safety_period', 'as directed')} before harvest)\n"
        
        if strategy.get("companion_planting"):
            summary += "\n**🌱 Companion Planting:**\n"
            for plant in strategy.get("companion_planting", [])[:2]:
                if isinstance(plant, dict):
                    summary += f"- Plant **{plant.get('plant', '')}** - {plant.get('benefit', '')}\n"
        
        return {
            "summary": summary,
            "full_strategy": strategy,
            "follow_up": "Would you like me to explain any of these in more detail, or check the best time to spray based on your local weather?"
        }
    
    def clear_history(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversation_history:
            self.conversation_history[session_id] = []
    
    def _detect_intent(self, message: str) -> str:
        """Simple intent detection"""
        message_lower = message.lower()
        
        weather_keywords = ["weather", "rain", "temperature", "humidity", "spray", "wind", "forecast"]
        ipm_keywords = ["ipm", "strategy", "plan", "treatment plan", "management plan", "long term"]
        
        if any(kw in message_lower for kw in weather_keywords):
            return "weather"
        if any(kw in message_lower for kw in ipm_keywords):
            return "ipm"
        
        return "general"
