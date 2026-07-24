import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS!),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  app = getApps()[0];
}

export const adminDb: Firestore = getFirestore(app);
