# SmartHealth AI Integration Guide

## Overview

This Python AI integration module provides:
1. **AI Service** - Direct communication with OpenRouter API
2. **Automation** - Job queue and batch processing
3. **CLI** - Command-line tools for testing and management
4. **Examples** - Usage examples and patterns

## Quick Start

### 1. Installation

```bash
cd ai_integration
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your OpenRouter API key
# OPENROUTER_API_KEY=your_key_here
```

### 3. Test Installation

```bash
python cli.py test-chat --prompt "Hello"
```

## File Structure

```
ai_integration/
├── config.py              # Configuration and constants
├── ai_service.py          # Core AI service
├── automation.py          # Queue and batch processing
├── cli.py                 # Command-line interface
├── examples.py            # Usage examples
├── test_ai_integration.py # Unit tests
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # Detailed documentation
```

## Core Components

### AI Service (`ai_service.py`)

Main class for AI interactions:

```python
from ai_service import get_ai_service

ai = get_ai_service()

# Simple chat
response = ai.chat("What is diabetes?")

# Medical analysis
result = ai.analyze_report(
    content="Patient has fever",
    analysis_type='report',
    language='en'
)

# Get model info
info = ai.get_model_info()
```

**Features:**
- Direct OpenRouter API calls
- Multi-language support
- Error handling
- Logging
- Singleton pattern

### Automation (`automation.py`)

Queue-based job processing:

```python
from automation import AIAutomationQueue, BatchProcessor

# Create queue
queue = AIAutomationQueue()

# Add job
job_id = queue.add_job('chat', {'prompt': 'Test'})

# Process queue
queue.process_queue(max_jobs=5)

# Batch processing
processor = BatchProcessor()
results = processor.process_batch_now(records)
```

**Features:**
- SQLite database for persistence
- Job status tracking
- Batch processing
- Continuous worker
- Retry logic

### CLI (`cli.py`)

Command-line interface:

```bash
# Test chat
python cli.py test-chat --prompt "Symptoms?" --language en

# Test analysis
python cli.py test-analysis --content "Medical report" --type report

# Queue management
python cli.py queue-job --type chat --prompt "Question"
python cli.py process-queue --max-jobs 10

# Worker mode
python cli.py worker --interval 30 --max-jobs 5

# Show model info
python cli.py model-info
```

## Usage Scenarios

### Scenario 1: Simple Chatbot Interaction

**Use Case:** Patient asking health questions

```python
from ai_service import get_ai_service

ai = get_ai_service()
user_question = "I have a headache. What should I do?"
response = ai.chat(user_question)
print(response)
```

### Scenario 2: Medical Report Analysis

**Use Case:** Analyzing uploaded medical reports

```python
ai = get_ai_service()
report = """
Patient: John
Symptom: Persistent cough for 3 days
Temperature: 101F
"""

result = ai.analyze_report(report, analysis_type='report')
print(result['data']['findings'])
```

### Scenario 3: Batch Processing

**Use Case:** Processing multiple patient records overnight

```python
from automation import BatchProcessor

processor = BatchProcessor()
records = [
    {'id': 1, 'prompt': 'Q1'},
    {'id': 2, 'prompt': 'Q2'},
    # ... 100 more records
]

results = processor.process_batch_now(records)
```

### Scenario 4: Continuous Automation

**Use Case:** Continuous processing of AI requests from Node.js backend

```bash
# Start worker in background
python cli.py worker --interval 30 --max-jobs 5 &

# Node.js backend can add jobs and check status
```

## Integration with Node.js Backend

### Option 1: Direct Python Subprocess Calls

```javascript
// Node.js - server.js
const { spawn } = require('child_process');

async function callPythonAI(prompt) {
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

    python.stderr.on('data', (chunk) => {
      reject(new Error(chunk.toString()));
    });

    python.on('close', (code) => {
      resolve(data);
    });
  });
}

// Use it in your Express route
app.post('/api/ai/chat', async (req, res) => {
  const response = await callPythonAI(req.body.prompt);
  res.json({ success: true, output: response });
});
```

### Option 2: Queue-Based Architecture

```javascript
// Add job to queue from Node.js
const { spawn } = require('child_process');

async function addAIJob(jobType, data) {
  return new Promise((resolve) => {
    const python = spawn('python', [
      'ai_integration/cli.py',
      'queue-job',
      '--type', jobType,
      '--prompt', data.prompt
    ]);

    let output = '';
    python.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });

    python.on('close', () => {
      resolve(output);
    });
  });
}

// In Express route
app.post('/api/ai/queue', async (req, res) => {
  await addAIJob('chat', { prompt: req.body.prompt });
  res.json({ success: true, message: 'Job queued' });
});
```

