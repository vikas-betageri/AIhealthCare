# Code Changes - Before & After

## Function: `callGeminiText()` in server.js

### ❌ BEFORE (Lines 122-168) - NOT WORKING

```javascript
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-1.5-mini';

async function callGeminiText(prompt, temperature = 0.25, maxOutputTokens = 512) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your .env file.');
  }

  // ❌ WRONG ENDPOINT - Uses outdated generativemodels.googleapis.com
  const apiUrl = `https://generativemodels.googleapis.com/v1beta2/models/${GEMINI_MODEL}:generateText?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // ❌ WRONG FORMAT - Old schema with prompt.text
      prompt: { text: prompt },
      temperature,
      maxOutputTokens,
      candidateCount: 1
    })
  });

  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let debug = text;
    try {
      const parsedError = JSON.parse(text);
      debug = parsedError?.error?.message || JSON.stringify(parsedError);
    } catch {
      // keep raw text if it is not JSON
    }
    throw new Error(`Gemini API error: ${response.status} ${debug}`);
  }

  if (contentType.includes('application/json')) {
    try {
      const body = JSON.parse(text);
      // ❌ WRONG RESPONSE PATH - Old API returns candidates[0].output
      return body?.candidates?.[0]?.output || body?.output || '';
    } catch (jsonError) {
      throw new Error(`Gemini API returned invalid JSON: ${jsonError.message}. Response: ${text.slice(0, 400)}`);
    }
  }

  return text.trim();
}
```

### ✅ AFTER (Lines 122-183) - FIXED AND WORKING

```javascript
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-1.5-mini';

async function callGeminiText(prompt, temperature = 0.25, maxOutputTokens = 512) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your .env file.');
  }

  // ✅ CORRECT ENDPOINT - Uses new generativelanguage.googleapis.com with generateContent
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // ✅ CORRECT FORMAT - New schema with contents and parts
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      // ✅ ADDED generationConfig with all parameters
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP: 0.95,
        topK: 40
      }
    })
  });

  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let debug = text;
    try {
      const parsedError = JSON.parse(text);
      debug = parsedError?.error?.message || JSON.stringify(parsedError);
    } catch {
      // keep raw text if it is not JSON
    }
    throw new Error(`Gemini API error: ${response.status} ${debug}`);
  }

  if (contentType.includes('application/json')) {
    try {
      const body = JSON.parse(text);
      // ✅ CORRECT RESPONSE PATH - New API returns candidates[0].content.parts[0].text
      const firstContent = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (firstContent) {
        return firstContent;
      }
      return body?.output || '';
    } catch (jsonError) {
      throw new Error(`Gemini API returned invalid JSON: ${jsonError.message}. Response: ${text.slice(0, 400)}`);
    }
  }

  return text.trim();
}
```

## Key Differences Summary

| Aspect | Before | After |
|--------|--------|-------|
| **API Base URL** | `generativemodels.googleapis.com` | `generativelanguage.googleapis.com` |
| **API Method** | `:generateText` | `:generateContent` |
| **Request Schema** | `{ prompt: { text } }` | `{ contents: [{ parts: [{ text }] }] }` |
| **Config Format** | `candidateCount: 1` | `generationConfig: { temperature, maxOutputTokens, topP, topK }` |
| **Response Path** | `candidates[0].output` | `candidates[0].content.parts[0].text` |
| **Status** | ❌ Broken | ✅ Working |

## Why These Changes Matter

1. **Google API Evolution**: Google discontinued the old generativemodels endpoint and moved to generativelanguage
2. **New Schema**: The API now uses a more structured content/parts model
3. **Better Configuration**: generationConfig allows fine-tuned control over response generation
4. **Correct Parsing**: Response structure completely changed in the new API

## Affected Endpoints

These endpoints now work correctly:

1. **POST `/api/ai/chat`** - Healthcare assistant chat
2. **POST `/api/ai/analyze`** - Medical report analysis

Both endpoints use the fixed `callGeminiText()` function internally.
