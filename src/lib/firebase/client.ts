import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase config
if (!firebaseConfig.apiKey) {
  // Log an error instead of throwing to prevent immediate crash.
  // Firebase services will likely fail later, but the app might render partially.
  console.error(
    "Firebase API key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. Using placeholder. Firebase will not work correctly. Please check your environment variables."
  );
  // Use a placeholder to allow initialization to proceed further,
  // although Firebase operations requiring a valid key will fail.
  firebaseConfig.apiKey = "MISSING_API_KEY_PLACEHOLDER";
}
if (!firebaseConfig.projectId) {
    console.warn(
        "Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing. Some Firebase services might not work correctly."
    );
}


// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    console.error("Firebase initialization failed:", error);
    // Log the specific invalid API key error if that's the cause
    if (error.code === 'auth/invalid-api-key') {
       console.error(`Firebase initialization failed: Invalid API Key detected. Please check NEXT_PUBLIC_FIREBASE_API_KEY.`);
    }
    // Do not re-throw here to potentially allow the app to continue partially
    // throw error;
  }
} else {
  app = getApp();
}


let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

// Attempt to initialize services only if app initialization was potentially successful
if (app) {
    try {
       auth = getAuth(app);
    } catch (error) {
        console.error("Failed to initialize Firebase Authentication:", error);
    }
    try {
       db = getFirestore(app);
    } catch (error) {
        console.error("Failed to initialize Firestore:", error);
    }
    try {
       storage = getStorage(app);
    } catch (error) {
        console.error("Failed to initialize Firebase Storage:", error);
    }
} else {
    console.error("Firebase app initialization failed earlier. Firebase services (Auth, Firestore, Storage) will not be available.");
}


export { app, auth, db, storage };

    