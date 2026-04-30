import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, RefreshCw, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { getAIChatResponse, analyzeMedicalImage } from '../../utils/aiEngine';
import { useHealth } from '../../context/HealthContext';
import { translations } from '../../utils/translations';
import { motion } from 'motion/react';

const PatientAIChat = () => {
  const { language } = useHealth();
  const t = translations[language] || translations.en;
  
  const initialContent = language === 'kn' 
    ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್‌ಹೆಲ್ತ್ ಎಐ. ನೀವು ರೋಗಲಕ್ಷಣಗಳು, ಔಷಧಿ ಮಾರ್ಗದರ್ಶನದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಬಹುದು ಅಥವಾ ತ್ವರಿತ ಸಾರಾಂಶಕ್ಕಾಗಿ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು. ಇಂದು ನೀವು ಹೇಗೆ ಭಾವಿಸುತ್ತಿದ್ದೀರಿ?'
    : 'Hi! I am your SmartHealth AI. You can ask me about symptoms, medicine guidance, or even upload a report for a quick summary. How are you feeling today?';

  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialContent }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Reset chat if language changes to show initial message in correct language
  useEffect(() => {
    setMessages([{ role: 'assistant', content: initialContent }]);
  }, [language]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const response = await getAIChatResponse(input, language);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } catch (error) {
        console.error('[PatientAIChat] AI chat failed:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: language === 'kn' ? 'ಕ್ಷಮಿಸಿ, AI ಉತ್ತರವನ್ನು ತಯಾರಿಸಲು ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ.' : 'Sorry, there was an issue generating a response.' }]);
      } finally {
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleFileUpload = (type) => {
    setIsTyping(true);
    setTimeout(async () => {
      try {
        const result = await analyzeMedicalImage(type, language);
        const content = language === 'kn' 
          ? `ನಿಮ್ಮ ${type} ಅನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ:\n• ಸ್ಥಿತಿ: ${result.disease}\n• ಸಲಹೆ: ${result.precautions}\n• ಶಿಫಾರಸು: ${result.steps}\n\nಗಮನಿಸಿ: ಇದು ಸಿಮ್ಯುಲೇಟೆಡ್ ಎಐ ಒಳನೋಟವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.`
          : `Analyzed your ${type}:\n• Condition: ${result.disease}\n• Suggestion: ${result.precautions}\n• Recommendation: ${result.steps}\n\nNote: This is a simulated AI insight. Please consult your doctor.`;

        setMessages(prev => [...prev, { role: 'assistant', content }]);
      } catch (error) {
        console.error('[PatientAIChat] Analysis failed:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: language === 'kn' ? 'ಕ್ಷಮಿಸಿ, ವರದಿ ವಿಶ್ಲೇಷಿಸಲು ತೊಂದರೆ ಉಂಟಾಗಿದೆ.' : 'Sorry, there was an issue analyzing the report.' }]);
      } finally {
        setIsTyping(false);
      }
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
      <div className="p-6 medical-gradient text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{t.aiAssistant}</h3>
            <p className="text-[10px] uppercase font-black tracking-widest opacity-80">24/7 {language === 'kn' ? 'ವರ್ಚುವಲ್ ಬೆಂಬಲ' : 'Virtual Support'}</p>
          </div>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', content: initialContent }])} className="p-2 hover:bg-white/10 rounded-full">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-slate-50/30 dark:bg-slate-900/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${
              msg.role === 'user' ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400' : 'bg-medical-50 dark:bg-medical-900/20 border-medical-100 dark:border-medical-800 text-medical-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] p-5 rounded-2xl shadow-sm ${
              msg.role === 'user' ? 'bg-medical-600 text-white rounded-tr-none' : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-medical-50 dark:bg-medical-900/20 border-2 border-medical-100 dark:border-medical-800 text-medical-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin text-medical-500" />
            </div>
            <div className="p-4 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-[#1E293B] border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-4 mb-4">
           {[
             { icon: FileText, label: t.reports, type: 'report' },
             { icon: ImageIcon, label: t.medicines, type: 'medicine' },
           ].map(btn => (
             <button 
               key={btn.type}
               onClick={() => handleFileUpload(btn.type)}
               className="flex items-center gap-2 px-4 py-2 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 hover:bg-medical-50 hover:text-medical-600 dark:hover:bg-medical-900/20 hover:border-medical-100 transition-all"
             >
               <btn.icon className="w-3.5 h-3.5" />
               {btn.label}
             </button>
           ))}
        </div>
        <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <input 
            type="text" 
            placeholder={language === 'kn' ? "ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ (ಉದಾಹರಣೆಗೆ ಜ್ವರ, ತಲೆನೋವು)..." : "Describe your symptoms (e.g. fever, headache)..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm dark:text-white"
          />
          <button 
            onClick={handleSend}
            className="medical-gradient text-white p-3 rounded-xl hover:scale-105 transition-all shadow-md active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientAIChat;
