import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/AIhealthCare';
    
    await mongoose.connect(mongoURI);
    
    console.log('✓ MongoDB Connected Successfully');
    console.log(`  Database: ${mongoose.connection.name}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
