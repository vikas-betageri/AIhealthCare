import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { translations } from '../../utils/translations';
import { Calendar, User, UserRound, Clock, Activity } from 'lucide-react';
import { motion } from 'motion/react';

const AllAppointments = () => {
  const { appointments, language } = useHealth();
  const t = translations[language] || translations.en;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Global record of clinical coordination events</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-black text-blue-900 dark:text-blue-200 uppercase tracking-widest">{appointments.length} Total</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinician</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {appointments.map((app, index) => (
                <motion.tr 
                  key={app.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 flex items-center justify-center font-black">
                        {app.patientName?.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">{app.patientName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 flex items-center justify-center">
                        <UserRound className="w-5 h-5" />
                      </div>
                      Dr. {app.doctorName}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                        <Calendar className="w-4 h-4 text-slate-400" /> {app.date}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-6">
                        <Clock className="w-3 h-3" /> {app.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                      app.status === 'accepted' ? 'bg-green-100 text-green-600' : 
                      app.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        app.status === 'accepted' ? 'bg-green-500' : 
                        app.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                      {app.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Calendar className="w-16 h-16 text-slate-100 dark:text-slate-800 mb-6" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">{t.noAppointments}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
