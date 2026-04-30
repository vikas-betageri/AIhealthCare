import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { translations } from '../../utils/translations';
import { Calendar, Clock, MapPin, UserRound, AlertCircle, Video, Link as LinkIcon, FileText } from 'lucide-react';
import { motion } from 'motion/react';

const PatientAppointments = () => {
  const { user, appointments, language } = useHealth();
  const t = translations[language] || translations.en;
  const [expandedId, setExpandedId] = useState(null);
  
  const myAppointments = appointments.filter(a => a.patientId === user?.id);
  const sortedAppointments = [...myAppointments].sort((a, b) => {
    // Confirmed appointments first, then pending
    if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
    if (a.status !== 'confirmed' && b.status === 'confirmed') return 1;
    return 0;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.appointments}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
            {myAppointments.length > 0 
              ? `You have ${myAppointments.length} scheduled appointments.` 
              : t.noAppointments}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedAppointments.map((app, index) => (
          <motion.div 
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all"
          >
            {/* Main Card */}
            <div 
              className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
            >
              <div className="flex gap-6 items-start flex-1">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner flex-shrink-0">
                  <UserRound className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Dr. {app.doctorName}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">{app.specialization || 'Specialist'}</p>
                  
                  {/* Show Scheduled Time if Confirmed */}
                  {app.status === 'confirmed' && app.scheduledDate && app.scheduledTime ? (
                    <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-300 mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(app.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" /> {app.scheduledTime}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest">
                        {app.meetingType === 'google-meet' ? (
                          <>
                            <Video className="w-3.5 h-3.5" /> Google Meet
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5" /> In-Person
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" /> {app.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" /> {app.time}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  app.status === 'confirmed' ? 'bg-green-100 text-green-600' : 
                  app.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                  app.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    app.status === 'confirmed' ? 'bg-green-500' : 
                    app.status === 'pending' ? 'bg-orange-500' : 
                    app.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {app.status === 'confirmed' ? 'Scheduled' : app.status}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === app.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-6 space-y-4"
              >
                {/* Google Meet Link */}
                {app.meetingType === 'google-meet' && app.meetingLink && (
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-600" />
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Join Video Meeting</p>
                      </div>
                    </div>
                    <a 
                      href={app.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm break-all"
                    >
                      <LinkIcon className="w-4 h-4 flex-shrink-0" />
                      {app.meetingLink}
                    </a>
                  </div>
                )}

                {/* Doctor's Notes */}
                {app.doctorNotes && (
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Doctor's Notes</p>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{app.doctorNotes}</p>
                  </div>
                )}

                {/* Pending Request Info */}
                {app.status === 'pending' && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-800 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-orange-900 dark:text-orange-200 text-sm">Request Pending</p>
                      <p className="text-orange-800 dark:text-orange-300 text-xs mt-1">Your appointment request has been sent to the doctor. They will schedule it soon and you'll receive an email notification.</p>
                    </div>
                  </div>
                )}

                {/* Appointment Details Summary */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Appointment Details</p>
                  {app.reason && (
                    <div className="text-xs">
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Reason</p>
                      <p className="text-slate-700 dark:text-slate-300">{app.reason}</p>
                    </div>
                  )}
                  {app.appointmentType && (
                    <div className="text-xs">
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Type</p>
                      <p className="text-slate-700 dark:text-slate-300 capitalize">{app.appointmentType}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {myAppointments.length === 0 && (
          <div className="bg-white dark:bg-[#1E293B] p-20 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-200">
              <Calendar className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t.noAppointments}</h2>
            <p className="text-slate-400 font-medium italic max-w-xs mb-8">{t.scheduleFirst}</p>
            <button 
              onClick={() => window.location.href='/patient/doctors'}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:scale-105 transition-transform"
            >
              {t.bookNow}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
