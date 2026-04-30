import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
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
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    appointmentType: {
      type: String,
      enum: ['consultation', 'follow-up', 'emergency'],
      default: 'consultation',
    },
    reason: String,
    symptoms: [String],
    notes: String,
    prescription: String,
    diagnosis: String,
    consultationFee: Number,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    meetingLink: String,
    meetingType: {
      type: String,
      enum: ['in-person', 'google-meet'],
      default: 'in-person',
    },
    scheduledDate: Date,
    scheduledTime: String,
    doctorNotes: String,
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema, 'appointment');
