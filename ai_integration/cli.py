#!/usr/bin/env python3
"""
CLI tool for SmartHealth AI Integration
Usage: python cli.py [command] [options]
"""

import sys
import json
import argparse
import logging
from ai_service import get_ai_service
from automation import AIAutomationQueue, BatchProcessor, run_automation_worker

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def cmd_test_chat(args):
    """Test chat functionality"""
    try:
        ai = get_ai_service()
        prompt = args.prompt or "Hello, I have a headache. What should I do?"
        language = args.language or 'en'
        
        logger.info(f"Sending prompt: {prompt}")
        response = ai.chat(prompt, language=language)
        
        print("\n" + "="*60)
        print("AI RESPONSE:")
        print("="*60)
        print(response)
        print("="*60 + "\n")
        
    except Exception as e:
        logger.error(f"Chat test failed: {str(e)}")
        sys.exit(1)


def cmd_test_analysis(args):
    """Test analysis functionality"""
    try:
        ai = get_ai_service()
        content = args.content or "Patient has fever (101F), cough, and sore throat for 2 days"
        analysis_type = args.type or 'report'
        language = args.language or 'en'
        
        logger.info(f"Analyzing {analysis_type} in {language}")
        result = ai.analyze_report(content, analysis_type, language)
        
        print("\n" + "="*60)
        print("ANALYSIS RESULT:")
        print("="*60)
        print(json.dumps(result, indent=2))
        print("="*60 + "\n")
        
    except Exception as e:
        logger.error(f"Analysis test failed: {str(e)}")
        sys.exit(1)


def cmd_queue_job(args):
    """Add job to automation queue"""
    try:
        queue = AIAutomationQueue()
        job_type = args.type or 'chat'
        
        if job_type == 'chat':
            data = {
                'prompt': args.prompt or "Test prompt",
                'language': args.language or 'en'
            }
        else:
            data = {
                'content': args.content or "Test content",
                'type': args.job_type or 'report',
                'language': args.language or 'en'
            }
        
        job_id = queue.add_job(job_type, data)
        print(f"Job {job_id} added to queue successfully!")
        
    except Exception as e:
        logger.error(f"Queue job failed: {str(e)}")
        sys.exit(1)


def cmd_process_queue(args):
    """Process pending jobs in queue"""
    try:
        queue = AIAutomationQueue()
        max_jobs = args.max_jobs or 5
        
        logger.info(f"Processing queue (max {max_jobs} jobs)...")
        queue.process_queue(max_jobs)
        print("Queue processing completed!")
        
    except Exception as e:
        logger.error(f"Queue processing failed: {str(e)}")
        sys.exit(1)


def cmd_worker(args):
    """Start automation worker"""
    try:
        interval = args.interval or 30
        max_jobs = args.max_jobs or 5
        
        print(f"Starting automation worker (interval: {interval}s, max jobs: {max_jobs})")
        run_automation_worker(interval, max_jobs)
        
    except KeyboardInterrupt:
        print("\nWorker stopped")
    except Exception as e:
        logger.error(f"Worker failed: {str(e)}")
        sys.exit(1)


def cmd_model_info(args):
    """Show model information"""
    try:
        ai = get_ai_service()
        info = ai.get_model_info()
        
        print("\n" + "="*60)
        print("MODEL INFORMATION:")
        print("="*60)
        print(json.dumps(info, indent=2))
        print("="*60 + "\n")
        
    except Exception as e:
        logger.error(f"Failed to get model info: {str(e)}")
        sys.exit(1)


def cmd_batch_process(args):
    """Process batch of records"""
    try:
        processor = BatchProcessor()
        
        # Example batch
        records = [
            {
                'id': 1,
                'type': 'chat',
                'prompt': 'I have a fever',
                'language': 'en'
            },
            {
                'id': 2,
                'type': 'analysis',
                'content': 'Patient report: High blood pressure, headache',
                'analysis_type': 'report',
                'language': 'en'
            }
        ]
        
        logger.info(f"Processing {len(records)} records...")
        results = processor.process_batch_now(records)
        
        print("\n" + "="*60)
        print("BATCH RESULTS:")
        print("="*60)
        print(json.dumps(results, indent=2))
        print("="*60 + "\n")
        
    except Exception as e:
        logger.error(f"Batch processing failed: {str(e)}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description='SmartHealth AI Integration CLI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python cli.py test-chat --prompt "I have a headache"
  python cli.py test-analysis --type report --content "Fever 101F"
  python cli.py queue-job --type chat --prompt "Test"
  python cli.py process-queue --max-jobs 10
  python cli.py worker --interval 30 --max-jobs 5
  python cli.py model-info
  python cli.py batch-process
        '''
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Test chat command
    chat_parser = subparsers.add_parser('test-chat', help='Test chat functionality')
    chat_parser.add_argument('--prompt', help='Prompt to send')
    chat_parser.add_argument('--language', default='en', help='Language (en, kn, hi)')
    chat_parser.set_defaults(func=cmd_test_chat)
    
    # Test analysis command
    analysis_parser = subparsers.add_parser('test-analysis', help='Test analysis functionality')
    analysis_parser.add_argument('--content', help='Content to analyze')
    analysis_parser.add_argument('--type', default='report', help='Analysis type (report, medicine, prescription)')
    analysis_parser.add_argument('--language', default='en', help='Language (en, kn, hi)')
    analysis_parser.set_defaults(func=cmd_test_analysis)
    
    # Queue job command
    queue_parser = subparsers.add_parser('queue-job', help='Add job to queue')
    queue_parser.add_argument('--type', default='chat', help='Job type (chat, analysis)')
    queue_parser.add_argument('--prompt', help='Prompt for chat job')
    queue_parser.add_argument('--content', help='Content for analysis job')
    queue_parser.add_argument('--job-type', help='Job type for analysis')
    queue_parser.add_argument('--language', default='en', help='Language')
    queue_parser.set_defaults(func=cmd_queue_job)
    
    # Process queue command
    process_parser = subparsers.add_parser('process-queue', help='Process pending jobs')
    process_parser.add_argument('--max-jobs', type=int, help='Maximum jobs to process')
    process_parser.set_defaults(func=cmd_process_queue)
    
    # Worker command
    worker_parser = subparsers.add_parser('worker', help='Start automation worker')
    worker_parser.add_argument('--interval', type=int, help='Worker interval (seconds)')
    worker_parser.add_argument('--max-jobs', type=int, help='Max jobs per run')
    worker_parser.set_defaults(func=cmd_worker)
    
    # Model info command
    subparsers.add_parser('model-info', help='Show model information')
    subparsers.lookup['model-info'].set_defaults(func=cmd_model_info)
    
    # Batch process command
    subparsers.add_parser('batch-process', help='Process batch of records')
    subparsers.lookup['batch-process'].set_defaults(func=cmd_batch_process)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(0)
    
    args.func(args)


if __name__ == '__main__':
    main()
