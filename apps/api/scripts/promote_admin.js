import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const promoteUser = async (email) => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI not found in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.error(`User with email "${email}" not found in database.`);
      console.log("Tip: Make sure you have signed up first on http://localhost:3000");
    } else {
      console.log(`Successfully promoted ${user.name} (${user.email}) to ADMIN.`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error promoting user:", err.message);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log("Usage: node scripts/promote_admin.js user@example.com");
  process.exit(1);
}

promoteUser(email);
