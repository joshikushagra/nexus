import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../apps/api/models/User.js";

dotenv.config({ path: "apps/api/.env" });

const promoteUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.error(`User with email "${email}" not found.`);
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
  console.log("Usage: node tmp/promote_admin.js user@example.com");
  process.exit(1);
}

promoteUser(email);
