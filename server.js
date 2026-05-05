import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import cors from 'cors';
import multer from 'multer';
import connectDB from './config/database.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import Appointment from './models/Appointment.js';
import Admin from './models/Admin.js';
import Report from './models/Report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('[Startup] Loaded .env configuration file.');
} else if (fs.existsSync(envExamplePath)) {
  dotenv.config({ path: envExamplePath });
  console.warn('[Startup] .env file not found. Loaded .env.example as a fallback.');
  console.warn('[Startup] Please create a .env file with your real SMTP credentials for email delivery.');
} else {
  dotenv.config();
  console.warn('[Startup] No .env or .env.example file found. Environment variables may be missing.');
}

const emailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
console.log(`[Startup] Email configured: ${emailConfigured ? 'yes' : 'no'}. EMAIL_SERVICE=${process.env.EMAIL_SERVICE || 'gmail'}`);
if (!emailConfigured) {
  console.warn('[Startup] Email credentials are missing or empty. Set EMAIL_USER and EMAIL_PASS in your .env file.');
}

// Lazy initialization of transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    const user = (process.env.EMAIL_USER || '').trim();
    let pass = (process.env.EMAIL_PASS || '').trim();
    const service = (process.env.EMAIL_SERVICE || 'gmail').toLowerCase();

    // Helpful logs for debugging (without leaking full password)
    if (user) {
      console.log(`[Email Service] Config: User=${user.substring(0, 3)}...${user.split('@')[1]}, Service=${service}`);
    }
    if (pass) {
      // Clean up password (remove spaces)
      const originalLength = pass.length;
      pass = pass.replace(/\s+/g, '');
      console.log(`[Email Service] Config: Original Pass Len=${originalLength}, Cleaned Len=${pass.length}`);
      console.log(`[Email Service] Pass starts with: ${pass.substring(0, 2)}... ends with: ${pass.substring(pass.length - 2)}`);
    }

    if (!user || !pass) {
      console.warn('Email credentials (EMAIL_USER/EMAIL_PASS) missing in environment.');
      return null;
    }

    // Use Port 587 for STARTTLS or Port 465 for SSL
    if (service === 'gmail') {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // TLS
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      transporter = nodemailer.createTransport({
        service: service,
        auth: { user, pass }
      });
    }

    // Verify the connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.error(`[Email Service] Verification Error: ${error.message}`);
      } else {
        console.log("[Email Service] Connection verified and ready to send");
      }
    });
  }
  return transporter;
}

async function sendNotificationEmail({ to, subject, body, html, attachments = [] }) {
  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    console.warn('[Email Service] Email skipped: SERVICE NOT CONFIGURED. Set EMAIL_USER and EMAIL_PASS in environment.');
    throw new Error('Email service not configured');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text: body,
    html: html || body,
  };

  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  const info = await mailTransporter.sendMail(mailOptions);

  console.log('[Email Service] SUCCESS:', info.messageId);
  return info;
}

