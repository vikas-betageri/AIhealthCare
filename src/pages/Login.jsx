import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useHealth } from '../context/HealthContext';
import { translations } from '../utils/translations';
import { Activity, Mail, Lock, AlertCircle, Globe, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('patient');
  const [error, setError] = useState('');
  const { login, language, setLanguage, theme, setTheme } = useHealth();
  const navigate = useNavigate();
  const t = translations[language] || translations.en;

  const images = {
    patient: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
    doctor: "https://images.unsplash.com/photo-1505751172107-1293931be6ec?q=80&w=2070&auto=format&fit=crop",
    admin: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password, type);
    if (result.success) {
      navigate(`/${type}`);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300 relative">
      {/* Floating Controls */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-3 bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl">
        <div className="relative group">
          <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all">
            <Globe className="w-5 h-5" />
          </button>
          <div className="absolute top-full right-0 mt-2 w-40 bg-white/95 dark:bg-[#1E293B] backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1">
            {['en', 'es', 'hi', 'fr', 'kn'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase transition-colors rounded-xl ${language === lang ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500'}`}
              >
                {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : lang === 'hi' ? 'हिन्दी' : lang === 'fr' ? 'Français' : 'ಕನ್ನಡ'}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Background Section */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <motion.img 
          key={type}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          src={images[type]} 
          alt="medical background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-20 text-white z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl font-black mb-6 leading-tight uppercase tracking-tighter">Unified<br/>MediCore Care</h1>
            <p className="text-xl text-blue-50 font-medium max-w-lg opacity-80 italic">Experience the next generation of healthcare management with integrated AI assistance and real-time coordination.</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-[#0F172A] relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800"
        >
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-2xl text-slate-800 dark:text-white">MediCore AI</span>
            </Link>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.welcome}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm font-medium">Access your personalized health dashboard</p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700/50">
            {['patient', 'doctor', 'admin'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                  type === t ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest leading-none">{t.password}</label>
                <a href="#" className="text-[10px] text-blue-600 font-black hover:underline uppercase tracking-widest">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 dark:bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all transform hover:scale-[1.01]"
            >
              {t.login}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 dark:text-slate-400 font-bold text-xs">
            New here?{' '}
            <Link to="/register" className="text-blue-600 font-black hover:underline uppercase tracking-widest">{t.register}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
