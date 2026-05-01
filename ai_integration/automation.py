import os
import json
import time
import logging
from datetime import datetime
from typing import List, Dict, Optional
from ai_service import get_ai_service
import sqlite3

logger = logging.getLogger(__name__)


class AIAutomationQueue:
    """Queue for batch AI processing and automation"""
    
    def __init__(self, db_path: str = 'ai_queue.db'):
        """Initialize automation queue"""
        self.db_path = db_path
        self._init_db()
        logger.info(f"Automation queue initialized with DB: {db_path}")
    
    def _init_db(self):
        """Initialize SQLite database for queue management"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_type TEXT NOT NULL,
                input_data TEXT NOT NULL,
                output_data TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                retry_count INTEGER DEFAULT 0,
                error_message TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_job(self, job_type: str, input_data: Dict) -> int:
        """Add a new job to the queue"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO ai_jobs (job_type, input_data, status)
                VALUES (?, ?, 'pending')
            ''', (job_type, json.dumps(input_data)))
            
            job_id = cursor.lastrowid
            conn.commit()
            logger.info(f"Job {job_id} added to queue (type: {job_type})")
            return job_id
            
        except Exception as e:
            logger.error(f"Error adding job: {str(e)}")
            return -1
        finally:
            conn.close()
    
    def get_pending_jobs(self, limit: int = 10) -> List[Dict]:
        """Get pending jobs from queue"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT id, job_type, input_data FROM ai_jobs 
                WHERE status = 'pending'
                ORDER BY created_at ASC
                LIMIT ?
            ''', (limit,))
            
            jobs = []
            for row in cursor.fetchall():
                jobs.append({
                    'id': row[0],
                    'job_type': row[1],
                    'input_data': json.loads(row[2])
                })
            
            return jobs
            
        except Exception as e:
            logger.error(f"Error fetching jobs: {str(e)}")
            return []
        finally:
            conn.close()
    
    def update_job_status(self, job_id: int, status: str, output: Optional[Dict] = None, 
                         error: Optional[str] = None):
        """Update job status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            output_json = json.dumps(output) if output else None
            
            cursor.execute('''
                UPDATE ai_jobs 
                SET status = ?, output_data = ?, error_message = ?, completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (status, output_json, error, job_id))
            
            conn.commit()
            logger.info(f"Job {job_id} status updated to {status}")
            
        except Exception as e:
            logger.error(f"Error updating job: {str(e)}")
        finally:
            conn.close()
    
    def process_queue(self, max_jobs: int = 5):
        """Process pending jobs in queue"""
        ai_service = get_ai_service()
        jobs = self.get_pending_jobs(max_jobs)
        
        logger.info(f"Processing {len(jobs)} pending jobs")
        
        for job in jobs:
            try:
                self.update_job_status(job['id'], 'processing')
                
                if job['job_type'] == 'chat':
                    result = self._process_chat_job(ai_service, job['input_data'])
                elif job['job_type'] == 'analysis':
                    result = self._process_analysis_job(ai_service, job['input_data'])
                else:
                    result = {"error": f"Unknown job type: {job['job_type']}"}
                
                self.update_job_status(job['id'], 'completed', output=result)
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Job {job['id']} failed: {error_msg}")
                self.update_job_status(job['id'], 'failed', error=error_msg)
    
    def _process_chat_job(self, ai_service, data: Dict) -> Dict:
        """Process a chat job"""
        prompt = data.get('prompt', '')
        language = data.get('language', 'en')
        
        response = ai_service.chat(prompt, language=language)
        return {"response": response}
    
    def _process_analysis_job(self, ai_service, data: Dict) -> Dict:
        """Process an analysis job"""
        content = data.get('content', '')
        analysis_type = data.get('type', 'report')
        language = data.get('language', 'en')
        
        result = ai_service.analyze_report(content, analysis_type, language)
        return result


class BatchProcessor:
    """Batch process multiple health records"""
    
    def __init__(self):
        self.ai_service = get_ai_service()
        self.queue = AIAutomationQueue()
    
    def process_patient_records(self, records: List[Dict]) -> List[Dict]:
        """Process multiple patient records and add to queue"""
        job_ids = []
        
        for record in records:
            job_type = record.get('type', 'chat')
            job_id = self.queue.add_job(job_type, record)
            job_ids.append(job_id)
        
        logger.info(f"Added {len(job_ids)} jobs to queue")
        return job_ids
    
    def process_batch_now(self, records: List[Dict]) -> List[Dict]:
        """Process batch immediately without queueing"""
        results = []
        
        for record in records:
            try:
                if record.get('type') == 'analysis':
                    result = self.ai_service.analyze_report(
                        record.get('content', ''),
                        record.get('analysis_type', 'report'),
                        record.get('language', 'en')
                    )
                else:
                    response = self.ai_service.chat(
                        record.get('prompt', ''),
                        language=record.get('language', 'en')
                    )
                    result = {"success": True, "response": response}
                
                results.append({
                    "record_id": record.get('id'),
                    "status": "success",
                    "result": result
                })
                
            except Exception as e:
                results.append({
                    "record_id": record.get('id'),
                    "status": "error",
                    "error": str(e)
                })
        
        return results


def run_automation_worker(interval: int = 30, max_jobs_per_run: int = 5):
    """Run automation worker continuously"""
    queue = AIAutomationQueue()
    logger.info(f"Starting automation worker (interval: {interval}s, max jobs: {max_jobs_per_run})")
    
    try:
        while True:
            try:
                queue.process_queue(max_jobs_per_run)
                time.sleep(interval)
            except Exception as e:
                logger.error(f"Worker error: {str(e)}")
                time.sleep(interval)
    
    except KeyboardInterrupt:
        logger.info("Automation worker stopped")


if __name__ == '__main__':
    # Example: Start automation worker
    run_automation_worker()
