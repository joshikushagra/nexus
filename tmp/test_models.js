import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "apps/api/.env" });

import User from "../apps/api/models/User.js";
import Project from "../apps/api/models/Project.js";
import Task from "../apps/api/models/Task.js";
import Notification from "../apps/api/models/Notification.js";
import Application from "../apps/api/models/Application.js";
import ChatRoom from "../apps/api/models/ChatRoom.js";
import Message from "../apps/api/models/Message.js";

console.log("All models imported successfully.");

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");
        
        const userCount = await User.countDocuments();
        console.log("User count:", userCount);
        
        process.exit(0);
    } catch (err) {
        console.error("Error in test script:", err);
        process.exit(1);
    }
};

run();
