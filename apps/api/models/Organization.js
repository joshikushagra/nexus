import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,       // Display name
    },
    githubOrgName: {
      type: String,
      required: true,
      unique: true,         // The exact GitHub org slug (e.g. "my-company")
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    adminFirebaseUID: {
      type: String,         // Firebase UID of the admin who created this
      required: true,
    },
    memberFirebaseUIDs: {
      type: [String],       // Firebase UIDs of developers in this org
      default: [],
    },
    clientFirebaseUIDs: {
      type: [String],       // Firebase UIDs of clients who can view this org
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
