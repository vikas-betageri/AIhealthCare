import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, UserRound, Calendar, FileText, 
  LogOut, MessageSquare, Activity, ShieldCheck, 
  ClipboardCheck, Clock, Settings, X
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { translations } from '../utils/translations';

const Sidebar = ({ isOpen, onClose }) => {
  const { userType, logout, language } = useHealth();
  const navigate = useNavigate();
  const t = translations[language] || translations.en;

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const adminLinks = [
    { to: '/admin', icon: Home, label: t.dashboard },
    { to: '/admin/doctors', icon: UserRound, label: 'Doctors' },
    { to: '/admin/approvals', icon: ShieldCheck, label: 'Approvals' },
    { to: '/admin/patients', icon: Users, label: 'Patients' },
    { to: '/admin/appointments', icon: Calendar, label: t.appointments },
  ];

  const doctorLinks = [
    { to: '/doctor', icon: Home, label: t.dashboard },
    { to: '/doctor/patients', icon: Users, label: 'Patients' },
    { to: '/doctor/appointments', icon: Calendar, label: t.appointments },
    { to: '/doctor/analyzer', icon: ClipboardCheck, label: 'AI Analyzer' },
    { to: '/doctor/chat', icon: MessageSquare, label: t.aiAssistant },
  ];

  const patientLinks = [
    { to: '/patient', icon: Home, label: t.dashboard },
    { to: '/patient/doctors', icon: UserRound, label: t.findDoctors },
    { to: '/patient/appointments', icon: Calendar, label: t.appointments },
    { to: '/patient/reports', icon: FileText, label: t.reports },
    { to: '/patient/chat', icon: MessageSquare, label: t.aiAssistant },
  ];

  const links = userType === 'admin' ? adminLinks : userType === 'doctor' ? doctorLinks : patientLinks;
  const portalLabel = userType === 'admin' ? t.adminPortal : userType === 'doctor' ? t.specialistTools : t.patientSupport;

  const allLinks = [...links, { to: '/profile', icon: Settings, label: t.settings || 'Settings' }];

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed md:static w-full max-w-xs md:w-64 h-full md:h-screen bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 overflow-hidden transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Activity className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-blue-900 dark:text-white tracking-tight leading-none">
              MediCore AI
            </span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 mt-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {portalLabel}
        </div>

        <nav className="flex-1 mt-2 space-y-0.5 overflow-y-auto">
          {allLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/doctor' || link.to === '/patient' || link.to === '/profile'}
              onClick={handleNavClick}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <link.icon className="w-5 h-5 mr-1 flex-shrink-0" />
              <span className="text-sm truncate">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 sm:p-6 mt-auto space-y-3">
          <div className="bg-blue-900 rounded-2xl p-3 sm:p-4 text-white hidden sm:block">
            <p className="text-[10px] uppercase font-bold opacity-60 mb-2 tracking-wider">System Status</p>
            <p className="text-xs sm:text-sm font-semibold mb-3">Storage: Local</p>
            <div className="w-full bg-blue-800 rounded-full h-1.5">
              <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
