import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { translations } from '../../utils/translations';
import { Calendar, Users, FileText, CheckCircle, XCircle, Clock, Video, Activity, Upload, User, Plus, X, MapPin, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';

const DoctorDashboard = () => {
  const { user, appointments, updateAppointmentStatus, scheduleAppointment, patients, addPatientReport, language } = useHealth();
  const t = translations[language] || translations.en;
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('Clinical');
  const [reportFile, setReportFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // New state for appointment scheduling modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [meetingType, setMeetingType] = useState('in-person');
  const [googleMeetLink, setGoogleMeetLink] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);
  
  const myAppointments = appointments.filter(a => a.doctorId === user.id);
  const pendingApps = myAppointments.filter(a => a.status === 'pending');
  
  const stats = [
    { label: t.appointments, value: myAppointments.length, icon: Calendar, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' },
    { label: t.pendingRequests, value: pendingApps.length, icon: Clock, color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' },
    { label: t.todayPatients, value: myAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length, icon: Users, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' },
  ];

  const handleUploadReport = async () => {
    if (!selectedPatient || !reportName.trim() || !reportFile) return;
    setUploading(true);

    const result = await addPatientReport(selectedPatient, {
      name: reportName,
      type: reportType,
      fileName: reportFile.name,
      fileType: reportFile.type,
      fileData: reportFile.data,
      date: new Date().toISOString().split('T')[0]
    });

    if (result.success) {
      setSelectedPatient('');
      setReportName('');
      setReportType('Clinical');
      setReportFile(null);
      alert('Report uploaded successfully!');
    } else {
      alert(result.message || 'Failed to upload report');
    }

    setUploading(false);
  };

  const handleFileChange = (event) => {
    const uploaded = event.target.files?.[0];
    if (!uploaded) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReportFile({
        name: uploaded.name,
        type: uploaded.type || 'application/octet-stream',
        data: reader.result
      });
    };
    reader.readAsDataURL(uploaded);
  };

  const handleScheduleAppointment = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (meetingType === 'google-meet' && !googleMeetLink) {
      alert('Please provide a Google Meet link for virtual meeting');
      return;
    }

    setScheduling(true);
    const result = await scheduleAppointment(selectedAppointment.id, {
      date: scheduleDate,
      time: scheduleTime,
      meetingType: meetingType,
      meetingLink: googleMeetLink || null,
      notes: doctorNotes,
    });

    if (result.success) {
      alert('Appointment scheduled successfully! Patient has been notified via email.');
      setSelectedAppointment(null);
      setScheduleDate('');
      setScheduleTime('');
      setMeetingType('in-person');
      setGoogleMeetLink('');
      setDoctorNotes('');
    } else {
      alert(result.message || 'Failed to schedule appointment');
    }
    setScheduling(false);
  };

  const getPatientDetails = (patientId) => {
    return patients.find(p => p.id === patientId);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.welcome}, Dr. {user?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">{language === 'kn' ? `ಇಂದು ನೀವು ${pendingApps.length} ಬಾಕಿ ಉಳಿದಿರುವ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ.` : `You have ${pendingApps.length} pending appointment requests today.`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 uppercase tracking-tight">Appointment Requests</h3>
          <div className="space-y-4">
            {pendingApps.map((app) => (
              <motion.div 
                key={app.id} 
                layout
                className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center transition-all hover:scale-[1.01] cursor-pointer group"
                onClick={() => setSelectedAppointment(app)}
              >
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-blue-600 shadow-sm group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    {app.patientName?.charAt(0) || 'P'}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{app.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{app.date} • {app.time}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{app.reason || 'General consultation'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(app);
                    }}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200/50 dark:shadow-none transition-all"
                    title="Schedule appointment"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAppointmentStatus(app.id, 'rejected');
                    }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                    title="Reject appointment"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
            {pendingApps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold text-xs uppercase tracking-widest">{language === 'kn' ? 'ಬಾಕಿ ಉಳಿದಿರುವ ವಿನಂತಿಗಳಿಲ್ಲ' : 'No pending requests'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 uppercase tracking-tight">Virtual Consultations</h3>
          <div className="space-y-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
              Schedule appointments with video consultations or in-person meetings. Send secure Google Meet links to your patients.
            </p>
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center text-center bg-slate-50/30 dark:bg-slate-800/20">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-200 dark:shadow-none">
                <Video className="w-10 h-10" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Video Consultation Ready</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Generate and share secure meeting links</p>
              <button 
                onClick={() => alert('Video consultation links can be added when scheduling appointments')}
                className="w-full max-w-xs bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all hover:scale-[1.05]"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Upload Section */}
      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <Upload className="text-blue-600 w-8 h-8" />
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Upload Patient Reports</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Select Patient</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white"
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Report Name</label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Blood Analysis Report"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white"
              >
                <option value="Clinical">Clinical</option>
                <option value="Radiology">Radiology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pathology">Pathology</option>
                <option value="Neurology">Neurology</option>
                <option value="Lab">Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Attach Report File</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-slate-700 dark:file:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3"
              />
              {reportFile && (
                <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">Attached: <span className="font-bold text-slate-700 dark:text-slate-200">{reportFile.name}</span></p>
              )}
            </div>

            <button
              onClick={handleUploadReport}
              disabled={!selectedPatient || !reportName.trim() || !reportFile || uploading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Upload Report
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800/30 rounded-3xl">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h4 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">Secure Report Sharing</h4>
            <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">
              Upload medical reports that will be securely stored and made available to your patients in their reports section.
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Scheduling Modal */}
      {selectedAppointment && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-[#1E293B] max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Schedule Appointment</h2>
                <p className="text-blue-100 text-sm font-medium mt-1">Set date, time, and meeting type for patient</p>
              </div>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-blue-500 rounded-xl transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8">
              {/* Patient Info */}
              {getPatientDetails(selectedAppointment.patientId) && (
                <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Name</p>
                        <p className="text-slate-900 dark:text-white font-bold">{selectedAppointment.patientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Email</p>
                        <p className="text-slate-900 dark:text-white font-bold text-sm break-all">{getPatientDetails(selectedAppointment.patientId)?.email}</p>
                      </div>
                    </div>
                    {getPatientDetails(selectedAppointment.patientId)?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Phone</p>
                          <p className="text-slate-900 dark:text-white font-bold">{getPatientDetails(selectedAppointment.patientId)?.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.reason && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Reason</p>
                          <p className="text-slate-900 dark:text-white font-bold">{selectedAppointment.reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Appointment Date *</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Appointment Time *</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white"
                  />
                </div>
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-3 tracking-widest">Meeting Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setMeetingType('in-person');
                      setGoogleMeetLink('');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm uppercase tracking-tight flex items-center justify-center gap-2 ${
                      meetingType === 'in-person'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    In-Person
                  </button>
                  <button
                    onClick={() => setMeetingType('google-meet')}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm uppercase tracking-tight flex items-center justify-center gap-2 ${
                      meetingType === 'google-meet'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Google Meet
                  </button>
                </div>
              </div>

              {/* Google Meet Link - Conditional */}
              {meetingType === 'google-meet' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Google Meet Link *</label>
                  <input
                    type="url"
                    value={googleMeetLink}
                    onChange={(e) => setGoogleMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white"
                  />
                </motion.div>
              )}

              {/* Doctor Notes */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-widest">Additional Notes (Optional)</label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Add any notes for the patient about the appointment..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleAppointment}
                disabled={scheduling || !scheduleDate || !scheduleTime}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
              >
                {scheduling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Schedule Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DoctorDashboard;
