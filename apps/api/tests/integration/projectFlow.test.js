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

// Mock server for testing
const app = express();
app.use(express.json());

// Mock auth middleware for testing
app.use((req, res, next) => {
  req.user = { uid: "test-uid", role: "admin" };
  next();
});

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
    const res = await request(app)
      .patch(`/api/applications/${application._id}/status`)
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
