// Test script to verify AI endpoints are working correctly
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testAIEndpoints() {
  console.log('🧪 Testing AI Endpoints...\n');

  try {
    // Test 1: AI Chat
    console.log('1. Testing AI Chat endpoint...');
    const chatResponse = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'What are symptoms of fever?',
        language: 'en'
      })
    });
    
    const chatData = await chatResponse.json();
    console.log('Chat Response Status:', chatResponse.status);
    console.log('Chat Success:', chatData.success);
    if (chatData.output) {
      console.log('Chat Output (first 100 chars):', String(chatData.output).substring(0, 100) + '...');
    }
    console.log('');

    // Test 2: AI Analyze
    console.log('2. Testing AI Analyze endpoint...');
    const analyzeResponse = await fetch(`${BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'report',
        language: 'en',
        content: 'Blood report shows elevated cholesterol at 220 mg/dL'
      })
    });

    const analyzeData = await analyzeResponse.json();
    console.log('Analyze Response Status:', analyzeResponse.status);
    console.log('Analyze Success:', analyzeData.success);
    if (analyzeData.output) {
      console.log('Analyze Output Keys:', Object.keys(analyzeData.output));
      console.log('Disease:', analyzeData.output.disease);
      console.log('Medicine:', analyzeData.output.medicine);
    }
    console.log('');

    console.log('✅ AI Endpoints Test Complete!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure your server is running with: npm run dev');
  }
}

testAIEndpoints();
