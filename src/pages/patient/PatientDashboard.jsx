import React, { useState, useMemo } from 'react';
import { useHealth } from '../../context/HealthContext';
import { HEALTH_STATS } from '../../utils/mockData';
import { translations } from '../../utils/translations';
import { analyzeMedicalImage, analyzePatientVitals } from '../../utils/aiEngine';
import { 
  Heart, Activity, Weight, Droplets, TrendingUp, 
  ShieldCheck, Calendar, Clock, ChevronRight, AlertCircle,
  UserRound, Sparkles, Upload, FileText, CheckCircle2, AlertCircle as AlertIcon, Clipboard
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const PatientDashboard = () => {
  const { user, appointments, patients, doctors, userType, language } = useHealth();
  const t = translations[language] || translations.en;
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [type, setType] = useState('report');
  
  const currentPatient = useMemo(() => {
    if (!user) return null;
    return patients.find((p) => p.id === user.id) || user;
  }, [patients, user]);

  const vitals = currentPatient?.vitals || {};
  const bpValue = vitals.bp || 'N/A';
  const sugarValue = vitals.sugar || 'N/A';
  const weightValue = vitals.weight || 'N/A';

  const healthAnalysis = useMemo(
    () => analyzePatientVitals(vitals, doctors, language),
    [vitals, doctors, language]
  );

  const healthScore = useMemo(() => {
    let score = 100;
    const bpParts = String(vitals.bp || '').split('/').map((val) => parseInt(val, 10));
    const systolic = bpParts[0] || 0;
    const diastolic = bpParts[1] || 0;
    const sugar = parseFloat((vitals.sugar || '').replace(/[a-zA-Z\s/]+/g, '')) || 0;
    const weight = parseFloat((vitals.weight || '').replace(/[a-zA-Z\s/]+/g, '')) || 0;

    if (systolic >= 140 || diastolic >= 90) score -= 30;
    else if (systolic >= 130 || diastolic >= 80) score -= 15;
    if (sugar >= 126) score -= 25;
    else if (sugar >= 100) score -= 10;
    if (weight >= 95 || weight <= 50) score -= 10;

    return Math.max(30, score);
  }, [vitals]);

  const myApps = appointments.filter(a => a.patientId === user?.id);
  
  const stats = [
    { label: t.bloodPressure, value: bpValue, icon: Activity, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', unit: 'mmHg' },
    { label: t.sugarLevel, value: sugarValue, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', unit: 'mg/dL' },
    { label: t.recoveryProgress, value: weightValue, icon: Weight, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', unit: 'kg' },
    { label: t.healthScore, value: String(healthScore), icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10', unit: '%' },
  ];

  const handleUpload = () => {
    if (!file) return;
    setAnalyzing(true);

    setTimeout(async () => {
      try {
        const analysisResult = await analyzeMedicalImage(type, language);
        setResult(analysisResult);
      } catch (error) {
        console.error('[PatientDashboard] AI analysis failed:', error);
      } finally {
        setAnalyzing(false);
      }
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.healthOverview}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">{t.hello} {user?.name}, {t.healthStable}</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white dark:bg-[#1E293B] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 shadow-xl">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{t.nextCheckup}</p>
              <p className="text-xs font-black text-slate-700 dark:text-white uppercase">{t.noneScheduled}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800"
          >
            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase">{stat.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Health Summary</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{healthAnalysis.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-50 dark:bg-slate-900/20 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Recommended Specialist</p>
              <p className="mt-4 text-lg font-black text-slate-900 dark:text-white">{healthAnalysis.specialist}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/20 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">What to focus on</p>
              <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{healthAnalysis.advice || 'Keep monitoring your vitals and follow doctor guidance.'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Specialist Doctor Suggestions</p>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-3">Consult a specialist</h2>
            </div>
          </div>
          <div className="space-y-4">
            {healthAnalysis.doctors.length > 0 ? (
              healthAnalysis.doctors.map((doctor) => (
                <div key={doctor.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
                  <p className="font-black text-slate-900 dark:text-white">{doctor.name}</p>
                  <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{doctor.specialty}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{doctor.hospital || doctor.name}</p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] uppercase tracking-widest font-black text-slate-600 dark:text-slate-300">
                    {doctor.rating ? `Rating ${doctor.rating}` : 'Top Specialist'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No doctor suggestions are available right now. Please check back later.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Analyzer Section */}
      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="text-medical-500 w-8 h-8" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.aiAssistant}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              {['report', 'medicine', 'prescription'].map((fileType) => (
                <button
                  key={fileType}
                  onClick={() => setType(fileType)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    type === fileType ? 'border-medical-500 bg-medical-50 text-medical-600 font-bold dark:bg-medical-900/20' : 'border-slate-50 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="capitalize">{fileType} Analysis</span>
                </button>
              ))}
            </div>

            <label className="group relative block w-full aspect-square cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <div className={`w-full h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 transition-all ${
                file ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-medical-400 hover:bg-medical-50 dark:hover:bg-medical-900/10'
              }`}>
                {file ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                    <p className="text-sm font-bold text-green-700 text-center truncate w-full dark:text-green-400">{file.name}</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-300 mb-3 group-hover:text-medical-500" />
                    <p className="text-sm font-bold text-slate-500 text-center dark:text-slate-400">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest text-center">PNG, JPG, PDF up to 10MB</p>
                  </>
                )}
              </div>
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || analyzing}
              className="w-full medical-gradient text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-medical-200"
            >
              {analyzing ? t.analyzing : t.runAnalysis}
            </button>
          </div>

          <div className="lg:col-span-2">
            {analyzing ? (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-medical-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse italic">Decoding medical data using simulated AI engine...</p>
              </div>
            ) : result ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="text-medical-600 w-5 h-5" />
                    {t.analysisResult}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-700/50">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1">{t.detailsExtracted}</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{result.details}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-medical-50 dark:bg-medical-900/10">
                      <p className="text-[10px] text-medical-600 dark:text-medical-400 uppercase font-black mb-1">{t.possibleCondition}</p>
                      <p className="text-sm font-bold text-medical-900 dark:text-white leading-relaxed">{result.disease}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clipboard className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest font-black">{t.recommendations}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white underline decoration-blue-200 dark:decoration-blue-800 underline-offset-4">{t.medicines}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{result.medicine}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white underline decoration-blue-200 dark:decoration-blue-800 underline-offset-4">{t.precautions}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{result.precautions}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white underline decoration-blue-200 dark:decoration-blue-800 underline-offset-4">{t.nextSteps}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{result.steps}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Upload className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
                <h4 className="text-xl font-bold text-slate-400 dark:text-white mb-2">{t.noDocument}</h4>
                <p className="text-slate-400 dark:text-slate-500 max-w-sm">Upload a medical document to start AI analysis and get instant insights.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.vitals}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.historicalAnalysis}</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HEALTH_STATS}>
                <defs>
                  <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" opacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', backgroundColor: '#1e293b', color: '#fff'}} />
                <Area type="monotone" dataKey="bp" stroke="#ef4444" strokeWidth={4} fill="url(#colorBp)" />
                <Area type="monotone" dataKey="sugar" stroke="#3b82f6" strokeWidth={4} fill="url(#colorSugar)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-red-400"></div> {t.bloodPressure}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div> {t.sugarLevel}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.appointments}</h3>
            <button className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline">{t.viewAll}</button>
          </div>
          <div className="space-y-4">
            {myApps.slice(0, 4).map((app) => (
              <div key={app.id} className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center hover:scale-[1.01] transition-transform">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-blue-600 shadow-sm">
                    <UserRound className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{app.doctorName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{app.specialization}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  app.status === 'accepted' ? 'bg-green-100 text-green-600' : 
                  app.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                }`}>
                  {app.status}
                </div>
              </div>
            ))}
            {myApps.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center">
                <Calendar className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">{t.noAppointments}<br/>{t.scheduleFirst}</p>
                <button className="text-blue-600 font-black mt-4 text-[10px] uppercase tracking-widest">{t.bookNow}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-[400px]">
          <div className="relative z-10">
            <Sparkles className="w-12 h-12 mb-8 text-blue-200" />
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">{t.aiCare}</h3>
            <p className="text-blue-50 text-sm leading-relaxed mb-10 italic opacity-90">
              "{t.aiRecPatient}"
            </p>
          </div>
          <button onClick={() => window.location.href='/patient/chat'} className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-transform hover:scale-[1.02] z-10">
            {t.clinicalAiInteraction}
          </button>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-10">
           <div className="relative w-40 h-40 flex-shrink-0">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100 dark:text-slate-800" />
               <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={452} strokeDashoffset={452 * (1 - 0.88)} className="text-blue-600" strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
               <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">88%</span>
             </div>
           </div>
           <div className="flex-1">
             <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-4 uppercase tracking-tight">{t.recoveryProgress}</h4>
             <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium italic">{t.recoveryScoreImproved}</p>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t.weightDelta}</p>
                 <p className="text-sm font-black text-red-500">-0.2 KG</p>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t.activityTier}</p>
                 <p className="text-sm font-black text-blue-600">MODERATE</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
