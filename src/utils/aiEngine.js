// Simulated AI Engine for Reports & Chat with Enhanced Analysis
export const analyzeMedicalImage = async (fileType, lang = 'en', content = '') => {
  const responses = {
    en: {
      report: {
        title: "Blood Report Analysis",
        details: "AI Analysis detected elevated Cholesterol levels (220 mg/dL) and borderline Vitamin D deficiency. The lipid profile shows increased LDL cholesterol which is a risk factor for cardiovascular diseases.",
        disease: "Hyperlipidemia & Vitamin D Deficiency",
        solution: "The cholesterol levels can be managed through dietary modifications and regular exercise. Vitamin D deficiency requires supplementation and increased sun exposure.",
        homeRemedy: "Include more fiber-rich foods like oats, broccoli, and beans. Consume omega-3 rich foods like fish and nuts. Spend 15-20 minutes in morning sunlight daily. Regular walking (30 mins) can help reduce cholesterol naturally.",
        medicine: "Atorvastatin (10mg once daily), Vitamin D3 Supplement (60K IU once a week)",
        precautions: "Reduce intake of saturated fats and trans fats. Limit salt intake. Avoid processed foods. Don't skip meals. Increase physical activity to at least 150 minutes per week.",
        steps: "Follow up with a General Physician in 4 weeks. Repeat Lipid Profile after 3 months. Monitor weight and blood pressure regularly at home."
      },
      medicine: {
        title: "Paracetamol Analysis",
        details: "Paracetamol 500mg identified in the image. This is an over-the-counter analgesic and antipyretic medication commonly used for fever and mild to moderate pain relief.",
        disease: "General Fever / Pain Relief",
        solution: "Paracetamol works by reducing fever set-point in the hypothalamus and blocking pain signals. It is generally safe when used at recommended doses.",
        homeRemedy: "Drink plenty of water to stay hydrated. Rest in a cool, dark room. Apply a cold compress to the forehead. Drink herbal teas like ginger or chamomile. Eat light, nutritious foods.",
        medicine: "Paracetamol 500mg, 1-2 tablets every 4-6 hours",
        precautions: "Do not exceed 4g (8 tablets) in 24 hours. Avoid alcohol consumption as it increases risk of liver damage. Take with food or milk to avoid stomach upset. Do not use if allergic to paracetamol.",
        steps: "Take after food or milk. If fever persists for more than 3 days, consult a doctor. If pain continues for more than 5 days, seek medical advice."
      },
      prescription: {
        title: "Prescription Analysis",
        details: "Handwritten prescription detected for Amoxicillin and Cetirizine. Amoxicillin is a broad-spectrum antibiotic, while Cetirizine is an anti-allergy medication used together for bacterial infections with allergic symptoms.",
        disease: "Common Cold & Bacterial Infection with Allergy",
        solution: "The combination addresses both the bacterial infection (Amoxicillin) and allergic symptoms (Cetirizine). Complete the full antibiotic course for effectiveness.",
        homeRemedy: "Get adequate rest and sleep to boost immunity. Consume vitamin C-rich foods like oranges, kiwi, and bell peppers. Stay hydrated with warm water and herbal teas. Use a humidifier to ease congestion. Gargle with salt water.",
        medicine: "Amoxicillin 500mg (thrice daily), Cetirizine 10mg (once daily at night)",
        precautions: "Finish the full course of antibiotics even if feeling better after 2-3 days. Do not skip doses. Avoid dairy products 2 hours before and after Amoxicillin. Take Cetirizine at night as it may cause drowsiness.",
        steps: "Contact your doctor immediately if you experience rash, breathing difficulties, or severe allergic reactions. Continue medication as prescribed for 5-7 days."
      }
    },
    kn: {
      report: {
        title: "ರಕ್ತ ವರದಿ ವಿಶ್ಲೇಷಣೆ",
        details: "AI ವಿಶ್ಲೇಷಣೆ ಹೆಚ್ಚಿದ ಕೊಲೆಸ್ಟ್ರಾಲ್ ಮಟ್ಟಗಳು (220 mg/dL) ಮತ್ತು ಗಡಿರೇಖೆಯ ವಿಟಮಿನ್ ಡಿ ಕೊರತೆಯನ್ನು ಕಂಡುಬಂದಿದೆ. ಲಿಪಿಡ್ ಪ್ರೊಫೈಲ್ ಹೃದಯರೋಗದ ಅಪಾಯ ಹೆಚ್ಚುತ್ತದೆ.",
        disease: "ಹೈಪರ್ಲಿಪಿಡೆಮಿಯಾ ಮತ್ತು ವಿಟಮಿನ್ ಡಿ ಕೊರತೆ",
        solution: "ಆಹಾರ ಸಂಶೋಧನ ಮತ್ತು ನಿಯಮಿತ ವ್ಯಾಯಾಮದ ಮೂಲಕ ಕೊಲೆಸ್ಟ್ರಾಲ್ ನಿರ್ವಹಿಸಬಹುದು. ವಿಟಮಿನ್ ಡಿ ಕೊರತೆಗೆ ಪೂರಕ ಮತ್ತು ಸೂರ್ಯನ ಬೆಳಕಿನ ಬಹಿರ್ಗಮನ ಬೇಕು.",
        homeRemedy: "ಒಟ್‌ಸ್‌, ಸೂಪ್‌ನಾ ಮತ್ತು ಮಸೂರಿ ನಂತಹ ಫೈಬರ್ ಶ್ರೀಮಂತ ಆಹಾರ ಸೇವಿಸಿ. ಮೀನ್ ಮತ್ತು ಬೀಜಗಳಂತಹ ಓಮೆಗಾ-3 ಶ್ರೀಮಂತ ಆಹಾರ ತಿನ್ನಿ. ದಿನಕ್ಕೆ 15-20 ನಿಮಿಷ ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯನ ಬೆಳಕಿನಲ್ಲಿರಿ. ನಿಯಮಿತ ನಡಿಗೆ (30 ನಿಮಿಷ) ಕೊಲೆಸ್ಟ್ರಾಲ್ ಕಡಿಮೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡಬಹುದು.",
        medicine: "ಅಟೊರ್ವಾಸ್ಟಾಟಿನ್ (10mg ದೈನಿಕ), ವಿಟಮಿನ್ D3 ಪೂರಕ (ವಾರಕ್ಕೊಮ್ಮೆ 60K IU)",
        precautions: "ಸ್ಯಾಚುರೇಟೆಡ್ ಮತ್ತು ಟ್ರಾನ್ಸ್ ಫ್ಯಾಟ್ ಸೇವನೆ ಕಡಿಮೆ ಮಾಡಿ. ಉಪ್ಪಿನ ಸೇವನೆ ಸೀಮಿತ ಮಾಡಿ. ಸಂಸ್ಕೃತ ಆಹಾರ ತಪ್ಪಿಸಿ. ಕ್ಷಮೆ ತೆಗೆಯಬೇಡಿ. ಸಾಪ್ತಾಹಿಕವಾಗಿ ಕನಿಷ್ಠ 150 ನಿಮಿಷ ದೈಹಿಕ ಚಟುವಟಿಕೆ.",
        steps: "4 ವಾರಗಳಲ್ಲಿ ಸಾಮಾನ್ಯ ವೈದ್ಯರೊಂದಿಗೆ ಅನುಸರಿಸಿ. 3 ತಿಂಗಳ ನಂತರ ಲಿಪಿಡ್ ಪ್ರೊಫೈಲ್ ಪುನರಾವರ್ತಿಸಿ. ನಿಯಮಿತವಾಗಿ ಮನೆಯಲ್ಲಿ ತೂಕ ಮತ್ತು ರಕ್ತಚಾಪ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ."
      },
      medicine: {
        title: "ಪ್ಯಾರಸಿಟಮಾಲ್ ವಿಶ್ಲೇಷಣೆ",
        details: "ಪ್ಯಾರಸಿಟಮಾಲ್ 500mg ಚಿತ್ರದಲ್ಲಿ ಗುರುತಿಸಲಾಗಿದೆ. ಇದು ಜ್ವರ ಮತ್ತು ಮೃದು ಮಧ್ಯಮ ನೋವಿನ ಪರಿಹಾರಕ್ಕೆ ಬಳಸಲಾಗುವ ಔಷಧಿ.",
        disease: "ಸಾಮಾನ್ಯ ಜ್ವರ / ನೋವು ನಿವಾರಣೆ",
        solution: "ಪ್ಯಾರಸಿಟಮಾಲ್ ಮೆದುಳಿನ ಸೂಚಿಸಿದ ಮಾತ್ರತೆಯಲ್ಲಿ ಅರ್ಹವಾಗಿ ಪರಿವರ್ತಿತ ಮಾತ್ರೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುವ ಮೂಲಕ ಕಾರ್ಯ ನಿರ್ವಹಿಸುತ್ತದೆ.",
        homeRemedy: "ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ. ತಂಪು, ಅಂಧಕಾರ ಕೋಣೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ಹಣೆಗೆ ತಂಪು ಪ್ಯಾಕ್ ಸರಿಸಿ. ಶುಂಠಿ ಅಥವಾ ಕಾಮೋಮೈಲ್ ತೆ ಪಾನ ಮಾಡಿ. ಹಗರು, ಪೌಷ್ಟಿಕ ಆಹಾರ ತಿನ್ನಿ.",
        medicine: "ಪ್ಯಾರಸಿಟಮಾಲ್ 500mg, 4-6 ಗಂಟೆಗೊಮ್ಮೆ 1-2 ಟ್ಯಾಬ್ಲೆಟ್",
        precautions: "24 ಗಂಟೆಗಳಲ್ಲಿ 4g (8 ಟ್ಯಾಬ್ಲೆಟ್) ಮೀರಬೇಡಿ. ಮದ್ಯಪಾನವನ್ನು ತಪ್ಪಿಸಿ. ಆಹಾರದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ.",
        steps: "ಜ್ವರ 3 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಕಾಲ ಮುಂದುವರಿದರೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ."
      },
      prescription: {
        title: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ವಿಶ್ಲೇಷಣೆ",
        details: "ಅಮೋಕ್ಸಿಸಿಲಿನ್ ಮತ್ತು ಸೆಟಿರಿಜಿನ್ಗಾಗಿ ಕೈಬರಹದ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಕಂಡುಬಂದಿದೆ.",
        disease: "ಸಾಮಾನ್ಯ ಶೀತ ಮತ್ತು ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕೆ",
        solution: "ಸಮ್ಮಿಶ್ರಣ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕೆ ಮತ್ತು ಅರ್ಬುದ ರೋಗಲಕ್ಷಣಗಳಿಗೆ ಸಂಬೋಧಿಸುತ್ತದೆ.",
        homeRemedy: "ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ನಿಂಬೆಹಣ್ಣು, ಕಿವಿ ಮತ್ತು ಗಮಕ ಮಿಶ್ರಿತ ಆಹಾರ ಸೇವಿಸಿ. ಸುಗಂಧ ಗಾಜರನ್ನು ಬಳಸಿ. ಸರಿಸಂಬೊಧಿತ ನೀರು ಗರಗರಾನೆ ಮಾಡಿ.",
        medicine: "ಅಮೋಕ್ಸಿಸಿಲಿನ್ 500mg (ತ್ರಿಗುಣ), ಸೆಟಿರಿಜಿನ್ 10mg (ರಾತ್ರಿ)",
        precautions: "ಪ್ರತಿಜೀವಕಗಳ ಸಂಪೂರ್ಣ ಸೇವನೆ ಮುಗಿಸಿ. ಸಬ್ಮಿಸ್ಸನ್ ಮಾಡಬೇಡಿ. ಗುಣಾತ್ಮಕ ದುಗ್ಧ ಅವಲೋಕನ ವರ್ಜನೆ.",
        steps: "ನೀವು ದದ್ದು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಅನುಭವಿಸಿದರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ."
      }
    }
  };

  try {
    const data = await callAIBackend('/api/ai/analyze', { type: fileType, language: lang, content });
    if (data?.output && typeof data.output === 'object') {
      return data.output;
    }
  } catch (error) {
    console.warn('[AI Engine] Analysis fallback:', error?.message || error);
  }

  const langResponses = responses[lang] || responses.en;
  return langResponses[fileType] || langResponses.report;
};

