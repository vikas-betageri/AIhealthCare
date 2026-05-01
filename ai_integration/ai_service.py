import requests
import json
import logging
from typing import Optional, Dict, List
from config import Config, HealthcareConfig

# Configure logging
logging.basicConfig(
    level=Config.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class OpenRouterAIService:
    """OpenRouter AI Integration Service for Healthcare"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """Initialize the AI Service"""
        self.api_key = api_key or Config.OPENROUTER_API_KEY
        self.model = model or Config.OPENROUTER_MODEL
        self.base_url = Config.OPENROUTER_BASE_URL
        self.timeout = Config.REQUEST_TIMEOUT
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not set. Please check your .env file.")
        
        logger.info(f"OpenRouter AI Service initialized with model: {self.model}")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": Config.SITE_URL,
            "X-OpenRouter-Title": Config.SITE_NAME,
            "Content-Type": "application/json"
        }
    
    def chat(self, prompt: str, system_prompt: Optional[str] = None, 
             temperature: Optional[float] = None, language: str = 'en') -> str:
        """Send a chat message and get AI response"""
        try:
            if not prompt or not str(prompt).strip():
                logger.warning("Empty prompt received")
                return "Please provide a valid question or concern."
            
            system_msg = system_prompt or HealthcareConfig.SYSTEM_PROMPT
            temp = temperature or Config.TEMPERATURE
            
            logger.info(f"[Chat] Sending request with model {self.model}")
            
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": system_msg
                    },
                    {
                        "role": "user",
                        "content": str(prompt).strip()
                    }
                ],
                "temperature": temp,
                "max_tokens": Config.MAX_TOKENS
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self._get_headers(),
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code != 200:
                error_msg = response.json().get('error', {}).get('message', f'HTTP {response.status_code}')
                logger.error(f"[Chat] OpenRouter error: {response.status_code} - {error_msg}")
                return f"AI service error: {error_msg}"
            
            data = response.json()
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            if not content or not str(content).strip():
                logger.warning("[Chat] Empty response from OpenRouter")
                return "No response from AI"
            
            logger.info("[Chat] Response received successfully")
            return str(content).strip()
            
        except requests.exceptions.Timeout:
            logger.error("[Chat] Request timeout")
            return "AI service is taking too long. Please try again."
        except requests.exceptions.RequestException as e:
            logger.error(f"[Chat] Request error: {str(e)}")
            return "AI service temporarily unavailable"
        except Exception as e:
            logger.error(f"[Chat] Unexpected error: {str(e)}")
            return "AI service temporarily unavailable"
    
    def analyze_report(self, content: str, analysis_type: str = 'report', 
                      language: str = 'en') -> Dict:
        """Analyze medical report and return structured response"""
        try:
            if not content or not str(content).strip():
                logger.warning("Empty content for analysis")
                return {"success": False, "error": "No content provided for analysis"}
            
            type_label = {
                'medicine': 'medicine label or packaging',
                'prescription': 'prescription',
                'report': 'medical report'
            }.get(analysis_type, 'medical report')
            
            lang_name = HealthcareConfig.LANGUAGE_SUPPORT.get(language, 'English')
            
            analysis_prompt = f"""Analyze this {type_label} and provide detailed insights.
            
Content:
{str(content).strip()}

Please provide response in {lang_name} with this JSON structure:
{{
  "title": "Brief title",
  "summary": "2-3 line summary",
  "findings": ["finding1", "finding2"],
  "disease": "Possible condition if any",
  "solution": "Recommended actions",
  "homeRemedy": "Home remedies if applicable",
  "medicine": "Medicine suggestions (if applicable)",
  "precautions": ["precaution1", "precaution2"],
  "when_to_consult": "When to see a doctor"
}}"""
            
            logger.info(f"[Analysis] Analyzing {analysis_type} in {lang_name}")
            
            response_text = self.chat(
                analysis_prompt,
                system_prompt=HealthcareConfig.SYSTEM_PROMPT,
                language=language
            )
            
            if "AI service" in response_text or "error" in response_text.lower():
                return {"success": False, "error": response_text}
            
            # Try to parse JSON response
            try:
                # Extract JSON from response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response_text[start_idx:end_idx]
                    parsed = json.loads(json_str)
                    logger.info("[Analysis] Successfully parsed AI response")
                    return {"success": True, "data": parsed}
                else:
                    logger.warning("[Analysis] No JSON found in response")
                    return {
                        "success": True,
                        "data": {
                            "title": "Medical Analysis",
                            "summary": response_text,
                            "findings": []
                        }
                    }
            except json.JSONDecodeError as e:
                logger.warning(f"[Analysis] JSON parse error: {str(e)}")
                return {
                    "success": True,
                    "data": {
                        "title": "Medical Analysis",
                        "summary": response_text,
                        "findings": []
                    }
                }
            
        except Exception as e:
            logger.error(f"[Analysis] Unexpected error: {str(e)}")
            return {"success": False, "error": "Analysis failed"}
    
    def get_model_info(self) -> Dict:
        """Get current model information"""
        return {
            "model": self.model,
            "base_url": self.base_url,
            "timeout": self.timeout,
            "temperature": Config.TEMPERATURE,
            "max_tokens": Config.MAX_TOKENS
        }


# Singleton instance
_ai_service = None

def get_ai_service(api_key: Optional[str] = None, model: Optional[str] = None) -> OpenRouterAIService:
    """Get or create AI service instance"""
    global _ai_service
    if _ai_service is None:
        _ai_service = OpenRouterAIService(api_key, model)
    return _ai_service
