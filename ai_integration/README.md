# SmartHealth AI Integration & Automation

Python modules for OpenRouter AI integration and healthcare automation in SmartHealth system.

## Installation

```bash
cd ai_integration
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the `ai_integration` directory:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openchat/openchat-7b
SITE_URL=http://localhost:3000
SITE_NAME=SmartHealth AI
REQUEST_TIMEOUT=30
TEMPERATURE=0.7
MAX_TOKENS=1000
LOG_LEVEL=INFO
```

## Usage

### 1. Direct AI Service Usage

```python
from ai_service import get_ai_service

ai = get_ai_service()

# Chat with AI
response = ai.chat("I have a fever", language='en')
print(response)

# Analyze medical report
result = ai.analyze_report(
    content="Patient has fever 101F, cough for 2 days",
    analysis_type='report',
    language='en'
)
print(result)
```

### 2. Using Automation Queue

```python
from automation import AIAutomationQueue

queue = AIAutomationQueue()

# Add jobs to queue
job_id = queue.add_job('chat', {
    'prompt': 'What should I do for headache?',
    'language': 'en'
})

# Process queued jobs
queue.process_queue(max_jobs=5)

# Check job status
jobs = queue.get_pending_jobs()
```

### 3. Batch Processing

```python
from automation import BatchProcessor

processor = BatchProcessor()

records = [
    {'id': 1, 'type': 'chat', 'prompt': 'Headache help?'},
    {'id': 2, 'type': 'analysis', 'content': 'Medical report...', 'analysis_type': 'report'},
]

results = processor.process_batch_now(records)
```

### 4. CLI Usage

```bash
# Test chat
python cli.py test-chat --prompt "I have a headache" --language en

# Test analysis
python cli.py test-analysis --type report --content "Fever 101F" --language en

# Queue a job
python cli.py queue-job --type chat --prompt "Test"

# Process queue
python cli.py process-queue --max-jobs 10

# Start worker (continuous processing)
python cli.py worker --interval 30 --max-jobs 5

# Show model info
python cli.py model-info

# Batch process
python cli.py batch-process
```

## File Structure

```
ai_integration/
├── config.py              # Configuration and settings
├── ai_service.py          # Main AI service using OpenRouter
├── automation.py          # Automation queue and batch processing
├── cli.py                 # Command-line interface
├── __init__.py           # Package initialization
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## Features

### AI Service (`ai_service.py`)
- Direct chat with healthcare AI
- Medical report analysis
- Multi-language support (English, Kannada, Hindi)
- Error handling and logging
- Configurable temperature and token limits

### Automation (`automation.py`)
- Job queue with SQLite persistence
- Batch processing of records
- Continuous worker process
- Retry logic
- Status tracking

### CLI (`cli.py`)
- User-friendly command-line interface
- Test AI functionality
- Queue management
- Worker management
- Batch operations

## Supported Languages

- English (`en`)
- Kannada (`kn`)
- Hindi (`hi`)

## Error Handling

All functions include comprehensive error handling:
- Network timeout handling
- API error responses
- Invalid input validation
- Logging for debugging

## Examples

### Example 1: Simple Chat

```python
from ai_service import get_ai_service

ai = get_ai_service()
response = ai.chat("What are symptoms of flu?")
print(response)
```

### Example 2: Report Analysis

```python
from ai_service import get_ai_service

ai = get_ai_service()
result = ai.analyze_report(
    content="Blood test results: Hemoglobin 12.5, WBC 7500",
    analysis_type='report',
    language='kn'  # In Kannada
)
```

### Example 3: Queue and Process

```python
from automation import AIAutomationQueue

queue = AIAutomationQueue()

# Add 100 jobs
for i in range(100):
    queue.add_job('chat', {'prompt': f'Question {i}'})

# Process in batches
for batch in range(20):
    queue.process_queue(max_jobs=5)
```

## Logging

Logs are saved to `logs/ai_service.log` by default.

To change log level:
```bash
export LOG_LEVEL=DEBUG
python cli.py test-chat --prompt "Test"
```

## Integration with Node.js Backend

The Python AI integration can be called from Node.js:

```javascript
const { spawn } = require('child_process');

function callPythonAI(prompt) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      'ai_integration/cli.py',
      'test-chat',
      '--prompt',
      prompt
    ]);

    let data = '';
    python.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    python.on('close', (code) => {
      resolve(data);
    });
  });
}
```

## Performance

- Chat response time: ~2-5 seconds
- Analysis response time: ~3-8 seconds
- Queue processing: Configurable (default 30s interval)
- Batch processing: ~5-10 records per second

## Troubleshooting

### No API key error
- Ensure `.env` file exists with `OPENROUTER_API_KEY`

### Timeout errors
- Increase `REQUEST_TIMEOUT` in `.env`

### Empty responses
- Check model availability at https://openrouter.ai
- Verify prompt content is not empty

### Database errors
- Delete `ai_queue.db` and restart worker

## Support

For issues, check:
1. `.env` configuration
2. OpenRouter API status
3. Log files in `logs/` directory
4. Python version (3.7+)
