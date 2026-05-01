"""
AI Integration and Automation Package for SmartHealth
"""

from ai_service import OpenRouterAIService, get_ai_service
from automation import AIAutomationQueue, BatchProcessor, run_automation_worker

__version__ = "1.0.0"
__all__ = [
    'OpenRouterAIService',
    'get_ai_service',
    'AIAutomationQueue',
    'BatchProcessor',
    'run_automation_worker'
]
