import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { UserRound, Trash2, Edit2, Star, CheckCircle } from 'lucide-react';

const DoctorManagement = () => {
  const { doctors, deleteDoctor } = useHealth();
  const approvedDoctors = doctors.filter(d => d.isApproved);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manage Doctors</h1>
          <p className="text-slate-500 mt-1">View, edit, or remove registered medical practitioners</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-bottom border-slate-100 bg-slate-50/50">
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor Info</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Specialization</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {approvedDoctors.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {doc.name.charAt(4)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    {doc.specialty}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">{doc.rating}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-slate-600">
                  {doc.hospital}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { if(window.confirm('Are you sure?')) deleteDoctor(doc.id); }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {approvedDoctors.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-medium font-bold text-lg">
            No doctors found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorManagement;
