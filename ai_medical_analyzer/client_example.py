"""
AI Medical Analyzer - API Client
================================
Example client to test the AI Medical Analyzer service
"""

import requests
import json
import sys
from pathlib import Path


BASE_URL = "http://localhost:8000"


def test_health():
    """Test health endpoint"""
    print("\n🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.ok


def test_extract_text(file_path: str):
    """Test text extraction from file"""
    print(f"\n📄 Testing text extraction: {file_path}")
    
    if not Path(file_path).exists():
        print(f"❌ File not found: {file_path}")
        return None
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/extract", files=files)
    
    print(f"Status: {response.status_code}")
    data = response.json()
    
    if data.get('success'):
        print(f"✅ Extracted {len(data.get('text', ''))} characters")
        print(f"Text preview:\n{data.get('text', '')[:500]}...")
    else:
        print(f"❌ Error: {data.get('detail')}")
    
    return data


def test_analyze_file(file_path: str):
    """Test complete analysis (extract + analyze)"""
    print(f"\n🔬 Testing complete analysis: {file_path}")
    
    if not Path(file_path).exists():
        print(f"❌ File not found: {file_path}")
        return None
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/analyze", files=files)
    
    print(f"Status: {response.status_code}")
    data = response.json()
    
    if data.get('success'):
        analysis = data.get('analysis', {})
        print(f"\n✅ Analysis Complete!")
        print(f"\n📋 Title: {analysis.get('title', 'N/A')}")
        print(f"📊 Severity: {analysis.get('severity', 'N/A')}")
        print(f"📝 Summary: {analysis.get('summary', 'N/A')}")
        
        findings = analysis.get('findings', [])
        if findings:
            print(f"\n🔎 Key Findings:")
            for finding in findings:
                print(f"   • {finding}")
        
        recommendations = analysis.get('recommendations', [])
        if recommendations:
            print(f"\n💡 Recommendations:")
            for rec in recommendations:
                print(f"   • {rec}")
        
        if analysis.get('parameters'):
            print(f"\n📈 Parameters:")
            for param, values in analysis.get('parameters', {}).items():
                status = values.get('status', 'unknown')
                print(f"   • {param}: {values.get('value')} {values.get('unit')} ({status})")
    else:
        print(f"❌ Error: {data.get('detail')}")
    
    return data


def test_analyze_text(text: str):
    """Test analysis of raw text"""
    print(f"\n📝 Testing text analysis...")
    
    payload = {"text": text, "language": "en"}
    response = requests.post(f"{BASE_URL}/api/analyze/text", json=payload)
    
    print(f"Status: {response.status_code}")
    data = response.json()
    
    if data.get('success'):
        analysis = data.get('analysis', {})
        print(f"✅ Analysis:")
        print(json.dumps(analysis, indent=2))
    else:
        print(f"❌ Error: {data.get('detail')}")
    
    return data


def run_all_tests():
    """Run all available tests"""
    print("=" * 60)
    print("🧪 AI Medical Analyzer - Test Suite")
    print("=" * 60)
    
    # Test health
    test_health()
    
    # Test with sample text
    sample_text = """
    BLOOD TEST REPORT
    Patient: John Doe
    Date: 01/15/2024
    
    Hemoglobin: 14.5 g/dL (Normal: 12-16)
    WBC: 7500 cells/mcL (Normal: 4500-11000)
    RBC: 5.2 million/mcL (Normal: 4.2-5.4)
    Platelets: 250,000/mcL (Normal: 150,000-400,000)
    Glucose Fasting: 105 mg/dL (Normal: 70-100)
    Cholesterol Total: 220 mg/dL (Desirable: <200)
    HDL: 55 mg/dL (Normal: >40)
    LDL: 140 mg/dL (Borderline High: 100-129)
    """
    
    test_analyze_text(sample_text)
    
    # Test with a file (if exists)
    test_files = [
        "sample_report.pdf",
        "sample_image.png",
        "test_report.jpg"
    ]
    
    for file_path in test_files:
        if Path(file_path).exists():
            test_analyze_file(file_path)
            break


if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "health":
            test_health()
        elif command == "extract" and len(sys.argv) > 2:
            test_extract_text(sys.argv[2])
        elif command == "analyze" and len(sys.argv) > 2:
            test_analyze_file(sys.argv[2])
        elif command == "text":
            test_analyze_text(sys.argv[2] if len(sys.argv) > 2 else "Sample medical text")
        else:
            print("Usage:")
            print("  python client_example.py health")
            print("  python client_example.py extract <file_path>")
            print("  python client_example.py analyze <file_path>")
            print("  python client_example.py text '<text>'")
    else:
        run_all_tests()
