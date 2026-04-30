import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { ShieldCheck, XCircle, FileText, CheckCircle } from 'lucide-react';

const Approvals = () => {
  const { doctors, approveDoctor, deleteDoctor } = useHealth();
  const pendingDoctors = doctors.filter(d => !d.isApproved);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Pending Approvals</h1>
        <p className="text-slate-500 mt-1">Verify credentials and approve doctor registrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingDoctors.map((doc) => (
          <div key={doc.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl">
                    {doc.name.charAt(4)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{doc.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{doc.specialty} • {doc.experience} Exp</p>
                  </div>
                </div>
                <div className="bg-orange-50 text-orange-600 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
                  Pending
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Qualification</p>
                  <p className="text-sm font-bold text-slate-700">{doc.qualification}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Hospital</p>
                  <p className="text-sm font-bold text-slate-700">{doc.hospital}</p>
                </div>
              </div>

              <button className="flex items-center gap-2 text-medical-600 font-bold text-sm mb-8 hover:underline">
                <FileText className="w-4 h-4" />
                View Specialization Proof.pdf
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  const result = await approveDoctor(doc.id);
                  if (!result.success) {
                    alert(result.message || 'Unable to approve doctor');
                  }
                }}
                className="flex-1 bg-medical-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-medical-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button 
                onClick={async () => {
                  const result = await deleteDoctor(doc.id);
                  if (!result.success) {
                    alert(result.message || 'Unable to reject doctor');
                  }
                }}
                className="px-6 border-2 border-slate-100 text-slate-400 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {pendingDoctors.length === 0 && (
          <div className="col-span-2 bg-white p-20 rounded-3xl text-center border-2 border-dashed border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg">All caught up! No pending approvals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
