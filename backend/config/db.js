import mongoose from 'mongoose';
import 'colors';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

const connectDB = async (retryCount = 0) => {
  try {
    // Check for both MONGO_URI and MONGODB_URI
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('Neither MONGO_URI nor MONGODB_URI is defined in environment variables');
      return false;
    }

    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      console.log('Closing existing connection...');
      await mongoose.connection.close();
    }
    
    // Set up connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      family: 4
    };

    console.log(`Attempting to connect to MongoDB (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    const conn = await mongoose.connect(uri, options);

    // Verify connection
    if (conn.connection.readyState !== 1) {
      throw new Error('Failed to establish connection');
    }

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    console.log(`Database Name: ${conn.connection.name}`.cyan.underline);
    console.log(`Connection State: ${conn.connection.readyState}`.cyan.underline);
    
    // Log all collections in the database
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available Collections:', collections.map(c => c.name).join(', '));

    // Verify we can perform operations
    try {
      const testResult = await conn.connection.db.command({ ping: 1 });
      console.log('Database ping successful:', testResult);
    } catch (pingError) {
      console.error('Database ping failed:', pingError);
      throw pingError;
    }

    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`.red.underline.bold);
    
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`Retrying in ${RETRY_INTERVAL/1000} seconds...`.yellow);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB(retryCount + 1);
    }
    
    console.error('Max retries reached. Could not connect to MongoDB.'.red);
    return false;
  }
};

export default connectDB; 