import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import ClientRequirement from "../models/ClientRequirement.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nexus";

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected. Clearing old data...");

    // Clear existing data
    await User.deleteMany({});
    await ClientRequirement.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log("Creating users...");
    const users = await User.insertMany([
      {
        firebaseUID: "demo-admin-uid",
        name: "Admin User",
        email: "admin@nexus.com",
        role: "admin",
        bio: "Platform Administrator",
      },
      {
        firebaseUID: "demo-client-uid",
        name: "Global Tech Solutions",
        email: "client@globaltech.com",
        role: "client_owner",
        bio: "Leading enterprise software provider looking for specialized talent.",
      },
      {
        firebaseUID: "demo-dev-uid",
        name: "Alex Dev",
        email: "alex@dev.com",
        role: "developer",
        bio: "Full-stack developer with 5+ years of experience in React and Node.js.",
        skills: ["React", "Node.js", "MongoDB", "Socket.io"],
        experienceLevel: "expert",
      },
      {
        firebaseUID: "demo-dev-2-uid",
        name: "Sarah Coder",
        email: "sarah@coder.com",
        role: "developer",
        bio: "UI/UX specialist and frontend engineer.",
        skills: ["Next.js", "Tailwind CSS", "Figma"],
        experienceLevel: "intermediate",
      }
    ]);

    console.log("Creating client requirements...");
    const requirements = await ClientRequirement.insertMany([
      {
        title: "AI-Powered Customer Support Chatbot",
        description: "Develop a real-time chatbot using OpenAI's GPT-4 API to handle basic customer inquiries. Needs a React-based widget and a Node.js backend with WebSocket support for live human handoff.",
        budget: 5000,
        timeline: "2 Months",
        skillsRequired: ["Node.js", "OpenAI", "React", "Socket.io"],
        postedBy: "demo-client-uid",
        status: "open",
        applicants: ["demo-dev-uid"]
      },
      {
        title: "SaaS Subscription Management Platform",
        description: "Build a multi-tenant dashboard for managing SaaS subscriptions. Integrate with Stripe for billing, include role-based access control, and provide analytics visualizations.",
        budget: 12000,
        timeline: "4 Months",
        skillsRequired: ["Next.js", "Stripe", "MongoDB", "Redux"],
        postedBy: "demo-client-uid",
        status: "open",
        applicants: ["demo-dev-uid", "demo-dev-2-uid"]
      },
      {
        title: "Mobile Fitness Tracker API",
        description: "High-performance REST API for a fitness tracking app. Must handle high concurrency, implement caching with Redis, and integrate with HealthKit/Google Fit data formats.",
        budget: 8000,
        timeline: "3 Months",
        skillsRequired: ["Node.js", "Redis", "PostgreSQL", "REST API"],
        postedBy: "demo-client-uid",
        status: "open"
      }
    ]);

    console.log("Creating an active project...");
    const activeProject = await Project.create({
      title: "Real-time Stock Trading Interface",
      description: "A high-performance trading dashboard with real-time price updates and interactive charts. Currently in the development phase focusing on the WebSocket integration.",
      techStack: ["Next.js", "Socket.io", "Chart.js", "D3.js"],
      projectType: "startup",
      createdBy: "demo-client-uid",
      teamMembers: ["demo-dev-uid"],
      status: "active",
      progress: 45,
      progressNotes: "WebSocket connectivity established. Working on interactive chart components."
    });

    console.log("Creating tasks...");
    await Task.insertMany([
      {
        title: "Connect to Binance WebSocket API",
        description: "Implement the backend listener for real-time BTC/USD price data.",
        status: "completed",
        priority: "high",
        projectId: activeProject._id,
        assignedTo: "demo-dev-uid",
        createdBy: "demo-admin-uid",
        deadline: new Date(Date.now() - 86400000 * 2) // 2 days ago
      },
      {
        title: "Build Sparkline Components",
        description: "Create lightweight SVG charts for the dashboard sidebar.",
        status: "in-progress",
        priority: "medium",
        projectId: activeProject._id,
        assignedTo: "demo-dev-uid",
        createdBy: "demo-admin-uid",
        deadline: new Date(Date.now() + 86400000 * 3) // 3 days from now
      },
      {
        title: "Optimize D3.js Rendering",
        description: "Ensure the main chart doesn't lag when handling 100+ data points per second.",
        status: "todo",
        priority: "low",
        projectId: activeProject._id,
        assignedTo: "demo-dev-uid",
        createdBy: "demo-admin-uid",
        deadline: new Date(Date.now() + 86400000 * 7) // 7 days from now
      }
    ]);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
