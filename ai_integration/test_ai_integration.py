"""
Unit tests for SmartHealth AI Integration
Run with: python -m pytest test_ai_integration.py -v
"""

import unittest
import json
import os
from unittest.mock import patch, MagicMock
from ai_service import OpenRouterAIService, get_ai_service
from automation import AIAutomationQueue, BatchProcessor


class TestOpenRouterAIService(unittest.TestCase):
    """Tests for OpenRouterAIService"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.api_key = 'test_key_12345'
        self.ai = OpenRouterAIService(api_key=self.api_key, model='openchat/openchat-7b')
    
    def test_initialization(self):
        """Test AI service initialization"""
        self.assertEqual(self.ai.api_key, self.api_key)
        self.assertEqual(self.ai.model, 'openchat/openchat-7b')
        self.assertIsNotNone(self.ai.base_url)
    
    def test_missing_api_key(self):
        """Test error when API key is missing"""
        with self.assertRaises(ValueError):
            OpenRouterAIService(api_key='', model='openchat/openchat-7b')
    
    def test_get_headers(self):
        """Test header generation"""
        headers = self.ai._get_headers()
        
        self.assertIn('Authorization', headers)
        self.assertTrue(headers['Authorization'].startswith('Bearer '))
        self.assertIn('HTTP-Referer', headers)
        self.assertIn('X-OpenRouter-Title', headers)
        self.assertEqual(headers['Content-Type'], 'application/json')
    
    @patch('ai_service.requests.post')
    def test_chat_success(self, mock_post):
        """Test successful chat request"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'choices': [
                {'message': {'content': 'Test response'}}
            ]
        }
        mock_post.return_value = mock_response
        
        response = self.ai.chat('Test prompt')
        
        self.assertEqual(response, 'Test response')
        mock_post.assert_called_once()
    
    @patch('ai_service.requests.post')
    def test_chat_empty_prompt(self, mock_post):
        """Test chat with empty prompt"""
        response = self.ai.chat('')
        
        self.assertEqual(response, 'Please provide a valid question or concern.')
        mock_post.assert_not_called()
    
    @patch('ai_service.requests.post')
    def test_chat_api_error(self, mock_post):
        """Test chat with API error"""
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {
            'error': {'message': 'Invalid API key'}
        }
        mock_post.return_value = mock_response
        
        response = self.ai.chat('Test prompt')
        
        self.assertIn('AI service error', response)
    
    @patch('ai_service.requests.post')
    def test_chat_timeout(self, mock_post):
        """Test chat timeout"""
        mock_post.side_effect = TimeoutError()
        
        response = self.ai.chat('Test prompt')
        
        self.assertEqual(response, 'AI service is taking too long. Please try again.')
    
    @patch('ai_service.requests.post')
    def test_analyze_report_success(self, mock_post):
        """Test successful report analysis"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'choices': [
                {'message': {'content': '{"title": "Test", "summary": "Test summary"}'}}
            ]
        }
        mock_post.return_value = mock_response
        
        result = self.ai.analyze_report('Test report', 'report')
        
        self.assertTrue(result['success'])
        self.assertIn('data', result)
    
    @patch('ai_service.requests.post')
    def test_analyze_report_empty_content(self, mock_post):
        """Test analysis with empty content"""
        result = self.ai.analyze_report('', 'report')
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    def test_get_model_info(self):
        """Test model info retrieval"""
        info = self.ai.get_model_info()
        
        self.assertEqual(info['model'], 'openchat/openchat-7b')
        self.assertIn('base_url', info)
        self.assertIn('timeout', info)
        self.assertIn('temperature', info)
        self.assertIn('max_tokens', info)


class TestAIAutomationQueue(unittest.TestCase):
    """Tests for AIAutomationQueue"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.db_path = 'test_queue.db'
        self.queue = AIAutomationQueue(db_path=self.db_path)
    
    def tearDown(self):
        """Clean up after tests"""
        if os.path.exists(self.db_path):
            os.remove(self.db_path)
    
    def test_queue_initialization(self):
        """Test queue initialization"""
        self.assertTrue(os.path.exists(self.db_path))
    
    def test_add_job(self):
        """Test adding job to queue"""
        job_id = self.queue.add_job('chat', {'prompt': 'Test'})
        
        self.assertGreater(job_id, 0)
    
    def test_get_pending_jobs(self):
        """Test getting pending jobs"""
        self.queue.add_job('chat', {'prompt': 'Test 1'})
        self.queue.add_job('chat', {'prompt': 'Test 2'})
        
        jobs = self.queue.get_pending_jobs()
        
        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[0]['job_type'], 'chat')
    
    def test_update_job_status(self):
        """Test updating job status"""
        job_id = self.queue.add_job('chat', {'prompt': 'Test'})
        self.queue.update_job_status(job_id, 'completed', {'response': 'Done'})
        
        jobs = self.queue.get_pending_jobs()
        
        # Completed job should not appear in pending
        self.assertEqual(len(jobs), 0)
    
    def test_job_data_structure(self):
        """Test job data structure"""
        test_data = {'prompt': 'Test', 'language': 'en'}
        job_id = self.queue.add_job('chat', test_data)
        
        jobs = self.queue.get_pending_jobs()
        
        self.assertEqual(jobs[0]['input_data'], test_data)


class TestBatchProcessor(unittest.TestCase):
    """Tests for BatchProcessor"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.processor = BatchProcessor()
    
    @patch('automation.get_ai_service')
    def test_process_patient_records(self, mock_ai):
        """Test processing patient records"""
        records = [
            {'id': 1, 'type': 'chat', 'prompt': 'Test 1'},
            {'id': 2, 'type': 'chat', 'prompt': 'Test 2'},
        ]
        
        job_ids = self.processor.process_patient_records(records)
        
        self.assertEqual(len(job_ids), 2)
    
    @patch('automation.get_ai_service')
    def test_process_batch_now(self, mock_ai):
        """Test batch processing now"""
        mock_ai_instance = MagicMock()
        mock_ai_instance.chat.return_value = 'Test response'
        mock_ai.return_value = mock_ai_instance
        
        records = [
            {'id': 1, 'type': 'chat', 'prompt': 'Test'},
        ]
        
        results = self.processor.process_batch_now(records)
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['status'], 'success')


class TestIntegration(unittest.TestCase):
    """Integration tests"""
    
    def test_get_ai_service_singleton(self):
        """Test AI service singleton pattern"""
        ai1 = get_ai_service(api_key='test_key')
        ai2 = get_ai_service()
        
        self.assertIs(ai1, ai2)
    
    @patch('ai_service.requests.post')
    def test_full_chat_flow(self, mock_post):
        """Test full chat flow"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'choices': [
                {'message': {'content': 'Test response'}}
            ]
        }
        mock_post.return_value = mock_response
        
        ai = get_ai_service(api_key='test_key')
        response = ai.chat('Test prompt')
        
        self.assertEqual(response, 'Test response')


if __name__ == '__main__':
    unittest.main()
