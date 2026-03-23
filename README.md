# Nexus — Client-Developer Collaboration Platform

Nexus is a scalable, production-ready SaaS platform designed to bridge the gap between clients and developers. It enables a complete workflow from project requirement posting to delivery and real-time collaboration.

---

## 🏗️ System Architecture

The project is built using a modern decoupled architecture:

- **Backend (`apps/api/`)**: Node.js & Express API with MongoDB (Mongoose) and Socket.io.
- **Client Portal (`apps/client-portal/`)**: Next.js application for Clients and Developers.
- **Admin Panel (`apps/admin-panel/`)**: Next.js management dashboard for platform administrators.
- **Authentication**: Firebase Authentication integration.
- **Real-time**: Socket.io for instant messaging and notifications.

---

## 🛠️ Local Setup Instructions

Follow these steps in order to get the entire platform running on your local machine.

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI.
- **Firebase Project**: A Firebase project with Authentication and Firestore enabled.

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd prototype

# Install dependencies for all services
cd apps/api && npm install
cd ../client-portal && npm install
cd ../admin-panel && npm install
```

### 3. Environment Configuration
You must create environment files for each service.

#### Backend (`apps/api/.env`)
```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/nexus
BYPASS_AUTH=true  # Set to true for local testing without Firebase
GITHUB_TOKEN=     # Optional: For GitHub Org integration
```

#### Client Portal (`apps/client-portal/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Admin Panel (`apps/admin-panel/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
# Firebase Configuration (Same as above)
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

### 4. Running the Services
Open three terminal windows and run each service:

**Terminal 1: Backend**
```bash
cd apps/api
npm run dev
```

**Terminal 2: Client Portal**
```bash
cd apps/client-portal
npm run dev
```

**Terminal 3: Admin Panel**
```bash
cd apps/admin-panel
npm run dev -- -p 3001
```

---

## 🚀 Core Platform Workflow

1.  **Requirement**: Clients post a work requirement.
2.  **Application**: Developers browse requirements and apply with a bid.
3.  **Hiring**: Clients review applications in the **Applications** tab and click **Hire**.
4.  **Project**: An accepted application automatically creates a **Project**.
5.  **Execution**: Team members collaborate via the **Task Board** and **Real-time Chat**.
6.  **Notifications**: Users receive instant alerts for message, task, and hiring events.

---

## 👥 User Roles
- **Admin**: Global monitoring, user management, and global dashboard.
- **Client Owner**: Post requirements, manage budget, hire developers.
- **Developer**: Apply for work, manage tasks, and communicate with clients.

---

## 🧪 Testing
The backend includes a comprehensive testing suite using Jest and Supertest.
```bash
cd apps/api
npm test
```

---

## 📡 Real-time Features
The platform uses **Socket.io** for:
- Project-specific chat rooms (`join_room` event).
- Instant in-app notifications (`notification_new` event).
- Real-time task status synchronization.

---

## 🔒 Security
- **RBAC**: Role-Based Access Control enforced on all sensitive API endpoints.
- **Validation**: Joi-based request validation for all data inputs.
- **Audit**: Updated dependencies to resolve critical vulnerabilities (Next.js SSRF, Firebase-Admin).
