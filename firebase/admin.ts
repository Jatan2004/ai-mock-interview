import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function sanitizePrivateKey(rawKey?: string): string | undefined {
  if (!rawKey) return undefined;
  let key = rawKey.trim();

  // Remove surrounding quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Remove trailing comma if mistakenly appended
  if (key.endsWith(",")) {
    key = key.slice(0, -1);
  }

  // Convert literal \n sequences to actual newlines
  key = key.replace(/\\n/g, "\n");

  return key;
}

// Singleton to ensure Firebase is only initialized once
let firebaseAdmin: { auth: any; db: any } | null = null;

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  const apps = getApps();

  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
  }

  const firestore = getFirestore();
  
  // Only set settings if they haven't been set before
  try {
    firestore.settings({ ignoreUndefinedProperties: true });
  } catch (error) {
    // Settings already applied, ignore
    console.log("Firestore settings already applied");
  }

  firebaseAdmin = {
    auth: getAuth(),
    db: firestore,
  };

  return firebaseAdmin;
}

export const { auth, db } = initFirebaseAdmin();
