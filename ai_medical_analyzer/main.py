"""
AI Medical Report Analyzer
=========================
A FastAPI-based service that:
1. Extracts text from PDF and image files using OCR
2. Analyzes medical reports using AI
3. Returns structured health insights
"""

import os
import io
import base64
import re
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Document processing
from PIL import Image
import pytesseract
from PyPDF2 import PdfReader

# AI
import openai

load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Initialize OpenAI client
client = None
if OPENAI_API_KEY:
    client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Medical analysis prompt template
MEDICAL_ANALYSIS_PROMPT = """You are an expert medical report analyzer. Analyze the provided medical report text and return a structured JSON response with the following fields:

{
    "title": "Brief descriptive title of the report",
    "report_type": "Type of medical report (e.g., Blood Test, X-Ray, MRI, Prescription, etc.)",
    "summary": "2-3 sentence summary of the key findings",
    "findings": ["List of specific findings from the report"],
    "parameters": {
        "parameter_name": {
            "value": "measured_value",
            "unit": "unit_of_measurement",
            "normal_range": "expected_normal_range",
            "status": "normal/abnormal/critical"
        }
    },
    "possible_conditions": ["List of possible conditions based on findings"],
    "medications": ["List of medications mentioned or recommended"],
    "recommendations": ["List of health recommendations"],
    "dietary_suggestions": ["Dietary recommendations if applicable"],
    "precautions": ["Important precautions to take"],
    "follow_up": "Recommended follow-up actions or timing",
    "severity": "low/moderate/high/critical",
    "confidence": "Your confidence level in this analysis (0-100%)"
}

IMPORTANT RULES:
1. Only analyze based on the provided text - do NOT make up data
2. If information is missing, use "Not specified" or "Unknown"
3. Return ONLY valid JSON - no markdown, no explanation, no text outside the JSON
4. Flag any CRITICAL values with severity "critical"
5. Be conservative - if values are borderline, mark as "abnormal" not "critical"
"""


class TextAnalysisRequest(BaseModel):
    text: str
    language: Optional[str] = "en"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    print("🚀 AI Medical Analyzer starting up...")
    if not OPENAI_API_KEY:
        print("⚠️  Warning: OPENAI_API_KEY not set - AI analysis disabled")
    else:
        print(f"✅ OpenAI client initialized with model: {MODEL_NAME}")
    yield
    print("👋 AI Medical Analyzer shutting down...")


app = FastAPI(
    title="AI Medical Report Analyzer",
    description="Extract and analyze medical data from PDF and image files",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF file using PyPDF2"""
    try:
        pdf_reader = PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            if text:
                text_parts.append(f"--- Page {page_num + 1} ---\n{text}")
        
        return "\n\n".join(text_parts) if text_parts else ""
    except Exception as e:
        print(f"PDF extraction error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_image(file_bytes: bytes, use_enhanced: bool = True) -> str:
    """
    Extract text from image using Tesseract OCR
    Supports multiple languages and enhanced preprocessing
    """
    try:
        image = Image.open(io.BytesIO(file_bytes))
        
        # Convert to RGB if necessary
        if image.mode not in ('L', 'RGB'):
            image = image.convert('RGB')
        
        # Enhanced OCR configuration
        custom_config = r'--oem 3 --psm 6'
        
        if use_enhanced:
            # Try with English first
            text = pytesseract.image_to_string(
                image, 
                config=custom_config,
                lang='eng'
            )
            
            # If text is too short, try with different PSM modes
            if len(text.strip()) < 50:
                # Try full page recognition
                text = pytesseract.image_to_string(
                    image,
                    config='--oem 3 --psm 4',
                    lang='eng'
                )
        else:
            text = pytesseract.image_to_string(image, lang='eng')
        
        return text.strip()
    
    except Exception as e:
        print(f"Image OCR error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to extract text from image: {str(e)}")


def preprocess_medical_text(text: str) -> str:
    """Clean and preprocess extracted medical text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters that might be OCR artifacts
    text = re.sub(r'[▢▣▤▥▦▧▨▩▪▫]\s*', '', text)
    # Clean up common OCR errors
    text = text.replace('|', 'I').replace('0 ', 'O ').replace('O', '0')
    return text.strip()


async def analyze_with_ai(text: str) -> dict:
    """Analyze medical text using OpenAI GPT"""
    if not client:
        return {
            "error": "AI analysis unavailable - API key not configured",
            "analysis": None
        }
    
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": MEDICAL_ANALYSIS_PROMPT},
                {"role": "user", "content": f"Analyze this medical report:\n\n{text}"}
            ],
            temperature=0.2,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse JSON response
        # Handle cases where AI might add markdown code blocks
        if content.startswith('```json'):
            content = content[7:]
        if content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        
        import json
        result = json.loads(content.strip())
        return {"analysis": result, "error": None}
    
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return {
            "error": "Failed to parse AI response",
            "analysis": {"summary": content if 'content' in locals() else "Analysis unavailable"}
        }
    except Exception as e:
        print(f"AI analysis error: {e}")
        return {
            "error": str(e),
            "analysis": None
        }


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "AI Medical Report Analyzer",
        "version": "1.0.0",
        "ai_configured": bool(client)
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "ocr_engine": "tesseract",
        "ai_model": MODEL_NAME if client else None,
        "ai_available": bool(client)
    }


