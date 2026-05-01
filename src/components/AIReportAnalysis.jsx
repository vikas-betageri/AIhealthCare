import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, CheckCircle2, AlertCircle, Lightbulb, Pill } from 'lucide-react';
import { analyzeMedicalImage, speakText, stopSpeaking } from '../utils/aiEngine';
import { motion } from 'motion/react';

const AIReportAnalysis = ({ report, language = 'en' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!report) {
    return null;
  }

  // Determine report type
  const reportType = report.type?.toLowerCase().replace(/\s+/g, '_') || 
                     report.reportType?.toLowerCase().replace(/\s+/g, '_') || 
                     'report';
  
  let displayType = 'report';
  if (reportType.includes('medicine') || reportType.includes('drug')) {
    displayType = 'medicine';
  } else if (reportType.includes('prescription')) {
    displayType = 'prescription';
  }

  const reportText = [
    report.title,
    report.description,
    report.findings,
    report.recommendations,
    report.testResults?.testName,
    report.testResults?.patientValue,
    report.testResults?.normalRange,
    report.testResults?.unit,
  ]
    .filter(Boolean)
    .join('\n\n');

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    analyzeMedicalImage(displayType, language, reportText)
      .then((data) => {
        if (active) setAnalysis(data);
      })
      .catch((error) => {
        console.warn('[AIReportAnalysis] AI analysis failed:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [displayType, language]);

  if (loading || !analysis) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        Loading AI analysis...
      </div>
    );
  }

  const listToText = (items) => {
    if (!items) return '';
    if (Array.isArray(items)) return items.join('. ');
    return String(items);
  };

  const handleSpeak = () => {
    if (!analysis) return;

    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const textToSpeak = [
        analysis.summary,
        listToText(analysis.keyObservations),
        listToText(analysis.abnormalFindings),
        listToText(analysis.possibleIndications),
        listToText(analysis.recommendations),
        analysis.riskLevel ? `Risk level: ${analysis.riskLevel}` : '',
        analysis.emergencyWarning ? `Emergency warning: ${analysis.emergencyWarning}` : ''
      ]
        .filter(Boolean)
        .join('. ');

      speakText(textToSpeak, language);
      setIsSpeaking(true);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;

    const textToCopy = `Summary: ${analysis.summary || 'N/A'}

Key Observations: ${listToText(analysis.keyObservations) || 'N/A'}

Abnormal Findings: ${listToText(analysis.abnormalFindings) || 'N/A'}

Possible Indications: ${listToText(analysis.possibleIndications) || 'N/A'}

Risk Level: ${analysis.riskLevel || 'N/A'}

Recommendations: ${listToText(analysis.recommendations) || 'N/A'}

Emergency Warning: ${analysis.emergencyWarning || 'None'}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800/50 rounded-[3rem] p-8 shadow-lg overflow-hidden"
    >
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b-2 border-blue-200 dark:border-blue-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{analysis.title}</h3>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">AI-Powered Analysis</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSpeak}
            className={`px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${
              isSpeaking
                ? 'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-none'
                : 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                Stop Audio
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Listen
              </>
            )}
          </button>
          <button
            onClick={handleCopy}
            className={`px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Disease/Condition */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-l-4 border-blue-600">
          <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Identified Condition</h4>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{analysis.disease}</p>
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-l-4 border-indigo-600">
          <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Analysis Details</h4>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{analysis.details}</p>
        </div>

        {/* Lab Values - if present */}
        {analysis.lab_values && analysis.lab_values.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-l-4 border-cyan-600">
            <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">📊 Extracted Lab Values & Interpretation</h4>
            <div className="grid gap-4">
              {analysis.lab_values.map((lab, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border-l-4 ${
                    lab.status === 'Normal' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                      : lab.status === 'Borderline'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{lab.parameter}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Value: <span className="font-bold">{lab.value} {lab.unit}</span>
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      lab.status === 'Normal' 
                        ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : lab.status === 'Borderline'
                        ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {lab.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    <p><span className="font-semibold">Normal Range:</span> {lab.normal_range}</p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-3 mb-2">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-900 dark:text-white">What it means:</span> {lab.explanation}
                    </p>
                  </div>
                  
                  {lab.interpretation && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 italic">
                      <span className="font-semibold">Interpretation:</span> {lab.interpretation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-l-4 border-green-600">
          <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Solution</h4>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{analysis.solution}</p>
        </div>

        {/* Home Remedy */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Home Remedies</h4>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{analysis.homeRemedy}</p>
        </div>

        {/* Medicines */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-l-4 border-purple-600">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-5 h-5 text-purple-600" />
            <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recommended Medicines</h4>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm font-medium">{analysis.medicine}</p>
        </div>

        {/* Precautions */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-6 border-l-4 border-red-600">
          <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">⚠️ Important Precautions</h4>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{analysis.precautions}</p>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border-l-4 border-blue-600">
          <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">📋 Next Steps</h4>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{analysis.steps}</p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t-2 border-blue-200 dark:border-blue-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          ℹ️ This is AI-powered analysis for informational purposes only. Always consult with a qualified healthcare professional for medical diagnosis and treatment decisions.
        </p>
      </div>
    </motion.div>
  );
};

export default AIReportAnalysis;
