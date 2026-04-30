import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { translations } from '../../utils/translations';
import { Calendar, Clock, UserRound, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const DoctorAppointments = () => {
  const { user, appointments, updateAppointmentStatus, language } = useHealth();
  const t = translations[language] || translations.en;
  
  const myAppointments = appointments.filter(a => a.doctorId === user?.id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.appointments}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
            Manage your schedule and patient sessions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myAppointments.map((app, index) => (
          <motion.div 
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="flex gap-6 items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner font-black text-xl">
                {app.patientName?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{app.patientName}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient ID: #{app.patientId}</p>
                <div className="flex flex-wrap gap-4 text-slate-400">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" /> {app.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> {app.time}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
              {app.status === 'pending' ? (
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => updateAppointmentStatus(app.id, 'accepted')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all font-black"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept
                  </button>
                  <button 
                    onClick={() => updateAppointmentStatus(app.id, 'rejected')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-black"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              ) : (
                <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  app.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                   {app.status === 'accepted' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                   {app.status}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {myAppointments.length === 0 && (
          <div className="bg-white dark:bg-[#1E293B] p-20 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-200">
              <Calendar className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t.noAppointments}</h2>
            <p className="text-slate-400 font-medium italic max-w-xs">You don't have any appointments scheduled yet. New requests will appear here once submitted by patients.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
