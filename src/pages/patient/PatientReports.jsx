import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { translations } from '../../utils/translations';
import { FileText, Download, Eye, Calendar, Microscope, ShieldCheck, User, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';
import AIReportAnalysis from '../../components/AIReportAnalysis';

const PatientReports = () => {
  const { user, getPatientReports, language } = useHealth();
  const t = translations[language] || translations.en;
  const [expandedReportId, setExpandedReportId] = useState(null);
  
  const reports = getPatientReports(user?.id);

  const handleReportDownload = (report) => {
    if (!report?.fileData) return;

    const link = document.createElement('a');
    link.href = report.fileData;
    link.download = report.fileName || `${report.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReportView = (report) => {
    if (!report?.fileData) return;
    window.open(report.fileData, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.reports}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Secure access to your medical diagnostic history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.map((report, index) => (
          <div key={report.id}>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
            >
              <div className="flex gap-6 items-center flex-1">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{report.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                      <Microscope className="w-3 h-3" /> {report.type}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                      <Calendar className="w-3 h-3" /> {new Date(report.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                      <User className="w-3 h-3" /> {report.uploadedByName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                      <ShieldCheck className="w-3 h-3" /> {report.status}
                    </div>
                    {report.fileName && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                        <span className="truncate max-w-[10rem]">{report.fileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReportView(report)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleReportDownload(report)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center"
                >
                  {expandedReportId === report.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* AI Analysis Expansion */}
            {expandedReportId === report.id && (
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
        ))}

        {reports.length === 0 && (
          <div className="bg-white dark:bg-[#1E293B] p-12 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-200 mx-auto">
              <FileText className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No reports available</h2>
            <p className="text-slate-400 font-medium italic max-w-xs mx-auto">Your medical reports will appear here once they are verified by our clinical specialists.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientReports;
