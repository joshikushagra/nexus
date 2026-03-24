import admin from "firebase-admin";
import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();

try {
  let cert;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const buff = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64");
    cert = JSON.parse(buff.toString("utf-8"));
  }

  admin.initializeApp({
    credential: cert ? admin.credential.cert(cert) : admin.credential.applicationDefault(),
  });
  console.log("Firebase Admin initialized");
} catch (error) {
  console.error("Firebase Admin initialization error:", error.message);
}

/**
 * Verifies the Firebase token and attaches the user's MongoDB role to req.user.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    let firebaseUID;

    if (["development", "test"].includes(process.env.NODE_ENV) && process.env.BYPASS_AUTH?.trim() === "true") {
      // In dev/bypass mode, treat the token string itself as the UID
      firebaseUID = idToken || "mock-firebase-uid";
      req.user = { uid: firebaseUID };
    } else {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      firebaseUID = decodedToken.uid;
      req.user = decodedToken;
    }

    // Attach role from MongoDB so downstream middleware can use req.user.role
    const dbUser = await User.findOne({ firebaseUID }).select("role").lean();
    if (dbUser) {
      req.user.role = dbUser.role;
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Middleware factory — restricts a route to users with specific roles.
 * Usage: router.get('/secret', verifyToken, restrictTo('founder'), handler)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};
