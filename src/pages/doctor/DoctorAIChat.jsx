import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, RefreshCw } from 'lucide-react';
import { getAIChatResponse } from '../../utils/aiEngine';
import { useHealth } from '../../context/HealthContext';

const DoctorAIChat = () => {
  const { language } = useHealth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello Dr. I am your AI clinical assistant. How can I help you today with disease insights or treatment suggestions?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
        console.error('[DoctorAIChat] AI chat failed:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an issue generating a response.' }]);
      } finally {
        setIsTyping(false);
      }
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-160px)] h-auto flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
      <div className="p-6 bg-medical-500 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Clinical Assistant</h3>
            <p className="text-[10px] uppercase font-black tracking-widest opacity-80">Simulated intelligence Engine</p>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="p-2 hover:bg-white/10 rounded-full">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${
              msg.role === 'user' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-medical-50 border-medical-100 text-medical-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] md:max-w-[70%] p-5 rounded-2xl ${
              msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-medical-50 border-2 border-medical-100 text-medical-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <input 
            type="text" 
            placeholder="Ask about diseases, symptoms, or medicines..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            className="bg-medical-600 text-white p-3 rounded-xl hover:bg-medical-700 shadow-lg shadow-medical-200 shadow-medical-200 shadow-md transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAIChat;