export async function generateAIResponse(prompt) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    const baseUrl = process.env.OPENROUTER_BASE_URL?.trim() || 'https://openrouter.ai';
    const model = process.env.OPENROUTER_MODEL?.trim() || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

    if (!apiKey) {
      console.error('[AI] Missing OPENROUTER_API_KEY');
      return 'AI service temporarily unavailable';
    }

    console.log(`[AI] Sending request to ${baseUrl} using model ${model}`);

    const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful healthcare assistant. Give clear, safe, and structured responses. Avoid giving dangerous medical advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[AI] OpenRouter error:', response.status, data);
      return data?.error?.message || data?.error || `AI service error ${response.status}`;
    }

    const content = data?.choices?.[0]?.message?.content;
    if (content && String(content).trim()) {
      return String(content).trim();
    }

    console.warn('[AI] No response content from OpenRouter:', data);
    return 'No response from AI';
  } catch (error) {
    console.error('[AI ERROR]:', error);
    return 'AI service temporarily unavailable';
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));
  app.use(cors());

  // Connect to MongoDB
  await connectDB();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Healthcare API is running' });
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt = '', language = 'en' } = req.body;
      if (!prompt.trim()) {
        return res.status(400).json({ success: false, message: 'Prompt is required.' });
      }

      const response = await generateAIResponse(
        `You are a healthcare assistant. Answer the user's question in ${language === 'kn' ? 'Kannada' : 'English'}. Respond clearly, gently, and include simple medical guidance when applicable. User says: ${prompt}`
      );

      return res.json({ success: true, output: response.trim() });
    } catch (error) {
      console.error('[AI Chat] Error:', error?.message || error);
      return res.status(500).json({ success: false, message: error?.message || 'AI chat failed to generate a response.' });
    }
  });

  app.post('/api/ai/analyze', upload.single('file'), async (req, res) => {
    try {
      const { type = 'report', language = 'en', content = '' } = req.body;
      const typeLabel = type === 'medicine' ? 'medicine label or packaging' : type === 'prescription' ? 'prescription' : 'medical report';
      const reportContent = String(content || '').trim();
      const file = req.file;

      let extractedFileText = '';
      let fileDescription = '';

      if (file) {
        fileDescription = `Uploaded file: ${file.originalname} (${file.mimetype}).`;
        if (file.mimetype.startsWith('text/') || file.originalname.toLowerCase().endsWith('.txt')) {
          extractedFileText = file.buffer.toString('utf8').trim();
        }
      }

      const contentPromptParts = [];
      if (reportContent) {
        contentPromptParts.push(`Patient report content:\n${reportContent}`);
      }
      if (extractedFileText) {
        contentPromptParts.push(`Extracted text from uploaded file:\n${extractedFileText}`);
      }
      if (file && !extractedFileText) {
        contentPromptParts.push(`${fileDescription} Use the uploaded file information and any provided report text to infer the patient's condition.`);
      }

      const contentPrompt = contentPromptParts.length > 0 ? `${contentPromptParts.join('\n\n')}\n\n` : '';

      const response = await generateAIResponse(
        `You are an experienced medical assistant. A patient submitted a ${typeLabel}. ${contentPrompt}Provide a concise analysis in ${language === 'kn' ? 'Kannada' : 'English'}. Return only valid JSON with keys: title, details, disease, solution, homeRemedy, medicine, precautions, steps. If the report indicates malaria, set the disease field to "malaria disease". Use safe medical language and do not include any extra text outside JSON.`
      );

      let parsed;
      try {
        const start = response.indexOf('{');
        const end = response.lastIndexOf('}');
        const jsonText = start >= 0 && end >= 0 ? response.slice(start, end + 1) : response;
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.warn('[AI Analyze] Parsed JSON fallback failed:', parseError.message);
        parsed = null;
      }

      if (!parsed || typeof parsed !== 'object') {
        return res.status(500).json({ success: false, message: 'AI did not return a valid analysis object.' });
      }

      return res.json({ success: true, output: parsed });
    } catch (error) {
      console.error('[AI Analyze] Error:', error?.message || error);
      return res.status(500).json({ success: false, message: error?.message || 'AI analysis failed to complete.' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { email, password, type } = req.body;
      if (!email || !password || !type) {
        return res.status(400).json({ success: false, message: 'Email, password and type are required.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedPassword = String(password).trim();
      console.log(`[Login] Attempt type=${type} email=${normalizedEmail}`);

      let userRecord = null;
      if (type === 'patient') {
        userRecord = await Patient.findOne({ email: normalizedEmail, password: normalizedPassword });
      } else if (type === 'doctor') {
        userRecord = await Doctor.findOne({ email: normalizedEmail, password: normalizedPassword });
      } else if (type === 'admin') {
        userRecord = await Admin.findOne({ email: normalizedEmail, password: normalizedPassword });
      }

      if (!userRecord) {
        console.warn(`[Login] Failed login for type=${type} email=${normalizedEmail}`);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = userRecord.toObject();
      delete user.password;

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('[Login] Unexpected error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post('/api/send-notification', async (req, res) => {
    const { to, subject, body, html } = req.body;
    console.log(`[Email Service] Attempting to send email to: ${to}`);

    try {
      const info = await sendNotificationEmail({ to, subject, body, html });
      res.json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error('[Email Service] AUTH/TRANSPORT ERROR:', error.message);
      let errorMessage = error.message;
      if (error.message.includes('535')) {
        errorMessage = 'Invalid Credentials (535). If using Gmail, you MUST use an "App Password" (16 chars) from Google Account Security settings, not your regular password.';
      }
      if (error.message.includes('configured')) {
        return res.status(500).json({
          success: false,
          error: errorMessage,
          tip: 'Set EMAIL_USER and EMAIL_PASS in .env and restart the server.'
        });
      }
      res.status(500).json({
        success: false,
        error: errorMessage,
        tip: 'Ensure you have enabled 2-Step Verification and generated an App Password at https://myaccount.google.com/apppasswords'
      });
    }
  });

  app.get('/api/email/verify', async (req, res) => {
    const mailTransporter = getTransporter();
    if (!mailTransporter) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured. Check EMAIL_USER and EMAIL_PASS in your .env file.'
      });
    }

    mailTransporter.verify((error, success) => {
      if (error) {
        console.error('[Email Service] Verification API failed:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
      res.json({ success: true, message: 'Email transporter verified successfully' });
    });
  });

  // Database Status Route
  app.get('/api/db/status', async (req, res) => {
    try {
      const collections = {
        patients: await Patient.countDocuments(),
        doctors: await Doctor.countDocuments(),
        appointments: await Appointment.countDocuments(),
        admins: await Admin.countDocuments(),
        reports: await Report.countDocuments(),
      };
      
      res.json({
        status: 'connected',
        database: 'aihealthcare',
        collections
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  });

  // ===== PATIENT ROUTES =====
  // Get all patients
  app.get('/api/patients', async (req, res) => {
    try {
      const patients = await Patient.find().select('-password');
      res.json({ success: true, data: patients });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get patient by ID
  app.get('/api/patients/:id', async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id).select('-password');
      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }
      res.json({ success: true, data: patient });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create new patient
  app.post('/api/patients', async (req, res) => {
    try {
      const patient = new Patient(req.body);
      await patient.save();
      const patientResponse = patient.toObject();
      delete patientResponse.password;

      // Send welcome email to patient
      try {
        await sendNotificationEmail({
          to: patient.email,
          subject: 'Welcome to MediCore Healthcare',
          body: `Dear ${patient.firstName},\n\nThank you for registering with MediCore Healthcare. Your account is now active and you can login to book appointments, access reports, and manage your health records online.\n\nWe are here to support your wellness journey.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563eb;">Welcome to MediCore Healthcare</h2>
              <p>Dear <strong>${patient.firstName}</strong>,</p>
              <p>Thank you for registering with MediCore Healthcare. Your account is now active and you can login to book appointments, access your medical reports, and manage your health records online.</p>
              <p>We are here to support your wellness journey.</p>
              <a href="http://localhost:3000/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Login Now</a>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 20px 0 0;">
              <p style="font-size: 12px; color: #64748b;">This is an automated notification from MediCore Intelligence Healthcare System.</p>
            </div>
          `
        });
      } catch (emailError) {
        console.warn('[Patient] Welcome email failed:', emailError.message);
      }

      res.status(201).json({ success: true, data: patientResponse });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update patient
  app.put('/api/patients/:id', async (req, res) => {
    try {
      const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }
      res.json({ success: true, data: patient });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete patient
  app.delete('/api/patients/:id', async (req, res) => {
    try {
      const patient = await Patient.findByIdAndDelete(req.params.id);
      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }
      res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ===== ADMIN APPROVAL ROUTES =====
  // Get unapproved doctors for admin review
  app.get('/api/doctors/pending-approval', async (req, res) => {
    try {
      const pendingDoctors = await Doctor.find({ isApproved: false }).select('-password');
      res.json({ success: true, data: pendingDoctors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put('/api/doctors/:id/approve', async (req, res) => {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true }
      ).select('-password');

      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }

      // Send approval email to doctor
      const { to, subject, body, html } = {
        to: doctor.email,
        subject: 'Your MediCore Account Has Been Approved',
        body: `Dear Dr. ${doctor.firstName},\n\nYour doctor account has been approved! You can now login to your dashboard and start accepting patient appointments.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #16a34a;">Account Approved!</h2>
            <p>Dear <strong>Dr. ${doctor.firstName}</strong>,</p>
            <p>Your doctor account on MediCore Healthcare has been <strong style="color: #16a34a;">APPROVED</strong>!</p>
            <p>You can now login to your dashboard and start accepting patient appointments.</p>
            <a href="http://localhost:3000/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Login Now</a>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b;">This is an automated notification from MediCore Intelligence Healthcare System.</p>
          </div>
        `
      };

      try {
        await sendNotificationEmail({ to, subject, body, html });
      } catch (emailError) {
        console.warn('[Approval] Email notification failed:', emailError.message);
      }

      res.json({ success: true, data: doctor });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put('/api/doctors/:id/reject', async (req, res) => {
    try {
      const doctor = await Doctor.findByIdAndDelete(req.params.id);
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }
      res.json({ success: true, message: 'Doctor account rejected and deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ===== DOCTOR ROUTES =====
  // Get all doctors
  app.get('/api/doctors', async (req, res) => {
    try {
      const doctors = await Doctor.find().select('-password');
      res.json({ success: true, data: doctors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get doctor by ID
  app.get('/api/doctors/:id', async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id).select('-password');
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }
      res.json({ success: true, data: doctor });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create new doctor
  app.post('/api/doctors', async (req, res) => {
    try {
      const doctor = new Doctor(req.body);
      await doctor.save();
      const doctorResponse = doctor.toObject();
      delete doctorResponse.password;

      // Send welcome email to doctor
      try {
        await sendNotificationEmail({
          to: doctor.email,
          subject: 'Welcome to MediCore Healthcare - Doctor Registration Received',
          body: `Dear Dr. ${doctor.firstName},\n\nYour account registration has been received by MediCore Healthcare. Your account is currently pending admin approval. We will send another email once your account is approved.\n\nThank you for joining our provider network!`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563eb;">Welcome to MediCore Healthcare</h2>
              <p>Dear <strong>Dr. ${doctor.firstName}</strong>,</p>
              <p>Your registration has been received successfully. Your account is currently pending admin approval.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Status:</strong> Pending Approval</p>
                <p>Once approved, you will be able to login and manage patient appointments, upload reports, and collaborate with patients.</p>
              </div>
              <p>We will notify you via email once your account has been approved.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #64748b;">This is an automated notification from MediCore Intelligence Healthcare System.</p>
            </div>
          `
        });
      } catch (emailError) {
        console.warn('[Doctor] Welcome email failed:', emailError.message);
      }

      res.status(201).json({ success: true, data: doctorResponse });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update doctor
  app.put('/api/doctors/:id', async (req, res) => {
    try {
      const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }
      res.json({ success: true, data: doctor });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete doctor
  app.delete('/api/doctors/:id', async (req, res) => {
    try {
      const doctor = await Doctor.findByIdAndDelete(req.params.id);
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }
      res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ===== APPOINTMENT ROUTES =====
  // Get all appointments
  app.get('/api/appointments', async (req, res) => {
    try {
      const appointments = await Appointment.find()
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName specialization');
      res.json({ success: true, data: appointments });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get appointment by ID
  app.get('/api/appointments/:id', async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id)
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName specialization');
      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }
      res.json({ success: true, data: appointment });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create new appointment
  app.post('/api/appointments', async (req, res) => {
    try {
      const appointment = new Appointment(req.body);
      await appointment.save();
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('patientId', 'firstName lastName email name')
        .populate('doctorId', 'firstName lastName email specialization name');
      
      // Send email to doctor about new appointment request
      if (populatedAppointment.doctorId && populatedAppointment.doctorId.email) {
        const appointmentDate = new Date(populatedAppointment.appointmentDate).toLocaleDateString();
        const doctorEmail = {
          to: populatedAppointment.doctorId.email,
          subject: 'New Appointment Request - MediCore',
          body: `Dear Dr. ${populatedAppointment.doctorId.firstName},\n\nYou have received a new appointment request from a patient.\n\nPatient: ${populatedAppointment.patientId.firstName} ${populatedAppointment.patientId.lastName}\nRequested Date: ${appointmentDate}\nTime Slot: ${populatedAppointment.timeSlot}\n\nPlease login to your dashboard to review and schedule the appointment.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563eb;">New Appointment Request</h2>
              <p>Dear <strong>Dr. ${populatedAppointment.doctorId.firstName}</strong>,</p>
              <p>You have received a new appointment request from a patient:</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Patient:</strong> ${populatedAppointment.patientId.firstName} ${populatedAppointment.patientId.lastName}</p>
                <p><strong>Email:</strong> ${populatedAppointment.patientId.email}</p>
                <p><strong>Requested Date:</strong> ${appointmentDate}</p>
                <p><strong>Requested Time:</strong> ${populatedAppointment.timeSlot}</p>
              </div>
              <p>Please login to your dashboard to review and schedule the appointment at your earliest convenience.</p>
              <a href="http://localhost:3000/doctor" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Go to Dashboard</a>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #64748b;">This is an automated notification from MediCore Intelligence Healthcare System.</p>
            </div>
          `
        };
        
        try {
          await sendNotificationEmail(doctorEmail);
        } catch (emailError) {
          console.warn('[Appointment] Doctor notification failed:', emailError.message);
        }
      }
      
      res.status(201).json({ success: true, data: populatedAppointment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update appointment
  app.put('/api/appointments/:id', async (req, res) => {
    try {
      const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('patientId', 'firstName lastName email name')
        .populate('doctorId', 'firstName lastName email specialization name');
      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }

      // Send email to patient when appointment is scheduled
      if ((req.body.status === 'confirmed' || req.body.status === 'accepted') && appointment.patientId && appointment.patientId.email) {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString();
        const patientEmail = {
          to: appointment.patientId.email,
          subject: 'Your Appointment Has Been Scheduled - MediCore',
          body: `Dear ${appointment.patientId.firstName},\n\nYour appointment has been scheduled!\n\nDoctor: Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}\nSpecialization: ${appointment.doctorId.specialization}\nDate: ${appointmentDate}\nTime: ${appointment.timeSlot}\n\nPlease ensure you are available at the scheduled time. If you need to reschedule, please contact us as soon as possible.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #16a34a;">Appointment Confirmed!</h2>
              <p>Dear <strong>${appointment.patientId.firstName}</strong>,</p>
              <p>Your appointment has been <strong style="color: #16a34a;">SCHEDULED</strong>!</p>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}</strong></p>
                <p style="margin: 5px 0;"><strong>Specialization:</strong> ${appointment.doctorId.specialization}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.timeSlot}</p>
              </div>
              <p>Please ensure you are available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
              <a href="http://localhost:3000/patient" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">View Appointment</a>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #64748b;">This is an automated notification from MediCore Intelligence Healthcare System.</p>
            </div>
          `
        };

        try {
          await sendNotificationEmail(patientEmail);
        } catch (emailError) {
          console.warn('[Appointment] Patient notification failed:', emailError.message);
        }
      }

      res.json({ success: true, data: appointment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete appointment
  app.delete('/api/appointments/:id', async (req, res) => {
    try {
      const appointment = await Appointment.findByIdAndDelete(req.params.id);
      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }
      res.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Schedule appointment (doctor sets date, time, meeting type)
  app.put('/api/appointments/:id/schedule', async (req, res) => {
    try {
      const { scheduledDate, scheduledTime, meetingType, meetingLink, doctorNotes } = req.body;
      
      if (!scheduledDate || !scheduledTime) {
        return res.status(400).json({ success: false, error: 'Scheduled date and time are required' });
      }

      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        {
          scheduledDate: new Date(scheduledDate),
          scheduledTime,
          meetingType: meetingType || 'in-person',
          meetingLink: meetingLink || null,
          doctorNotes: doctorNotes || '',
          status: 'confirmed'
        },
        { new: true }
      )
        .populate('patientId', 'firstName lastName email name')
        .populate('doctorId', 'firstName lastName email specialization name');

      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }

      // Send email to patient with scheduled appointment details
      if (appointment.patientId && appointment.patientId.email) {
        const appointmentDate = new Date(appointment.scheduledDate).toLocaleDateString();
        const meetingInfo = appointment.meetingType === 'google-meet' 
          ? `<p style="margin: 5px 0;"><strong>Meeting Type:</strong> Google Meet</p><p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}" style="color: #2563eb;">${appointment.meetingLink}</a></p>`
          : `<p style="margin: 5px 0;"><strong>Meeting Type:</strong> In-Person</p>`;

        const patientEmail = {
          to: appointment.patientId.email,
          subject: 'Your Appointment Has Been Scheduled - MediCore',
          body: `Dear ${appointment.patientId.firstName},\n\nYour appointment has been scheduled!\n\nDoctor: Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}\nDate: ${appointmentDate}\nTime: ${appointment.scheduledTime}\nMeeting Type: ${appointment.meetingType}\n\nPlease ensure you are available at the scheduled time.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #16a34a;">✓ Appointment Scheduled!</h2>
              <p>Dear <strong>${appointment.patientId.firstName}</strong>,</p>
              <p>Your appointment has been scheduled with Dr. ${appointment.doctorId.firstName}!</p>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.scheduledTime}</p>
                ${meetingInfo}
              </div>
              ${appointment.doctorNotes ? `<div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Doctor's Notes:</strong></p><p>${appointment.doctorNotes}</p></div>` : ''}
              <p>Please ensure you are available at the scheduled time. If you need to reschedule, please contact the doctor.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #64748b;">This is an automated notification from MediCore Intelligence Healthcare System.</p>
            </div>
          `
        };

        try {
          await sendNotificationEmail(patientEmail);
        } catch (emailError) {
          console.warn('[Schedule] Patient notification failed:', emailError.message);
        }
      }

      res.json({ success: true, data: appointment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // ===== ADMIN ROUTES =====
  // Get all admins
  app.get('/api/admins', async (req, res) => {
    try {
      const admins = await Admin.find().select('-password');
      res.json({ success: true, data: admins });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get admin by ID
  app.get('/api/admins/:id', async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id).select('-password');
      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }
      res.json({ success: true, data: admin });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create new admin
  app.post('/api/admins', async (req, res) => {
    try {
      const admin = new Admin(req.body);
      await admin.save();
      const adminResponse = admin.toObject();
      delete adminResponse.password;
      res.status(201).json({ success: true, data: adminResponse });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update admin
  app.put('/api/admins/:id', async (req, res) => {
    try {
      const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }
      res.json({ success: true, data: admin });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete admin
  app.delete('/api/admins/:id', async (req, res) => {
    try {
      const admin = await Admin.findByIdAndDelete(req.params.id);
      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }
      res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ===== REPORT ROUTES =====
  // Get all reports
  app.get('/api/reports', async (req, res) => {
    try {
      const reports = await Report.find()
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName specialization');
      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get report by ID
  app.get('/api/reports/:id', async (req, res) => {
    try {
      const report = await Report.findById(req.params.id)
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName specialization');
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create new report
  app.post('/api/reports', async (req, res) => {
    try {
      const report = new Report(req.body);
      await report.save();
      const populatedReport = await Report.findById(report._id)
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName specialization');

      // Send email notification to patient when a report is uploaded
      if (populatedReport?.patientId?.email) {
        // Prepare attachments
        const attachments = [];
        if (populatedReport.attachments && populatedReport.attachments.length > 0) {
          populatedReport.attachments.forEach((attachment, index) => {
            if (attachment.fileUrl && attachment.fileUrl.startsWith('data:')) {
              const [mimePart, base64Data] = attachment.fileUrl.split(',');
              const mimeType = mimePart.split(':')[1].split(';')[0];
              attachments.push({
                filename: attachment.fileName || `report-attachment-${index + 1}.${mimeType.split('/')[1]}`,
                content: base64Data,
                encoding: 'base64',
                contentType: mimeType,
              });
            }
          });
        }

        const patientEmail = {
          to: populatedReport.patientId.email,
          subject: 'New Medical Report Available - MediCore',
          body: `Dear ${populatedReport.patientId.firstName},\n\nA new medical report has been uploaded for you by Dr. ${populatedReport.doctorId.firstName} ${populatedReport.doctorId.lastName}.\n\nReport Title: ${populatedReport.title}\nReport Type: ${populatedReport.reportType}\n\nThe report attachments are included in this email for your convenience. You can view and download them directly.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563eb;">New Medical Report Available</h2>
              <p>Dear <strong>${populatedReport.patientId.firstName}</strong>,</p>
              <p>A new medical report has been uploaded for you by Dr. ${populatedReport.doctorId.firstName} ${populatedReport.doctorId.lastName}.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Report Title:</strong> ${populatedReport.title}</p>
                <p><strong>Report Type:</strong> ${populatedReport.reportType}</p>
                ${populatedReport.description ? `<p><strong>Description:</strong> ${populatedReport.description}</p>` : ''}
                ${populatedReport.findings ? `<p><strong>Findings:</strong> ${populatedReport.findings}</p>` : ''}
                ${populatedReport.recommendations ? `<p><strong>Recommendations:</strong> ${populatedReport.recommendations}</p>` : ''}
              </div>
              <p>The report attachments are included in this email. You can view and download them directly from your email client.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 20px 0 0;">
              <p style="font-size: 12px; color: #64748b;">This is an automated notification from MediCore Intelligence Healthcare System.</p>
            </div>
          `,
          attachments,
        };

        try {
          await sendNotificationEmail(patientEmail);
        } catch (emailError) {
          console.warn('[Report] Patient notification failed:', emailError.message);
        }
      }

      res.status(201).json({ success: true, data: populatedReport });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update report
  app.put('/api/reports/:id', async (req, res) => {
    try {
      const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName specialization');
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete report
  app.delete('/api/reports/:id', async (req, res) => {
    try {
      const report = await Report.findByIdAndDelete(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }
      res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Healthcare System Server running on http://localhost:${PORT}`);
  });
}

startServer();
