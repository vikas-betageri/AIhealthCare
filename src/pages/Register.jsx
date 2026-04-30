import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useHealth } from '../context/HealthContext';
import { translations } from '../utils/translations';
import { Activity, User, Mail, Lock, Phone, MapPin, Briefcase, ShieldCheck, Globe, Moon, Sun, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', gender: '', dateOfBirth: '', 
    specialty: '', experience: '', bio: '', licenseNumber: '', qualifications: '', 
    hospital: '', consultationFee: '', startTime: '09:00', endTime: '17:00'
  });
  const { registerPatient, registerDoctor, language, setLanguage, theme, setTheme } = useHealth();
  const navigate = useNavigate();
  const t = translations[language] || translations.en;

  const images = {
    patient: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop",
    doctor: "https://images.unsplash.com/photo-1631217818202-90ef49742c58?q=80&w=2023&auto=format&fit=crop"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (role === 'patient') {
      result = await registerPatient(formData);
    } else {
      result = await registerDoctor(formData);
    }

    if (!result?.success) {
      alert(result?.message || 'Registration failed. Please try again.');
      return;
    }

    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          key={role}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={images[role] || images.patient} 
          alt="medical background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-16 text-white z-10">
          <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter">Join the Medical<br/>Revolution</h1>
          <p className="text-xl text-blue-100 font-medium max-w-lg opacity-80 italic">Be part of an ecosystem that prioritizes clinical intelligence and patient safety through advanced AI-driven coordination.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-[#0F172A]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-xl bg-white dark:bg-[#1E293B] p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 my-8 overflow-y-auto max-h-[90vh]"
        >
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-2xl text-slate-800 dark:text-white uppercase tracking-tighter">MediCore AI</span>
            </Link>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.register}</h2>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl mb-8">
            {['patient', 'doctor'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                  role === r ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.fullName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text" name="name" required placeholder="John Doe"
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email" name="email" required placeholder="john@example.com"
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password" name="password" required placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text" name="phone" required placeholder="+1 (555) 000-0000"
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select
                    name="gender" required
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="date" name="dateOfBirth" required
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>

            {role === 'doctor' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Specialization</label>
                    <input
                      type="text" name="specialty" required placeholder="Cardiology"
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">License Number</label>
                    <input
                      type="text" name="licenseNumber" required placeholder="MD123456"
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Years of Experience</label>
                    <input
                      type="number" name="experience" required placeholder="10"
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Consultation Fee ($)</label>
                    <input
                      type="number" name="consultationFee" required placeholder="150"
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hospital/Clinic Name</label>
                  <input
                    type="text" name="hospital" required placeholder="City General Hospital"
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Qualifications (comma separated)</label>
                  <input
                    type="text" name="qualifications" required placeholder="MD, Board Certified Cardiologist"
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Time</label>
                    <input
                      type="time" name="startTime" required
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Time</label>
                    <input
                      type="time" name="endTime" required
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Bio</label>
                  <textarea
                    name="bio" required rows="3" placeholder="Tell us about your medical background and expertise..."
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  ></textarea>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all transform hover:scale-[1.01] mt-4"
            >
              {t.register}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 dark:text-slate-400 font-bold text-xs">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-black hover:underline uppercase tracking-widest">{t.login}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