### Option 3: Worker Mode (Background Processing)

```javascript
// Start worker on server startup
const { spawn } = require('child_process');

function startAIWorker() {
  console.log('Starting AI worker...');
  const python = spawn('python', [
    'ai_integration/cli.py',
    'worker',
    '--interval', '30',
    '--max-jobs', '5'
  ]);

  python.stdout.on('data', (data) => {
    console.log(`[AI Worker] ${data}`);
  });

  python.stderr.on('data', (data) => {
    console.error(`[AI Worker Error] ${data}`);
  });
}

// Call on server startup
startAIWorker();
```

## Testing

### Run Unit Tests

```bash
# Install test dependencies
pip install pytest

# Run tests
python -m pytest test_ai_integration.py -v

# Run specific test
python -m pytest test_ai_integration.py::TestOpenRouterAIService::test_chat_success -v
```

### Run Examples

```bash
python examples.py
```

## Performance Considerations

| Operation | Time | Notes |
|-----------|------|-------|
| Chat response | 2-5s | Depends on prompt length |
| Analysis | 3-8s | Longer for complex reports |
| Queue processing | 5-10s per job | Batch dependent |
| Worker mode | Continuous | Configurable interval |

## Troubleshooting

### Issue: "No API key"
**Solution:**
```bash
# Check .env file
cat .env | grep OPENROUTER_API_KEY

# Set it if missing
export OPENROUTER_API_KEY=your_key_here
```

### Issue: "Model not found"
**Solution:**
```bash
# Check available models
python cli.py test-chat --prompt "test"

# Update OPENROUTER_MODEL in .env
OPENROUTER_MODEL=openchat/openchat-7b
```

### Issue: "Timeout"
**Solution:**
```bash
# Increase timeout in .env
REQUEST_TIMEOUT=60  # Default: 30
```

### Issue: Database errors
**Solution:**
```bash
# Remove corrupted database
rm ai_queue.db

# Restart worker
python cli.py worker
```

## Configuration Options

```env
# API
OPENROUTER_API_KEY=xxx        # Required
OPENROUTER_MODEL=xxx          # Required

# Request
REQUEST_TIMEOUT=30            # Seconds
TEMPERATURE=0.7              # 0-1
MAX_TOKENS=1000             # Length

# Logging
LOG_LEVEL=INFO              # DEBUG/INFO/WARNING/ERROR
LOG_FILE=logs/ai_service.log

# Site Info
SITE_URL=http://localhost:3000
SITE_NAME=SmartHealth AI
```

## Best Practices

1. **Use Queue for Batch Jobs**: For multiple AI requests, use queue mode
2. **Set Appropriate Timeout**: Increase for complex analyses
3. **Monitor Logs**: Check `logs/ai_service.log` for issues
4. **Error Handling**: Always handle API failures gracefully
5. **Rate Limiting**: Monitor OpenRouter usage
6. **Testing**: Test with examples.py before production

## Security

1. **API Key**: Never commit `.env` file
2. **Secrets**: Use environment variables only
3. **Logging**: Don't log full API keys
4. **Input Validation**: Sanitize user prompts
5. **Rate Limiting**: Implement request limits

## Support & Documentation

- **README.md**: Comprehensive documentation
- **examples.py**: Working code examples
- **test_ai_integration.py**: Test cases and patterns
- **config.py**: Configuration reference

## Advanced Topics

### Custom System Prompts

```python
ai = get_ai_service()
custom_prompt = "You are a strict medical advisor..."
response = ai.chat(user_input, system_prompt=custom_prompt)
```

### Batch with Custom Settings

```python
results = processor.process_batch_now(records)
```

### Database Queries

```python
# Direct database access
import sqlite3
conn = sqlite3.connect('ai_queue.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM ai_jobs WHERE status = ?', ('completed',))
```

## Performance Tuning

```env
# For higher throughput
TEMPERATURE=0.5          # Lower = faster responses
MAX_TOKENS=500          # Smaller = faster
REQUEST_TIMEOUT=20      # Lower timeout

# For better quality
TEMPERATURE=0.9         # Higher = more varied
MAX_TOKENS=2000         # Larger = longer responses
REQUEST_TIMEOUT=60      # More time
```

## License

Same as SmartHealth project

## Version

AI Integration: v1.0.0
Last Updated: 2024
