import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """OpenRouter API Configuration"""
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
    OPENROUTER_BASE_URL = os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')
    OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free')
    
    # Site information for OpenRouter ranking
    SITE_URL = os.getenv('SITE_URL', 'http://localhost:3000')
    SITE_NAME = os.getenv('SITE_NAME', 'SmartHealth AI')
    
    # Request settings
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '30'))
    TEMPERATURE = float(os.getenv('TEMPERATURE', '0.7'))
    MAX_TOKENS = int(os.getenv('MAX_TOKENS', '1000'))
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/ai_service.log')

class HealthcareConfig:
    """Healthcare-specific AI prompts and settings"""
    SYSTEM_PROMPT = """You are a helpful healthcare assistant for SmartHealth. 
You provide medical guidance, symptom analysis, and health information.
Always prioritize patient safety and recommend consulting with healthcare professionals for serious conditions.
Give clear, structured, and safe responses."""
    
    ANALYSIS_PROMPT_TEMPLATE = """Analyze the following {analysis_type} and provide insights:

{content}

Please provide a structured analysis with:
- Summary
- Key findings
- Recommendations
- Safety precautions
- When to seek professional help"""
    
    LANGUAGE_SUPPORT = {
        'en': 'English',
        'kn': 'Kannada',
        'hi': 'Hindi'
    }
