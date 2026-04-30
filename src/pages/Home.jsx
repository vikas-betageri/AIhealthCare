import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Users, UserRound, ArrowRight, LayoutDashboard, Microscope, Globe, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useHealth } from '../context/HealthContext';
import { translations } from '../utils/translations';

const Home = () => {
  const { language, setLanguage, theme, setTheme } = useHealth();
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none transition-transform hover:rotate-12">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-slate-800 dark:text-white tracking-tighter uppercase">MediCore AI</span>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Language & Theme Controls */}
            <div className="hidden md:flex items-center gap-4 border-r border-slate-200 dark:border-slate-700 pr-6 mr-2">
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{language}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
                  {['en', 'es', 'hi', 'fr', 'kn'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors ${language === lang ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-500'}`}
                    >
                      {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : lang === 'hi' ? 'हिन्दी' : lang === 'fr' ? 'Français' : 'ಕನ್ನಡ'}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="px-5 py-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                {t.login}
              </Link>
              <Link to="/register" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none hover:scale-[1.05]">
                {t.register}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=2074&auto=format&fit=crop"
            alt="hospital background" 
            className="w-full h-full object-cover opacity-10 dark:opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-[#0F172A]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <ShieldCheck className="w-4 h-4" />
              Empowering Modern Healthcare Excellence
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] mb-8 uppercase tracking-tighter">
              Integrated <br/>
              <span className="text-blue-600">MediCore AI</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg mb-10 leading-relaxed italic">
              Advanced health management with integrated AI assistance and real-time coordination for patients, doctors, and administrators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 dark:shadow-none flex items-center gap-3">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Live Demo
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 bg-white dark:bg-[#1E293B] p-8 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?q=80&w=2070&auto=format&fit=crop" 
                alt="Diagnostics" 
                className="w-full h-[400px] object-cover rounded-[2.5rem]"
              />
              <div className="absolute top-12 right-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border border-white/20">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Analysis</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </header>

      {/* Solutions Section */}
      <section className="py-24 px-6 bg-white dark:bg-[#1E293B] transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center mb-20 text-balance">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 italic">Platform Ecosystem</h2>
          <p className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter sm:text-5xl">Unified Health Intelligence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { 
              title: t.adminPortal, 
              desc: 'System oversight, doctor verification, and secure infrastructure monitoring.', 
              icon: ShieldCheck, 
              color: 'bg-blue-600',
              img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
            },
            { 
              title: t.specialistTools, 
              desc: 'Clinical IA analyzers, appointment management, and patient coordination tools.', 
              icon: Microscope, 
              color: 'bg-indigo-600',
              img: "https://images.unsplash.com/photo-1505751172107-1293931be6ec?q=80&w=2070&auto=format&fit=crop"
            },
            { 
              title: t.patientSupport, 
              desc: 'Vitals tracking, specialist discovery, and instant AI symptom assistance.', 
              icon: UserRound, 
              color: 'bg-emerald-600',
              img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
            },
          ].map((portal, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="group bg-slate-50 dark:bg-[#0F172A] rounded-[3.5rem] p-10 relative overflow-hidden transition-all border border-slate-100 dark:border-slate-800 shadow-xl"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                <img src={portal.img} alt={portal.title} className="w-full h-full object-cover" />
              </div>
              <div className={`w-14 h-14 ${portal.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl`}>
                <portal.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">{portal.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 italic">{portal.desc}</p>
              <Link to="/login" className="text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:underline flex items-center gap-2">
                Unlock Access <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm uppercase tracking-tighter dark:text-white">MediCore AI</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">© 2026 MediCore Health Systems. All Rights Reserved.</p>
          <div className="flex gap-6">
            {['Twitter', 'LinkedIn', 'Github'].map(s => (
              <a key={s} href="#" className="text-slate-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
