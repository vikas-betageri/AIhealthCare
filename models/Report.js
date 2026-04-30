import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    reportType: {
      type: String,
      enum: ['lab', 'imaging', 'pathology', 'diagnosis', 'prescription', 'medical_history', 'clinical', 'radiology', 'cardiology', 'neurology'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    findings: String,
    recommendations: String,
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadDate: Date,
      },
    ],
    testResults: {
      testName: String,
      normalRange: String,
      patientValue: String,
      unit: String,
      status: {
        type: String,
        enum: ['normal', 'abnormal', 'critical'],
      },
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,
    isSharedWithPatient: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema, 'report');
