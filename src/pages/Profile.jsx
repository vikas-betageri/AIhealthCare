import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { translations } from '../utils/translations';
import { User, Mail, ShieldAlert, Trash2, Smartphone, CheckCircle2, AlertTriangle, Send, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Profile = () => {
  const { user, userType, deleteAccount, language, sendTestEmail, updatePassword } = useHealth();
  const t = translations[language] || translations.en;
  const [showConfirm, setShowConfirm] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'sending', 'success', 'error', 'demo'
  
  // Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleDelete = () => {
    deleteAccount();
  };

  const handleTestEmail = async () => {
    setTestStatus('sending');
    const result = await sendTestEmail();
    if (result.success) {
      setTestStatus('success');
    } else if (result.isDemo) {
      setTestStatus('demo');
    } else {
      setTestStatus('error');
    }
    
    setTimeout(() => setTestStatus(null), 5000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (passForm.current !== user.password) {
      setPassError('Current password is incorrect');
      return;
    }

    if (passForm.new.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }

    if (passForm.new !== passForm.confirm) {
      setPassError('Passwords do not match');
      return;
    }

    const { success } = updatePassword(passForm.new);
    if (success) {
      setPassSuccess(true);
      setPassForm({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setPassSuccess(false);
        setShowPasswordForm(false);
      }, 3000);
    }
  };

  const getRoleBadge = () => {
    switch (userType) {
      case 'admin': return 'System Administrator';
      case 'doctor': return 'Medical Specialist';
      case 'patient': return 'Registered Patient';
      default: return 'User';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Manage your healthcare profile and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10">
            <div className="flex items-center gap-8 mb-10">
              <div className="w-24 h-24 bg-medical-50 dark:bg-medical-900/20 rounded-[2rem] flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
                <User className="w-10 h-10 text-medical-600" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-medical-600 bg-medical-50 dark:bg-medical-900/20 px-4 py-1.5 rounded-full mb-3 inline-block">
                  {getRoleBadge()}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.name}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.email}</span>
                </div>
              </div>

              {user?.phone && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Security</h3>
              <button 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-xs font-black text-medical-600 uppercase tracking-widest hover:underline"
              >
                {showPasswordForm ? 'Cancel Update' : 'Change Password'}
              </button>
            </div>

            {!showPasswordForm ? (
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium italic text-sm">
                <Lock className="w-4 h-4 text-slate-300" />
                Password was last set during account creation.
              </div>
            ) : (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handlePasswordChange}
                className="space-y-6 overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type={showPass ? "text" : "password"} 
                      placeholder="Current Password" 
                      required
                      value={passForm.current}
                      onChange={(e) => setPassForm({...passForm, current: e.target.value})}
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-medical-500 outline-none text-sm transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-medical-600 transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        required
                        value={passForm.new}
                        onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-medical-500 outline-none text-sm transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        placeholder="Confirm New" 
                        required
                        value={passForm.confirm}
                        onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-medical-500 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {passError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 italic">
                    Error: {passError}
                  </div>
                )}

                {passSuccess && (
                  <div className="p-4 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 italic">
                    Password successfully updated!
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                  Confirm Password Update
                </button>
              </motion.form>
            )}
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Notification System</h3>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${testStatus === 'demo' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                {testStatus === 'demo' ? 'Simulation Mode' : 'Live Mode'}
              </div>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium italic">
              Verify your notification settings. Ensure your email provider allows MediCore to send alerts about appointments and critical health tasks.
            </p>

            <button 
              onClick={handleTestEmail}
              disabled={testStatus === 'sending'}
              className="flex items-center gap-3 bg-medical-50 dark:bg-medical-900/10 text-medical-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-medical-100 transition-all border border-medical-100 dark:border-medical-900/20 disabled:opacity-50"
            >
              {testStatus === 'sending' ? (
                <>... Sending Request</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Push Test Notification
                </>
              )}
            </button>

            <AnimatePresence>
              {testStatus === 'demo' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 border border-amber-100 dark:border-amber-900/20 bg-amber-50/30 dark:bg-amber-900/10 rounded-2xl flex gap-4"
                >
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-600 uppercase tracking-tight mb-1">Service Not Configured</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium italic">
                      Live emails are disabled because credentials (EMAIL_USER/PASS) are not set in the environment. System is running in Simulation Mode (check console for logs).
                    </p>
                  </div>
                </motion.div>
              )}
              {testStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 border border-green-100 bg-green-50/30 rounded-2xl flex gap-4"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-black text-green-600 uppercase tracking-tight mb-1">Email Delivered</p>
                    <p className="text-[11px] text-green-700 leading-relaxed font-medium italic">
                      The test notification was successfully pushed to your inbox.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Danger Zone</h3>
            
            <AnimatePresence mode="wait">
              {!showConfirm ? (
                <motion.button
                  key="delete-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowConfirm(true)}
                  className="w-full bg-white dark:bg-slate-800 text-red-600 border-2 border-red-100 dark:border-red-900/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </motion.button>
              ) : (
                <motion.div
                  key="confirm-box"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <p className="text-[9px] text-red-600 font-black uppercase tracking-widest text-center leading-relaxed">
                      Confirm total account deletion. All data will be purged.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowConfirm(false)}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-600 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="bg-red-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 dark:shadow-none"
                    >
                      Purge
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
           </div>

           <div className="bg-medical-600 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-xl">
             <div className="relative z-10">
               <ShieldAlert className="w-8 h-8 text-blue-200 mb-4" />
               <h3 className="text-lg font-black uppercase tracking-tight mb-2">Privacy Lock</h3>
               <p className="text-xs text-blue-100 leading-relaxed opacity-80 mb-6 font-medium italic">
                 MediCore Intelligence maintains the highest standards of HIPAA-compliant data security.
               </p>
               <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                 Privacy Policy
               </button>
             </div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

