import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["developer", "client", "client_owner", "client_team", "admin", "founder"],
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "expert", "none"],
      default: "none",
    },
    location: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Auto-manages createdAt and updatedAt
  }
);

// Indexing for search performance
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });

const User = mongoose.model("User", userSchema);

export default User;
