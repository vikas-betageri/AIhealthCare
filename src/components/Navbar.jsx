import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { translations } from '../utils/translations';
import { Bell, Search, Sun, Moon, Globe, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, userType, theme, setTheme, language, setLanguage } = useHealth();
  const t = translations[language] || translations.en;
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 fixed top-0 right-0 left-0 md:left-64 z-10 flex items-center justify-between px-4 sm:px-6 md:px-8 transition-all duration-300">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar - Hidden on mobile, shown on md and up */}
      <div className="hidden md:flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full flex-1 max-w-md transition-colors">
        <Search className="text-slate-400 w-4 h-4 flex-shrink-0" />
        <input 
          type="text" 
          placeholder={t.searchPlaceholder} 
          className="bg-transparent border-none outline-none text-sm w-full dark:text-white placeholder-slate-400"
        />
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto md:ml-4">
        {/* Language Selector - Simplified on mobile */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors text-xs sm:text-sm">
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline text-[10px] font-black uppercase">{language}</span>
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
            {['en', 'es', 'hi', 'fr', 'kn'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors ${language === lang ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {lang === 'en' ? 'English' : 
                 lang === 'es' ? 'Español' : 
                 lang === 'hi' ? 'हिन्दी' : 
                 lang === 'fr' ? 'Français' : 'ಕನ್ನಡ'}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors hidden sm:block">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1E293B]"></span>
        </button>

        {/* User Profile - Responsive */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3 border-l border-slate-200 dark:border-slate-700 pl-3 md:pl-6 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-1">{userType === 'admin' ? 'Chief Admin' : userType}</p>
          </div>
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-600">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
