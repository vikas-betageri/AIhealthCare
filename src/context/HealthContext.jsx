import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DOCTORS, INITIAL_PATIENTS, INITIAL_ADMIN } from '../utils/mockData';

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin', 'doctor', 'patient'
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('hc_user');
      const savedType = localStorage.getItem('hc_userType');
      const savedDocs = localStorage.getItem('hc_doctors');
      const savedPats = localStorage.getItem('hc_patients');
      const savedApps = localStorage.getItem('hc_appointments');
      const savedTheme = localStorage.getItem('hc_theme') || 'light';
      const savedLang = localStorage.getItem('hc_lang') || 'en';

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedType) setUserType(savedType);
      
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setTheme('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setTheme('light');
      }

      setLanguage(savedLang);
      
      setDoctors(savedDocs ? JSON.parse(savedDocs) : INITIAL_DOCTORS);
      setPatients(savedPats ? JSON.parse(savedPats) : INITIAL_PATIENTS);
      setAppointments(savedApps ? JSON.parse(savedApps) : []);
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      // Fallback to defaults
      setDoctors(INITIAL_DOCTORS);
      setPatients(INITIAL_PATIENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const mapBackendPatient = (patient) => ({
    ...patient,
    id: patient.id || patient._id || patient._doc?._id,
    name: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
  });

  const mapBackendDoctor = (doctor) => ({
    ...doctor,
    id: doctor.id || doctor._id || doctor._doc?._id,
    name: doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
    specialty: doctor.specialty || doctor.specialization,
    experience: doctor.experience || doctor.yearsOfExperience,
    fees: doctor.fees || doctor.consultationFee,
    qualification: doctor.qualification || (doctor.qualifications ? doctor.qualifications.join(', ') : ''),
    timing: doctor.timing || (doctor.availableHours ? `${doctor.availableHours.startTime} - ${doctor.availableHours.endTime}` : ''),
  });

  const normalizeRefId = (ref) => {
    if (!ref) return '';
    if (typeof ref === 'string') return ref;
    return ref.id || ref._id || ref._doc?._id || '';
  };

  const mapBackendAppointment = (appointment) => ({
    ...appointment,
    id: appointment.id || appointment._id || appointment._doc?._id,
    patientId: normalizeRefId(appointment.patientId),
    doctorId: normalizeRefId(appointment.doctorId),
    date: appointment.date || appointment.appointmentDate?.split('T')[0] || '',
    time: appointment.time || appointment.timeSlot || '',
    patientName: appointment.patientName || appointment.patientId?.name || `${appointment.patientId?.firstName || ''} ${appointment.patientId?.lastName || ''}`.trim(),
    doctorName: appointment.doctorName || appointment.doctorId?.name || `${appointment.doctorId?.firstName || ''} ${appointment.doctorId?.lastName || ''}`.trim(),
  });

  const loadBackendData = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/doctors'),
        fetch('/api/appointments'),
      ]);

      if (!patientsRes.ok || !doctorsRes.ok || !appointmentsRes.ok) {
        throw new Error('Backend data fetch failed');
      }

      const [patientsJson, doctorsJson, appointmentsJson] = await Promise.all([
        patientsRes.json(),
        doctorsRes.json(),
        appointmentsRes.json(),
      ]);

      if (patientsJson.success) setPatients(patientsJson.data.map(mapBackendPatient));
      if (doctorsJson.success) setDoctors(doctorsJson.data.map(mapBackendDoctor));
      if (appointmentsJson.success) setAppointments(appointmentsJson.data.map(mapBackendAppointment));
    } catch (error) {
      console.warn('[HealthContext] Backend load fallback:', error.message);
    }
  };

  useEffect(() => {
    if (!loading) {
      loadBackendData();
    }
  }, [loading]);

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hc_theme', theme);
  }, [theme]);

  // Language effect
  useEffect(() => {
    localStorage.setItem('hc_lang', language);
  }, [language]);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hc_doctors', JSON.stringify(doctors));
      localStorage.setItem('hc_patients', JSON.stringify(patients));
      localStorage.setItem('hc_appointments', JSON.stringify(appointments));
    }
  }, [doctors, patients, appointments, loading]);

  const normalizeUser = (rawUser, type) => {
    const base = {
      ...rawUser,
      id: rawUser.id || rawUser._id || rawUser._doc?._id,
      name: rawUser.name || `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim(),
    };

    if (type === 'doctor') {
      return mapBackendDoctor(base);
    }
    if (type === 'patient') {
      return mapBackendPatient(base);
    }
    return base;
  };

  const login = async (email, password, type) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type }),
      });
      const result = await response.json();

      if (result.success) {
        const backendUser = result.data;

        if (type === 'doctor' && backendUser.isApproved === false) {
          return { success: false, message: 'Your account is pending admin approval. You will be able to login once approved.' };
        }

        const normalizedUser = normalizeUser(backendUser, type);

        setUser(normalizedUser);
        setUserType(type);
        localStorage.setItem('hc_user', JSON.stringify(normalizedUser));
        localStorage.setItem('hc_userType', type);

        if (type === 'patient') {
          setPatients(prev => {
            if (!prev.find(p => p.email === normalizedUser.email)) {
              return [...prev, normalizedUser];
            }
            return prev;
          });
        }
        if (type === 'doctor') {
          setDoctors(prev => {
            if (!prev.find(d => d.email === normalizedUser.email)) {
              return [...prev, normalizedUser];
            }
            return prev;
          });
        }

        return { success: true };
      }

      if (type === 'admin') {
        if (email === INITIAL_ADMIN.email && password === INITIAL_ADMIN.password) {
          const adminUser = { email, name: 'System Admin' };
          setUser(adminUser);
          setUserType('admin');
          localStorage.setItem('hc_user', JSON.stringify(adminUser));
          localStorage.setItem('hc_userType', 'admin');
          return { success: true };
        }
      }

      return { success: false, message: result.message || 'Invalid credentials' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const formatName = (fullName) => {
    const parts = String(fullName || '').trim().split(' ').filter(Boolean);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  };

  const registerPatient = async (patientData) => {
    const exists = patients.find(p => p.email === patientData.email);
    if (exists) return { success: false, message: 'Email already registered' };

    const { firstName, lastName } = formatName(patientData.name);
    const payload = {
      firstName,
      lastName,
      name: patientData.name,
      email: String(patientData.email).trim().toLowerCase(),
      password: String(patientData.password).trim(),
      phone: patientData.phone,
      gender: patientData.gender,
      dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : undefined,
      address: patientData.address || {},
      medicalHistory: patientData.medicalHistory || [],
      allergies: patientData.allergies || [],
      medications: patientData.medications || [],
    };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!result.success) {
        return { success: false, message: result.error || 'Failed to create patient' };
      }

      const newPat = mapBackendPatient(result.data);
      setPatients(prev => [...prev, newPat]);
      return { success: true, data: newPat };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const registerDoctor = async (doctorData) => {
    const exists = doctors.find(d => d.email === doctorData.email);
    if (exists) return { success: false, message: 'Email already registered' };

    const { firstName, lastName } = formatName(doctorData.name);
    const qualificationsArray = doctorData.qualifications 
      ? doctorData.qualifications.split(',').map(q => q.trim())
      : [];

    const payload = {
      firstName,
      lastName,
      name: doctorData.name,
      email: String(doctorData.email).trim().toLowerCase(),
      password: String(doctorData.password).trim(),
      phone: doctorData.phone,
      specialization: doctorData.specialty,
      licenseNumber: doctorData.licenseNumber,
      yearsOfExperience: Number(doctorData.experience) || 0,
      qualifications: qualificationsArray,
      hospital: doctorData.hospital,
      clinicAddress: {},
      consultationFee: Number(doctorData.consultationFee) || 0,
      availableHours: {
        startTime: doctorData.startTime || '09:00',
        endTime: doctorData.endTime || '17:00',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      bio: doctorData.bio || '',
      isApproved: false,
    };

    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!result.success) {
        return { success: false, message: result.error || 'Failed to create doctor' };
      }

      const newDoc = mapBackendDoctor(result.data);
      setDoctors(prev => [...prev, newDoc]);
      return { success: true, data: newDoc };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('hc_user');
    localStorage.removeItem('hc_userType');
  };

  const approveDoctor = async (id) => {
    try {
      const response = await fetch(`/api/doctors/${id}/approve`, {
        method: 'PUT',
      });
      const result = await response.json();

      if (!result.success) {
        return { success: false, message: result.error || 'Failed to approve doctor' };
      }

      const approvedDoctor = mapBackendDoctor(result.data);
      setDoctors(prev => prev.map(d => (d.id === id ? approvedDoctor : d)));
      return { success: true, data: approvedDoctor };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteDoctor = async (id) => {
    try {
      const response = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!result.success) {
        return { success: false, message: result.error || 'Failed to delete doctor' };
      }

      setDoctors(prev => prev.filter(d => d.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const addAppointment = async (appointment) => {
    const payload = {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.date ? new Date(appointment.date) : new Date(),
      timeSlot: appointment.time || appointment.timeSlot || 'Not specified',
      appointmentType: appointment.appointmentType || 'consultation',
      reason: appointment.reason || 'General consultation',
      symptoms: appointment.symptoms || [],
      status: 'pending',
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!result.success) {
        return { success: false, message: result.error || 'Failed to create appointment' };
      }

      const newApp = mapBackendAppointment(result.data);
      setAppointments(prev => [...prev, newApp]);

      // Backend will send the doctor notification once the appointment is created.
      // Keeping the frontend flow minimal avoids duplicate notifications.

      return { success: true, data: newApp };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();

      if (!result.success) {
        return { success: false, message: result.error || 'Failed to update appointment status' };
      }

      const updatedApp = mapBackendAppointment(result.data);
      setAppointments(prev => prev.map(a => (a.id === id ? updatedApp : a)));
      return { success: true, data: updatedApp };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const sendEmailNotification = async (payload) => {
    try {
      console.log(`[HealthSystem] Triggering email push to: ${payload.to}...`);
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.success) {
        console.log(`[HealthSystem] ✅ Email pushed successfully: ${result.messageId}`);
      } else if (result.isDemo) {
        console.warn(`[HealthSystem] ℹ️ Simulation Mode: Email content generated but not sent (EMAIL_USER/PASS not set).`);
        console.log(`[Generated Content]:`, result.previewContent);
      } else {
        console.error(`[HealthSystem] ❌ Email delivery failed: ${result.error || result.message}`);
      }
      return result;
    } catch (error) {
      console.error('[HealthSystem] ❌ Network error trying to push email:', error);
      return { success: false, error };
    }
  };

  const deleteAccount = () => {
    if (!user) return { success: false, message: 'No user logged in' };
    
    console.log(`[HealthSystem] DELETING ACCOUNT: ${user.name}`);
    
    if (userType === 'doctor') {
      setDoctors(prev => prev.filter(d => d.id !== user.id));
    } else if (userType === 'patient') {
      setPatients(prev => prev.filter(p => p.id !== user.id));
    }
    
    logout();
    // Also clear other specific items
    localStorage.removeItem('hc_doctors');
    localStorage.removeItem('hc_patients');
    localStorage.removeItem('hc_appointments');
    
    return { success: true };
  };

  const sendTestEmail = async () => {
    if (!user?.email) return { success: false, message: 'User email missing' };
    
    return await sendEmailNotification({
      to: user.email,
      subject: 'MediCore System Test',
      body: 'This is a test email to verify your MediCore notification configuration.',
      html: '<h1 style="color: #2563eb;">MediCore Test</h1><p>Your email notification system is working correctly.</p>'
    });
  };

  const updatePassword = (newPassword) => {
    if (!user) return { success: false, message: 'No user logged in' };

    if (userType === 'doctor') {
      setDoctors(prev => prev.map(d => d.id === user.id ? { ...d, password: newPassword } : d));
      setUser({ ...user, password: newPassword });
    } else if (userType === 'patient') {
      setPatients(prev => prev.map(p => p.id === user.id ? { ...p, password: newPassword } : p));
      setUser({ ...user, password: newPassword });
    } else if (userType === 'admin') {
      setUser({ ...user, password: newPassword });
      // Note: INITIAL_ADMIN is static, but we update the current session user
    }

    // Refresh saved user in localStorage
    const updatedUser = { ...user, password: newPassword };
    localStorage.setItem('hc_user', JSON.stringify(updatedUser));
    
    return { success: true };
  };

  const addPatientReport = async (patientId, reportData) => {
    if (!user || userType !== 'doctor') return { success: false, message: 'Only doctors can upload reports' };

    const normalizedType = String(reportData.type || 'diagnosis').trim().toLowerCase().replace(/\s+/g, '_');
    const payload = {
      patientId,
      doctorId: user.id,
      reportType: normalizedType || 'diagnosis',
      title: reportData.name || 'Medical Report',
      description: reportData.description || '',
      recommendations: reportData.recommendations || '',
      attachments: [{
        fileName: reportData.fileName,
        fileUrl: reportData.fileData || reportData.fileUrl || '',
        uploadDate: new Date().toISOString(),
      }],
      isSharedWithPatient: true,
    };

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!result.success) {
        return { success: false, message: result.error || 'Failed to upload report' };
      }

      const savedReport = result.data;
      const report = {
        id: savedReport.id || savedReport._id,
        ...reportData,
        uploadedBy: user.id,
        uploadedByName: user.name,
        uploadedAt: savedReport.createdAt || new Date().toISOString(),
        status: savedReport.status || 'Ready',
      };

      setPatients(prev => prev.map(p => 
        p.id === patientId 
          ? { ...p, reports: [...(p.reports || []), report] }
          : p
      ));

      return { success: true, report };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const getPatientReports = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.reports || [];
  };

  const updatePatient = (patientId, updates) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...updates } : p));
    if (user?.id === patientId) {
      setUser(prevUser => ({ ...prevUser, ...updates }));
      localStorage.setItem('hc_user', JSON.stringify({ ...user, ...updates }));
    }
    return { success: true };
  };

  const scheduleAppointment = async (appointmentId, scheduleData) => {
    const payload = {
      scheduledDate: scheduleData.date,
      scheduledTime: scheduleData.time,
      meetingType: scheduleData.meetingType || 'in-person',
      meetingLink: scheduleData.meetingLink || null,
      doctorNotes: scheduleData.notes || '',
    };

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!result.success) {
        return { success: false, message: result.error || 'Failed to schedule appointment' };
      }

      const scheduledApp = mapBackendAppointment(result.data);
      setAppointments(prev => prev.map(a => (a.id === appointmentId ? scheduledApp : a)));

      return { success: true, data: scheduledApp };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <HealthContext.Provider value={{
      user, userType, doctors, patients, appointments,
      login, registerPatient, registerDoctor, logout,
      approveDoctor, deleteDoctor, addAppointment, updateAppointmentStatus,
      scheduleAppointment, theme, setTheme, language, setLanguage, deleteAccount, sendTestEmail,
      updatePassword, addPatientReport, getPatientReports, updatePatient
    }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0F172A]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Initializing MediCore Intelligence...</p>
          </div>
        </div>
      ) : children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => useContext(HealthContext);
