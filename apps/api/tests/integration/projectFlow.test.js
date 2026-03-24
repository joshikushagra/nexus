import request from "supertest";
import { createServer } from "http";
import express from "express";
import { connectTestDB, disconnectTestDB, clearTestDB } from "../setup.js";
import projectRoutes from "../../routes/projectRoutes.js";
import applicationRoutes from "../../routes/applicationRoutes.js";
import clientRequirementRoutes from "../../routes/clientRequirementRoutes.js";
import Task from "../../models/Task.js";
import Project from "../../models/Project.js";
import Application from "../../models/Application.js";
import ClientRequirement from "../../models/ClientRequirement.js";
import User from "../../models/User.js";

// Mock server for testing
const app = express();
app.use(express.json());

// Auth is bypassed in server-level middleware by providing a Bearer token
// and ensuring BYPASS_AUTH=true in .env / process.env

app.use("/api/projects", projectRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/client-requirements", clientRequirementRoutes);

describe("Integration: Project Creation Workflow", () => {
  beforeAll(async () => await connectTestDB());
  afterAll(async () => await disconnectTestDB());
  afterEach(async () => await clearTestDB());

  it("should create a Project automatically when a Requirement Application is accepted", async () => {
    // 1. Create a Requirement
    const requirement = await ClientRequirement.create({
      title: "Test Requirement",
      description: "Needs logic",
      budget: 1000,
      timeline: "2 weeks",
      skillsRequired: ["js"],
      postedBy: "test-uid",
    });

    // 2. Create an Application for it
    const application = await Application.create({
      projectId: requirement._id,
      projectModel: "ClientRequirement",
      applicantUID: "dev-uid",
      message: "Hire me",
      status: "pending",
    });

    // 3. Accept the Application via API
    // Ensure the test user exists in DB for the auth middleware to attach role
    await User.create({ firebaseUID: "test-uid", role: "admin", email: "test@example.com", name: "Test Admin" });

    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set("Authorization", "Bearer test-uid")
      .send({ status: "accepted" });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Project created");

    // 4. Verify Project exists and developer is assigned
    const project = await Project.findOne({ title: requirement.title });
    expect(project).toBeDefined();
    expect(project.teamMembers).toContain("dev-uid");

    // 5. Verify Requirement is closed
    const updatedReq = await ClientRequirement.findById(requirement._id);
    expect(updatedReq.status).toBe("closed");
  });
});
