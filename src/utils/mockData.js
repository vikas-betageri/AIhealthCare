export const INITIAL_DOCTORS = [
  {
    id: 'doc1',
    name: 'Dr. Sarah Wilson',
    email: 'sarah@gmail.com',
    password: 'password123',
    phone: '123-456-7890',
    specialty: 'Cardiology',
    experience: '12 Years',
    qualification: 'MD, DM Cardiology',
    hospital: 'City General Hospital',
    fees: 500,
    rating: 4.8,
    isApproved: true,
    timing: '09:00 AM - 05:00 PM',
    proofUrl: 'https://placeholder.com/proof.pdf'
  },
  {
    id: 'doc2',
    name: 'Dr. James Miller',
    email: 'james@gmail.com',
    password: 'password123',
    phone: '987-654-3210',
    specialty: 'Neurology',
    experience: '8 Years',
    qualification: 'MD, Neurology',
    hospital: 'Metropolitan Health Center',
    fees: 450,
    rating: 4.5,
    isApproved: true,
    timing: '10:00 AM - 06:00 PM',
    proofUrl: 'https://placeholder.com/proof.pdf'
  }
];

export const INITIAL_PATIENTS = [
  {
    id: 'pat1',
    name: 'John Doe',
    email: 'john@gmail.com',
    password: 'password123',
    history: [
      { id: 1, date: '2026-04-10', doctor: 'Dr. Sarah Wilson', diagnosis: 'Mild Hypertension', status: 'Recovered' }
    ],
    vitals: {
      bp: '128/82',
      sugar: '98 mg/dL',
      weight: '72 kg'
    },
    reports: [
      { id: 1, name: 'Blood Test Report', date: '2026-04-01', type: 'image', url: 'https://images.unsplash.com/photo-1579165466541-74e24690554a?q=80&w=200' }
    ]
  }
];

export const INITIAL_ADMIN = {
  email: 'admin@gmail.com',
  password: 'adminpassword'
};

export const HEALTH_STATS = [
  { day: 'Mon', bp: 120, sugar: 90, weight: 70 },
  { day: 'Tue', bp: 118, sugar: 95, weight: 70.2 },
  { day: 'Wed', bp: 122, sugar: 92, weight: 69.8 },
  { day: 'Thu', bp: 119, sugar: 88, weight: 70.1 },
  { day: 'Fri', bp: 121, sugar: 91, weight: 70.3 },
  { day: 'Sat', bp: 117, sugar: 93, weight: 70.0 },
  { day: 'Sun', bp: 118, sugar: 89, weight: 69.9 }
];
