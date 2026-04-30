import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Clipboard } from 'lucide-react';
import { analyzeMedicalImage } from '../../utils/aiEngine';
import { useHealth } from '../../context/HealthContext';
import { translations } from '../../utils/translations';
import { motion } from 'motion/react';

const DoctorAIAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [reportText, setReportText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [type, setType] = useState('report');
  const { language } = useHealth();
  const t = translations[language] || translations.en;

  const handleUpload = () => {
    if (!file && !reportText.trim()) return;
    setAnalyzing(true);

    setTimeout(async () => {
      try {
        const analysisResult = await analyzeMedicalImage(type, language, reportText);
        setResult(analysisResult);
      } catch (error) {
        console.error('[DoctorAIAnalyzer] AI analysis failed:', error);
      } finally {
        setAnalyzing(false);
      }
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 dark:text-white">
          <Sparkles className="text-medical-500 w-8 h-8" />
          {t.aiAssistant}
        </h1>
        <p className="text-slate-500 mt-1 dark:text-slate-400">Upload reports, scans, or prescriptions for instant AI-powered insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-2xl border border-slate-100 dark:border-slate-800 card-shadow">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6 tracking-tight">{t.uploadDocument}</h3>
            
            <div className="space-y-4 mb-6">
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

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Paste Report Text / Findings</label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Enter report description, findings or prescription details here..."
                className="w-full min-h-[160px] rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
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
              disabled={(!file && !reportText.trim()) || analyzing}
              className="w-full mt-6 medical-gradient text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-medical-200"
            >
              {analyzing ? t.analyzing : t.runAnalysis}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {analyzing ? (
            <div className="bg-white dark:bg-[#1E293B] p-20 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-medical-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse italic">Decoding medical data using simulated AI engine...</p>
            </div>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-medical-500 text-white rounded-bl-3xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <FileText className="text-medical-600 w-5 h-5" />
                  {t.analysisResult}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">{t.detailsExtracted}</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{result.details}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-medical-50 dark:bg-medical-900/10">
                    <p className="text-[10px] text-medical-600 dark:text-medical-400 uppercase font-black mb-1">{t.possibleCondition}</p>
                    <p className="text-sm font-bold text-medical-900 dark:text-white leading-relaxed">{result.disease}</p>
                  </div>
                </div>

                <div className="mt-6 p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Clipboard className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest font-black">{t.recommendations}</p>
                  </div>
                  <div className="space-y-4">
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

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                  <button className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                    Download PDF
                  </button>
                  <button className="flex-1 medical-gradient text-white py-3 rounded-xl font-bold text-sm">
                    Add to Patient History
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-[#1E293B] p-20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <Upload className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
              <h4 className="text-xl font-bold text-slate-400 dark:text-white mb-2">{t.noDocument}</h4>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm">Please upload a medical document on the left panel to start the AI analysis session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAIAnalyzer;