const callAIBackend = async (endpoint, payload) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch (jsonError) {
    throw new Error(`AI backend returned invalid JSON: ${jsonError.message}. Response: ${text.slice(0, 400)}`);
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || `AI backend request failed with status ${response.status}`);
  }

  return data;
};

// Text-to-Speech function
export const speakText = (text, lang = 'en') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech Synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Map language codes to speech synthesis language codes
  const langMap = {
    en: 'en-US',
    kn: 'kn-IN',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR'
  };

  utterance.lang = langMap[lang] || 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};

export const analyzePatientVitals = (vitals = {}, doctors = [], lang = 'en') => {
  const summaryParts = [];
  const bpString = String(vitals.bp || '').replace(/\s+/g, '');
  const sugarValue = parseFloat(String(vitals.sugar || '').replace(/[^0-9.]/g, '')) || null;
  const weightValue = parseFloat(String(vitals.weight || '').replace(/[^0-9.]/g, '')) || null;
  const bpParts = bpString.split('/').map((part) => parseInt(part, 10));
  const systolic = bpParts[0] || 0;
  const diastolic = bpParts[1] || 0;

  let recommendedSpecialist = 'General Physician';

  if (systolic >= 140 || diastolic >= 90) {
    summaryParts.push('Your blood pressure is elevated and you may be at risk for hypertension.');
    recommendedSpecialist = 'Cardiology';
  } else if (systolic >= 130 || diastolic >= 80) {
    summaryParts.push('Your blood pressure is slightly high and should be monitored closely.');
    recommendedSpecialist = 'Cardiology';
  } else if (systolic > 0 && diastolic > 0) {
    summaryParts.push('Your blood pressure is within a healthy range.');
  }

  if (sugarValue !== null && !Number.isNaN(sugarValue)) {
    if (sugarValue >= 126) {
      summaryParts.push('Your sugar level is in the diabetic range.');
      recommendedSpecialist = 'Endocrinology';
    } else if (sugarValue >= 100) {
      summaryParts.push('Your sugar level is slightly elevated, so dietary control is recommended.');
      recommendedSpecialist = recommendedSpecialist === 'General Physician' ? 'Endocrinology' : recommendedSpecialist;
    } else {
      summaryParts.push('Your sugar level is within the normal range.');
    }
  }

  if (weightValue) {
    if (weightValue >= 95) {
      summaryParts.push('Your weight is above the ideal range; a nutrition and exercise plan can help.');
      recommendedSpecialist = recommendedSpecialist === 'General Physician' ? 'Nutritionist' : recommendedSpecialist;
    } else if (weightValue <= 50) {
      summaryParts.push('Your weight is below the ideal range; follow-up with a health specialist is advised.');
      recommendedSpecialist = recommendedSpecialist === 'General Physician' ? 'Nutritionist' : recommendedSpecialist;
    }
  }

  const summary = summaryParts.length > 0 ? summaryParts.join(' ') : 'Your vitals look stable. Maintain your healthy habits.';

  const matchingDoctors = doctors.filter((doctor) =>
    doctor.specialty?.toLowerCase().includes(recommendedSpecialist.toLowerCase())
  );

  const suggestedDoctors = matchingDoctors.length > 0
    ? matchingDoctors.slice(0, 3)
    : doctors.slice(0, 3);

  return {
    summary,
    advice: summary,
    specialist: recommendedSpecialist,
    doctors: suggestedDoctors,
  };
};