@app.post("/api/extract")
async def extract_text(file: UploadFile = File(...)):
    """
    Extract text from uploaded file (PDF or image)
    
    Supported formats: PDF, PNG, JPG, JPEG, BMP, TIFF, WEBP
    """
    content = await file.read()
    
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # Determine file type and extract text
    filename = file.filename.lower()
    
    if filename.endswith('.pdf'):
        text = extract_text_from_pdf(content)
    elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp')):
        text = extract_text_from_image(content)
    else:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file type. Please upload PDF or image file."
        )
    
    if not text or len(text.strip()) < 10:
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "text": "",
                "message": "No text could be extracted from this file. The image may be unclear or contain no readable text.",
                "extracted_at": str(datetime.now())
            }
        )
    
    cleaned_text = preprocess_medical_text(text)
    
    return {
        "success": True,
        "text": cleaned_text,
        "filename": file.filename,
        "file_size": len(content),
        "extracted_at": str(datetime.now())
    }


@app.post("/api/analyze")
async def analyze_medical_report(file: UploadFile = File(...)):
    """
    Complete pipeline: Extract text from file AND analyze with AI
    
    This is the main endpoint for medical report analysis
    """
    content = await file.read()
    
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    
    filename = file.filename.lower()
    
    # Step 1: Extract text
    try:
        if filename.endswith('.pdf'):
            extracted_text = extract_text_from_pdf(content)
        elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp')):
            extracted_text = extract_text_from_image(content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")
    
    # Step 2: Analyze with AI
    if not extracted_text or len(extracted_text.strip()) < 10:
        return {
            "success": True,
            "extracted_text": "",
            "analysis": {
                "title": "Unable to Analyze",
                "summary": "Could not extract readable text from the uploaded file. Please ensure the image is clear and contains text.",
                "severity": "unknown",
                "confidence": "0%"
            }
        }
    
    cleaned_text = preprocess_medical_text(extracted_text)
    ai_result = await analyze_with_ai(cleaned_text)
    
    return {
        "success": True,
        "extracted_text": cleaned_text,
        "analysis": ai_result.get("analysis"),
        "ai_error": ai_result.get("error"),
        "filename": file.filename
    }


@app.post("/api/analyze/text")
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze pre-extracted text directly
    
    Accepts raw text for analysis without file upload
    """
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(
            status_code=400, 
            detail="Text must be at least 10 characters"
        )
    
    cleaned_text = preprocess_medical_text(request.text)
    ai_result = await analyze_with_ai(cleaned_text)
    
    return {
        "success": True,
        "analysis": ai_result.get("analysis"),
        "ai_error": ai_result.get("error")
    }


@app.post("/api/ocr/b64")
async def ocr_from_base64(text_payload: dict):
    """
    Process image from base64 string
    
    Useful when image is already captured/encoded in client
    """
    if 'image' not in text_payload:
        raise HTTPException(status_code=400, detail="Missing 'image' field with base64 data")
    
    try:
        # Remove data URL prefix if present
        image_data = text_payload['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        text = extract_text_from_image(image_bytes)
        
        return {
            "success": True,
            "text": text,
            "character_count": len(text)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process base64 image: {str(e)}")


# Add missing import
from datetime import datetime


if __name__ == "__main__":
    import uvicorn
    print(f"Starting server on {HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)
