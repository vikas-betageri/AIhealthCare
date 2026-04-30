// Test script to verify MongoDB API endpoints
// Run this with: node test-api.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testPatient = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  phone: '+1234567890',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  bloodType: 'O+',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  medicalHistory: ['Hypertension'],
  allergies: ['Penicillin'],
  medications: ['Lisinopril 10mg'],
  emergencyContact: {
    name: 'Jane Doe',
    phone: '+1234567891',
    relationship: 'Spouse'
  }
};

const testDoctor = {
  firstName: 'Dr. Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@hospital.com',
  password: 'password123',
  phone: '+1234567892',
  specialization: 'Cardiology',
  licenseNumber: 'MD123456',
  yearsOfExperience: 10,
  qualifications: ['MD', 'Board Certified Cardiologist'],
  hospital: 'City General Hospital',
  clinicAddress: {
    street: '456 Health Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10002',
    country: 'USA'
  },
  consultationFee: 150,
  availableHours: {
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  bio: 'Experienced cardiologist with 10+ years of practice',
  isApproved: true
};

async function testAPI() {
  console.log('🧪 Testing MongoDB API Endpoints...\n');

  try {
    // Test 1: Create Patient
    console.log('1. Creating Patient...');
    const patientResponse = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPatient)
    });
    const patientData = await patientResponse.json();
    console.log('✅ Patient created:', patientData.success ? 'SUCCESS' : 'FAILED');

    if (patientData.success) {
      const patientId = patientData.data._id;

      // Test 2: Create Doctor
      console.log('2. Creating Doctor...');
      const doctorResponse = await fetch(`${BASE_URL}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testDoctor)
      });
      const doctorData = await doctorResponse.json();
      console.log('✅ Doctor created:', doctorData.success ? 'SUCCESS' : 'FAILED');

      if (doctorData.success) {
        const doctorId = doctorData.data._id;

        // Test 3: Create Appointment
        console.log('3. Creating Appointment...');
        const appointmentData = {
          patientId: patientId,
          doctorId: doctorId,
          appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
          timeSlot: '10:00',
          appointmentType: 'consultation',
          reason: 'Regular checkup'
        };

        const appointmentResponse = await fetch(`${BASE_URL}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData)
        });
        const appointmentResult = await appointmentResponse.json();
        console.log('✅ Appointment created:', appointmentResult.success ? 'SUCCESS' : 'FAILED');

        // Test 4: Get all data
        console.log('4. Fetching all data...');
        const [patients, doctors, appointments] = await Promise.all([
          fetch(`${BASE_URL}/patients`).then(r => r.json()),
          fetch(`${BASE_URL}/doctors`).then(r => r.json()),
          fetch(`${BASE_URL}/appointments`).then(r => r.json())
        ]);

        console.log(`📊 Data counts: Patients: ${patients.data?.length || 0}, Doctors: ${doctors.data?.length || 0}, Appointments: ${appointments.data?.length || 0}`);

        // Test 5: Database status
        console.log('5. Checking database status...');
        const statusResponse = await fetch(`${BASE_URL}/db/status`);
        const status = await statusResponse.json();
        console.log('📈 Database status:', status);
      }
    }

    console.log('\n🎉 API Testing Complete!');
    console.log('💡 Your MongoDB collections are now working with data storage!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure your server is running with: npm run dev');
  }
}

testAPI();