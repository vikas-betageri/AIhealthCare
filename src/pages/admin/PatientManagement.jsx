import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { Users, User, Mail, Calendar, Trash2 } from 'lucide-react';

const PatientManagement = () => {
  const { patients } = useHealth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Patient Directory</h1>
        <p className="text-slate-500 mt-1">Manage and view all registered patients in the system</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Name</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">History</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patients.map((pat) => (
              <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-medical-50 text-medical-600 flex items-center justify-center font-bold">
                      {pat.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{pat.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500 font-medium">{pat.email}</td>
                <td className="px-8 py-5 text-sm font-bold text-slate-700">{pat.reports?.length || 0} Files</td>
                <td className="px-8 py-5">
                   <div className="bg-slate-50 px-3 py-1 rounded-lg text-[10px] w-fit font-black uppercase text-slate-500">
                     {pat.history?.length || 0} Visits
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && <p className="p-20 text-center text-slate-400">No patients registered.</p>}
      </div>
    </div>
  );
};

export default PatientManagement;
