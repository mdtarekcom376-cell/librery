import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export async function initFirebase(): Promise<{ auth: Auth; db: Firestore }> {
  if (auth && db) {
    return { auth, db };
  }

  try {
    const res = await fetch("/api/public/firebase-config");
    if (!res.ok) throw new Error("Failed to load Firebase config");
    const config = await res.json();

    if (!config.apiKey || !config.projectId) {
      throw new Error("Firebase config is incomplete");
    }

    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);

    return { auth, db };
  } catch (err) {
    console.warn("Firebase initialization failed:", err);
    throw err;
  }
}

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword };
