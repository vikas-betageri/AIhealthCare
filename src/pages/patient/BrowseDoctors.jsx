import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { Search, Star, Clock, MapPin, Sparkles, Filter, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BrowseDoctors = () => {
  const { doctors, addAppointment, user } = useHealth();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const specializations = ['All', ...new Set(doctors.filter(d => d.isApproved).map(d => d.specialty))];

  const filteredDoctors = doctors.filter(d => 
    d.isApproved && 
    (filter === 'All' || d.specialty === filter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.hospital.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBook = async (doc) => {
    const app = {
      doctorId: doc.id,
      doctorName: doc.name,
      patientId: user.id,
      patientName: user.name,
      specialty: doc.specialty,
      date: new Date().toISOString().split('T')[0],
      time: '11:00 AM',
    };

    const result = await addAppointment(app);
    if (!result.success) {
      alert(result.message || 'Appointment request failed.');
      return;
    }

    setSelectedDoc(null);
    alert('Appointment requested successfully!');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Find Specialists</h1>
          <p className="text-slate-500 mt-1">Book consultations with top-rated medical experts</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search name or hospital..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-medical-500 outline-none shadow-sm"
            />
          </div>
          <div className="bg-white p-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm relative group cursor-pointer">
            <Filter className="w-5 h-5" />
            <div className="absolute top-14 right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl hidden group-hover:block z-30 p-2 overflow-hidden">
               {specializations.map((s, idx) => (
                 <button key={`filter-btn-${s}-${idx}`} onClick={(e) => { e.stopPropagation(); setFilter(s); }} className={`w-full text-left px-4 py-2 hover:bg-medical-50 hover:text-medical-600 rounded-xl text-sm font-bold ${filter === s ? 'text-medical-600 bg-medical-50' : 'text-slate-500'}`}>
                   {s}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {specializations.map((s, idx) => (
          <button
            key={`scroll-filter-${s}-${idx}`}
            onClick={() => setFilter(s)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              filter === s ? 'medical-gradient text-white shadow-lg shadow-medical-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-medical-500'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode='popLayout'>
          {filteredDoctors.map((doc) => (
            <motion.div
              layout
              key={doc.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl medical-gradient text-white flex items-center justify-center font-black text-2xl shadow-lg border-4 border-white">
                  {doc.name.charAt(4)}
                </div>
                <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-black">{doc.rating || '4.5'}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-medical-600 transition-colors">{doc.name}</h3>
              <p className="text-sm font-bold text-medical-600 bg-medical-50 w-fit px-3 py-1 rounded-lg mb-6">{doc.specialty}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {doc.timing}
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {doc.hospital}
                </div>
              </div>

              <button className="w-full py-4 rounded-2xl border-2 border-medical-50 text-medical-600 font-bold group-hover:medical-gradient group-hover:text-white group-hover:border-transparent transition-all shadow-medical-200">
                Book Consultation
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal - Simulated */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-10">
              <div className="flex gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl medical-gradient flex items-center justify-center font-black text-4xl text-white">
                  {selectedDoc.name.charAt(4)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedDoc.name}</h2>
                  <p className="text-medical-600 font-bold">{selectedDoc.specialty}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-slate-400 font-bold italic">{selectedDoc.qualification}</span>
                    <span className="text-xs text-slate-400 font-bold italic">{selectedDoc.experience} Experience</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Consultation Fee</p>
                  <p className="text-lg font-black text-slate-800">${selectedDoc.fees}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Working Hours</p>
                  <p className="text-sm font-bold text-slate-800">{selectedDoc.timing}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setSelectedDoc(null)} className="flex-1 py-4 font-bold text-slate-400 bg-slate-50 rounded-2xl">Cancel</button>
                <button onClick={() => handleBook(selectedDoc)} className="flex-[2] medical-gradient text-white font-bold rounded-2xl shadow-xl shadow-medical-200">Confirm Booking</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BrowseDoctors;
