# 🏥 AI Medical Report Analyzer

A standalone Python service that extracts text from medical reports (PDF/images) and analyzes them using AI.

## Features

- 📄 **PDF Text Extraction** - Extract text from PDF medical reports
- 🖼️ **Image OCR** - Extract text from images using Tesseract OCR
- 🤖 **AI Analysis** - Analyze medical data with OpenAI GPT
- 📊 **Structured Output** - Returns detailed health insights in JSON format
- 🌐 **REST API** - Easy integration with any frontend

## Quick Start

### 1. Install Dependencies

```bash
cd ai_medical_analyzer
pip install -r requirements.txt
```

### 2. Install Tesseract OCR

**Windows:**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install and add to PATH
3. Default path: `C:\Program Files\Tesseract-OCR\tesseract.exe`

**macOS:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### 3. Configure API Key

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

### 4. Run the Server

```bash
python main.py
```

Server will start at: `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

### Extract Text from File
```
POST /api/extract
Content-Type: multipart/form-data

file: <PDF or image file>
```

### Complete Analysis (Extract + Analyze)
```
POST /api/analyze
Content-Type: multipart/form-data

file: <PDF or image file>
```

### Analyze Text Directly
```
POST /api/analyze/text
Content-Type: application/json

{
    "text": "Your medical report text here...",
    "language": "en"
}
```

## API Response Example

```json
{
    "success": true,
    "extracted_text": "BLOOD TEST REPORT\nPatient: John Doe\n...",
    "analysis": {
        "title": "Complete Blood Count Report",
        "report_type": "Blood Test",
        "summary": "Blood test shows elevated cholesterol and borderline vitamin D levels.",
        "findings": [
            "Total Cholesterol: 220 mg/dL (Elevated)",
            "HDL: 45 mg/dL (Normal)",
            "LDL: 140 mg/dL (Borderline High)"
        ],
        "parameters": {
            "Cholesterol": {
                "value": "220",
                "unit": "mg/dL",
                "normal_range": "<200",
                "status": "abnormal"
            }
        },
        "possible_conditions": ["Hyperlipidemia", "Vitamin D Deficiency"],
        "medications": ["Atorvastatin 10mg", "Vitamin D3 60K IU weekly"],
        "recommendations": ["Reduce saturated fat intake", "Increase exercise"],
        "dietary_suggestions": ["More fiber", "Omega-3 rich foods"],
        "precautions": ["Avoid processed foods", "Regular monitoring"],
        "follow_up": "Repeat lipid profile in 3 months",
        "severity": "moderate",
        "confidence": "85%"
    }
}
```

## Integration with Frontend

Update your React AI Analyzer component to use this service:

```javascript
// In your frontend code
const analyzeReport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use the Python server
    const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
    });
    
    const data = await response.json();
    return data;
};
```

## Running with Docker (Optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y tesseract-ocr
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI analysis | Required |
| `MODEL_NAME` | OpenAI model to use | `gpt-4o-mini` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |

## Supported File Types

- **PDF**: `.pdf`
- **Images**: `.png`, `.jpg`, `.jpeg`, `.bmp`, `.tiff`, `.webp`

## Troubleshooting

### OCR not working
- Ensure Tesseract is installed and in PATH
- Check image quality (minimum 300 DPI recommended)
- Try with a simpler image first

### AI analysis returning errors
- Verify OpenAI API key is valid
- Check your OpenAI account has available credits
- Ensure API key has correct permissions

### Server won't start
- Check port 8000 is not in use
- Verify Python version is 3.8+
- Check all dependencies are installed
