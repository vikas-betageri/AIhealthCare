import React, { useEffect, useMemo, useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { Calendar, FileText, HeartPulse, Users, ArrowLeft, Plus, Thermometer, Droplet, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';
import AIReportAnalysis from '../../components/AIReportAnalysis';

const DoctorPatients = () => {
  const { patients, appointments, user, updatePatient, language } = useHealth();
  const [selectedPatientId, setSelectedPatientId] = useState(patients?.[0]?.id || '');
  const [vitals, setVitals] = useState({ bp: '', sugar: '', weight: '' });
  const [expandedReportId, setExpandedReportId] = useState(null);

  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const patient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId]
  );

  useEffect(() => {
    if (patient) {
      setVitals({
        bp: patient.vitals?.bp || '',
        sugar: patient.vitals?.sugar || '',
        weight: patient.vitals?.weight || '',
      });
    }
  }, [patient]);

  const patientAppointments = useMemo(
    () => appointments.filter((app) => app.patientId === selectedPatientId),
    [appointments, selectedPatientId]
  );

  const patientReports = useMemo(
    () => patient?.reports || [],
    [patient]
  );

  const handleSaveVitals = () => {
    if (!patient) return;
    updatePatient(patient.id, { vitals });
    alert('Patient vitals updated successfully.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Patient Records</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">View appointments, reports and vital history for every patient.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Your Patients</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Select a patient to review their history and update health metrics.</p>
            </div>
            <Users className="w-6 h-6 text-blue-600" />
          </div>

          <div className="space-y-3">
            {patients.map((patientItem) => (
              <button
                key={patientItem.id}
                onClick={() => setSelectedPatientId(patientItem.id)}
                className={`w-full text-left p-4 rounded-3xl transition-colors border ${patientItem.id === selectedPatientId ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-blue-200 hover:bg-blue-50/40'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{patientItem.name}</p>
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{patientItem.email}</p>
                  </div>
                  <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{patientItem.vitals?.bp || 'No BP'}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {!patient ? (
            <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
              <p className="text-slate-500 dark:text-slate-400">No patient selected or no patients are available.</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Patient Profile</p>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4">{patient.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{patient.email}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-3xl text-center">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Appointments</p>
                      <p className="font-black text-slate-900 dark:text-white text-xl mt-2">{patientAppointments.length}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-3xl text-center">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Reports</p>
                      <p className="font-black text-slate-900 dark:text-white text-xl mt-2">{patientReports.length}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-3xl text-center">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">BP</p>
                      <p className="font-black text-slate-900 dark:text-white text-xl mt-2">{patient.vitals?.bp || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 mt-8">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <HeartPulse className="w-5 h-5 text-blue-600" />
                      <p className="font-bold uppercase tracking-widest text-slate-500">Health Metrics</p>
                    </div>
                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                      <p><strong>BP:</strong> {patient.vitals?.bp || 'Not recorded'}</p>
                      <p><strong>Sugar:</strong> {patient.vitals?.sugar || 'Not recorded'}</p>
                      <p><strong>Weight:</strong> {patient.vitals?.weight || 'Not recorded'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                      <p className="font-bold uppercase tracking-widest text-slate-500">Latest Appointment</p>
                    </div>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{patientAppointments[0] ? `${patientAppointments[0].date} • ${patientAppointments[0].time}` : 'No appointments found'}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                      <p className="font-bold uppercase tracking-widest text-slate-500">Recent Report</p>
                    </div>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{patientReports[0]?.name || 'No reports uploaded yet'}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Appointment History</h3>
                  </div>
                  <div className="space-y-4">
                    {patientAppointments.length > 0 ? (
                      patientAppointments.map((app) => (
                        <div key={app.id} className="border border-slate-200 dark:border-slate-800 rounded-3xl p-4 bg-slate-50 dark:bg-slate-900/60">
                          <p className="font-bold text-slate-900 dark:text-white">{app.date} • {app.time}</p>
                          <p className="text-[12px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2">{app.status || 'Status unknown'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">{app.reason || 'General consultation'}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400">No appointment history available.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Thermometer className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Update Vitals</h3>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Blood Pressure</label>
                    <input
                      value={vitals.bp}
                      onChange={(e) => setVitals(prev => ({ ...prev, bp: e.target.value }))}
                      placeholder="120/80"
                      className="w-full px-4 py-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                    />
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Sugar Level</label>
                    <input
                      value={vitals.sugar}
                      onChange={(e) => setVitals(prev => ({ ...prev, sugar: e.target.value }))}
                      placeholder="95 mg/dL"
                      className="w-full px-4 py-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                    />
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Weight</label>
                    <input
                      value={vitals.weight}
                      onChange={(e) => setVitals(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="70 kg"
                      className="w-full px-4 py-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={handleSaveVitals}
                      className="w-full bg-blue-600 text-white py-3 rounded-3xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                      Save Metrics
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Medical Reports</h3>
                </div>
                <div className="space-y-4">
                  {patientReports.length > 0 ? (
                    patientReports.map((report) => (
                      <div key={report.id || report.name}>
                        <motion.div
                          className="border border-slate-200 dark:border-slate-800 rounded-3xl p-4 bg-slate-50 dark:bg-slate-900/60 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                          onClick={() => setExpandedReportId(expandedReportId === (report.id || report.name) ? null : (report.id || report.name))}
                          layout
                        >
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 dark:text-white">{report.name}</p>
                            <p className="text-[12px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2">{report.type || report.reportType || 'Report'}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Uploaded on {report.date || report.uploadedAt || 'Unknown date'}</p>
                          </div>
                          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            {expandedReportId === (report.id || report.name) ? (
                              <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            )}
                          </button>
                        </motion.div>

                        {/* AI Analysis Expansion */}
                        {expandedReportId === (report.id || report.name) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                          >
                            <AIReportAnalysis report={report} language={language} />
                          </motion.div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No reports have been uploaded for this patient yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;