// Stop speaking
export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const getAIChatResponse = async (query, lang = 'en') => {
  try {
    const data = await callAIBackend('/api/ai/chat', { prompt: query, language: lang });
    if (data?.output) {
      return String(data.output);
    }
  } catch (error) {
    console.warn('[AI Engine] Chat fallback:', error?.message || error);
  }

  const q = String(query || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0C80-\u0CFF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const cannedResponses = {
    en: {
      fever: "Fever can be caused by various infections. Rest well, stay hydrated, and take paracetamol if needed. If temperature exceeds 103°F, seek medical attention.",
      diabetes: "Diabetes management requires a low-sugar diet and regular exercise. Monitor your blood glucose levels daily and follow your prescribed medication strictly.",
      headache: "Headaches can be due to stress, dehydration, or eye strain. Drink water, rest in a quiet room, and avoid screens. See a doctor for severe, persistent pain.",
      medicine: "Always follow the dosage recommended by your doctor. Do not skip doses or self-medicate for chronic conditions.",
      default: "I am your AI Assistant. I can help with symptom checking, understanding reports, and general health advice. Please consult a qualified doctor for clinical diagnosis."
    },
    kn: {
      fever: "ವಿವಿಧ ಸೋಂಕುಗಳಿಂದ ಜ್ವರ ಬರಬಹುದು. ಚೆನ್ನಾಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ, ಹೈಡ್ರೀಕರಿಸಿದ ಸ್ಥಿತಿಯಲ್ಲಿರಿ ಮತ್ತು ಅಗತ್ಯವಿದ್ದರೆ ಪ್ಯಾರಸಿಟಮಾಲ್ ತೆಗೆದುಕೊಳ್ಳಿ. ತಾಪಮಾನವು 103°F ಮೀರಿದರೆ, ವೈದ್ಯಕೀಯ ಗಮನವನ್ನು ಪಡೆಯಿರಿ.",
      diabetes: "ಮಧುಮೇಹ ನಿರ್ವಹಣೆಗೆ ಕಡಿಮೆ ಸಕ್ಕರೆಯ ಆಹಾರ ಮತ್ತು ನಿಯಮಿತ ವ್ಯಾಯಾಮದ ಅಗತ್ಯವಿದೆ. ಪ್ರತಿದಿನ ನಿಮ್ಮ ರಕ್ತದ ಗ್ಲುಕೋಸ್ ಮಟ್ಟವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಸೂಚಿಸಿದ ಔಷಧಿಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಅನುಸರಿಸಿ.",
      headache: "ಒತ್ತಡ, ನಿರ್ಜಲೀಕರಣ ಅಥವಾ ಕಣ್ಣಿನ ಆಯಾಸದಿಂದ ತಲೆನೋವು ಉಂಟಾಗಬಹುದು. ನೀರು ಕುಡಿಯಿರಿ, ಶಾಂತ ಕೋಣೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ಪರದೆಯನ್ನು ನೋಡುವುದನ್ನು ತಪ್ಪಿಸಿ.",
      medicine: "ಯಾವಾಗಲೂ ನಿಮ್ಮ ವೈದ್ಯರು ಶಿಫಾರಸು ಮಾಡಿದ ಡೋಸೇಜ್ ಅನ್ನು ಅನುಸರಿಸಿ. ದೀರ್ಘಕಾಲದ ಸ್ಥಿತಿಗಳಿಗೆ ಡೋಸ್‌ಗಳನ್ನು ಬಿಡಬೇಡಿ ಅಥವಾ ಸ್ವಯಂ-ಔಷಧಿ ಮಾಡಬೇಡಿ.",
      default: "ನಾನು ನಿಮ್ಮ ಎಐ ಸಹಾಯಕ. ರೋಗಲಕ್ಷಣಗಳ ತಪಾಸಣೆ, ವರದಿಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಸಲಹೆಯೊಂದಿಗೆ ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಕ್ಲಿನಿಕಲ್ ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ಅರ್ಹ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ."
    }
  };

  const r = cannedResponses[lang] || cannedResponses.en;

  if (q.includes('fever') || q.includes('ಜ್ವರ')) return r.fever;
  if (q.includes('diabetes') || q.includes('sugar') || q.includes('blood sugar') || q.includes('high sugar') || q.includes('ಮಧುಮೇಹ') || q.includes('ಸಕ್ಕರೆ')) return r.diabetes;
  if (q.includes('headache') || q.includes('headach') || q.includes('migraine') || q.includes('ತಲೆನೋವು') || q.includes('ತಲೆಯ ನೋವು')) return r.headache;
  if (q.includes('medication') || q.includes('medicine') || q.includes('drug') || q.includes('ಔಷಧಿ')) return r.medicine;
  
  return r.default;
};
