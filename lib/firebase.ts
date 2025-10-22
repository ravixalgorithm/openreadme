import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Only initialize Firebase if we have the required configuration
let storage: any = null;

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (apiKey && projectId) {
    const firebaseConfig = {
        apiKey: apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    try {
        const app = initializeApp(firebaseConfig);
        storage = getStorage(app);
    } catch (error) {
        console.warn("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase configuration is incomplete. Some features may not work.");
}

export { storage };