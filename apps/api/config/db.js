import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "nexus",
      serverSelectionTimeoutMS: 30000, // Give Atlas 30s to cold-start after reactivation
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.warn("⚠️  Server is running BUT database is unavailable.");
    console.warn("   Fix: Whitelist your IP in MongoDB Atlas → Network Access → Add IP Address.");
    // Do NOT call process.exit — let the server stay up so API routes still respond
  }
};

export default connectDB;
