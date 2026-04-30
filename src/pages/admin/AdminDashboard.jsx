import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { translations } from '../../utils/translations';
import { Users, UserRound, Calendar, Clock, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { doctors, patients, appointments, language } = useHealth();
  const t = translations[language] || translations.en;

  const stats = [
    { label: t.patientSupport, value: patients.length, icon: Users, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', change: '+12%' },
    { label: t.appointments, value: appointments.length, icon: Calendar, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600', change: '+5%' },
    { label: t.doctorApprovals, value: doctors.filter(d => !d.isApproved).length, icon: Clock, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600', change: '8 Pending' },
    { label: t.healthOverview, value: '88/100', icon: TrendingUp, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', change: '94% AI Accuracy' },
  ];

  const chartData = [
    { name: 'Mon', value: 4 },
    { name: 'Tue', value: 7 },
    { name: 'Wed', value: 5 },
    { name: 'Thu', value: 9 },
    { name: 'Fri', value: 12 },
    { name: 'Sat', value: 3 },
    { name: 'Sun', value: 6 },
  ];

  return (
    <div className="space-y-8 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t.adminPortal}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">{t.monitorEcosystem}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-800 shadow-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                stat.change.includes('+') ? 'text-green-500 bg-green-50 dark:bg-green-500/10' : 
                stat.change.includes('Pending') ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] card-shadow border border-slate-100 dark:border-slate-800 flex flex-col h-[440px] shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.vitals}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{language === 'kn' ? 'ಸರಾಸರಿ ರೋಗಿಯ ಮೆಟ್ರಿಕ್ಸ್ (ಕಳೆದ 30 ದಿನಗಳು)' : 'Average Patient Metrics (Last 30 Days)'}</p>
            </div>
            <div className="flex gap-6">
              <span className="flex items-center text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> {t.bloodPressure} LEVEL
              </span>
            </div>
          </div>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', backgroundColor: '#1e293b', color: '#fff'}}
                  itemStyle={{color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-blue-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-[440px]">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">{t.systemStatus}</h2>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
                <p className="text-[10px] uppercase tracking-widest opacity-60 mb-2 font-black tracking-[0.2em]">{t.backendEngine}</p>
                <p className="text-md font-black italic tracking-tight">Express_Node_v20.x_Active</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest bg-white/10 p-4 rounded-xl border border-white/5">
                  <span className="opacity-70">{t.uptime}:</span>
                  <span>99.99%</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest bg-white/10 p-4 rounded-xl border border-white/5">
                  <span className="opacity-70">{t.latency}:</span>
                  <span>14ms</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-auto bg-white text-blue-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl hover:scale-[1.02] z-10 transition-transform">
              {t.generateAuditReport}
            </button>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
