"""
Examples of using SmartHealth AI Integration
"""

import sys
from ai_service import get_ai_service
from automation import AIAutomationQueue, BatchProcessor


def example_1_simple_chat():
    """Example 1: Simple chat interaction"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Simple Chat")
    print("="*60)
    
    ai = get_ai_service()
    
    prompt = "I have a sore throat and fever. What should I do?"
    print(f"User: {prompt}\n")
    
    response = ai.chat(prompt)
    print(f"AI: {response}\n")


def example_2_multilingual_support():
    """Example 2: Multi-language support"""
    print("\n" + "="*60)
    print("EXAMPLE 2: Multi-Language Support")
    print("="*60)
    
    ai = get_ai_service()
    
    # English
    response_en = ai.chat("I have a headache", language='en')
    print(f"English: {response_en[:100]}...\n")
    
    # Kannada
    response_kn = ai.chat("ನನಗೆ ತಲೆ ನೋವಾಗಿದೆ", language='kn')
    print(f"Kannada: {response_kn[:100]}...\n")


def example_3_medical_report_analysis():
    """Example 3: Medical report analysis"""
    print("\n" + "="*60)
    print("EXAMPLE 3: Medical Report Analysis")
    print("="*60)
    
    ai = get_ai_service()
    
    report_content = """
    Patient: John Doe, Age: 35
    Chief Complaint: Persistent cough for 3 days
    
    Vital Signs:
    - Blood Pressure: 130/85
    - Temperature: 101.5°F
    - Heart Rate: 98 bpm
    
    Symptoms:
    - Dry cough
    - Sore throat
    - Mild fatigue
    - No chest pain
    
    Medical History:
    - Seasonal allergies
    - No chronic diseases
    """
    
    result = ai.analyze_report(report_content, analysis_type='report')
    print(f"Analysis Result:\n")
    print(f"  Success: {result.get('success')}")
    if result.get('success'):
        print(f"  Data: {result.get('data')}\n")


def example_4_medicine_label_analysis():
    """Example 4: Medicine label analysis"""
    print("\n" + "="*60)
    print("EXAMPLE 4: Medicine Label Analysis")
    print("="*60)
    
    ai = get_ai_service()
    
    medicine_label = """
    AMOXICILLIN 500mg
    Antibiotic
    
    Dosage: 1 tablet three times daily
    Duration: 7 days
    
    Warnings:
    - Allergic to penicillin? Do not use
    - May cause diarrhea
    - Do not consume alcohol
    
    Storage: Room temperature, away from moisture
    """
    
    result = ai.analyze_report(medicine_label, analysis_type='medicine')
    print(f"Analysis Result:\n")
    if result.get('success'):
        print(f"  Title: {result.get('data', {}).get('title')}")
        print(f"  Summary: {result.get('data', {}).get('summary')}\n")


def example_5_queue_management():
    """Example 5: Queue management"""
    print("\n" + "="*60)
    print("EXAMPLE 5: Queue Management")
    print("="*60)
    
    queue = AIAutomationQueue()
    
    # Add multiple jobs
    jobs = [
        {'type': 'chat', 'prompt': 'What is diabetes?'},
        {'type': 'chat', 'prompt': 'How to prevent flu?'},
        {'type': 'analysis', 'content': 'Patient has high blood pressure'},
    ]
    
    job_ids = []
    for job in jobs:
        job_type = job.pop('type')
        job_id = queue.add_job(job_type, job)
        job_ids.append(job_id)
        print(f"Added job {job_id}")
    
    print(f"\nTotal jobs added: {len(job_ids)}")
    print(f"Job IDs: {job_ids}\n")


def example_6_batch_processing():
    """Example 6: Batch processing"""
    print("\n" + "="*60)
    print("EXAMPLE 6: Batch Processing")
    print("="*60)
    
    processor = BatchProcessor()
    
    records = [
        {
            'id': 1,
            'type': 'chat',
            'prompt': 'What are signs of depression?',
            'language': 'en'
        },
        {
            'id': 2,
            'type': 'chat',
            'prompt': 'How to maintain healthy weight?',
            'language': 'en'
        },
        {
            'id': 3,
            'type': 'analysis',
            'content': 'Severe headache, nausea, light sensitivity',
            'analysis_type': 'report',
            'language': 'en'
        }
    ]
    
    print(f"Processing {len(records)} records...\n")
    results = processor.process_batch_now(records)
    
    for result in results:
        print(f"Record {result['record_id']}: {result['status']}")
        if result['status'] == 'error':
            print(f"  Error: {result['error']}")
    
    print()


def example_7_continuous_automation():
    """Example 7: Continuous automation (worker)"""
    print("\n" + "="*60)
    print("EXAMPLE 7: Continuous Automation")
    print("="*60)
    print("Note: This example shows how to use the automation worker")
    print("The worker processes jobs from the queue continuously.\n")
    
    print("Usage from CLI:")
    print("  python cli.py worker --interval 30 --max-jobs 5\n")
    
    print("Usage from Python:")
    print("  from automation import run_automation_worker")
    print("  run_automation_worker(interval=30, max_jobs_per_run=5)\n")


def example_8_error_handling():
    """Example 8: Error handling"""
    print("\n" + "="*60)
    print("EXAMPLE 8: Error Handling")
    print("="*60)
    
    ai = get_ai_service()
    
    # Test with empty prompt
    response = ai.chat("")
    print(f"Empty prompt response: {response}\n")
    
    # Test with very long prompt
    long_prompt = "What is health? " * 100
    response = ai.chat(long_prompt)
    print(f"Long prompt response: {response[:100]}...\n")


def example_9_model_information():
    """Example 9: Model information"""
    print("\n" + "="*60)
    print("EXAMPLE 9: Model Information")
    print("="*60)
    
    ai = get_ai_service()
    info = ai.get_model_info()
    
    print(f"Model: {info['model']}")
    print(f"Base URL: {info['base_url']}")
    print(f"Timeout: {info['timeout']}s")
    print(f"Temperature: {info['temperature']}")
    print(f"Max Tokens: {info['max_tokens']}\n")


if __name__ == '__main__':
    try:
        print("\n" + "="*60)
        print("SmartHealth AI Integration Examples")
        print("="*60)
        
        # Run all examples
        example_1_simple_chat()
        example_2_multilingual_support()
        example_3_medical_report_analysis()
        example_4_medicine_label_analysis()
        example_5_queue_management()
        example_6_batch_processing()
        example_7_continuous_automation()
        example_8_error_handling()
        example_9_model_information()
        
        print("="*60)
        print("All examples completed!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\nError running examples: {str(e)}")
        sys.exit(1)
