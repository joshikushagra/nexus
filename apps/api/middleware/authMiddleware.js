import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Since we cannot securely commit a service account JSON, we expect it either 
// as an environment variable or a local file omitted from version control.
// Example minimal init if variables are provided:
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
 * Middleware to verify Firebase Auth token and attach firebaseUID to request.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];
    
    // During local development without Firebase variables, we might bypass or mock this
    if (process.env.NODE_ENV === "development" && process.env.BYPASS_AUTH === "true") {
      req.user = { uid: "mock-firebase-uid" }; 
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // sets req.user.uid (which maps to our firebaseUID)
    
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
