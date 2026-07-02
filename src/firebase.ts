import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  setDoc, 
  doc 
} from 'firebase/firestore';

// Load credentials from the generated configuration file
const firebaseConfig = {
  projectId: "gen-lang-client-0086542118",
  appId: "1:549606272242:web:d53a4916792f6eed43f46b",
  apiKey: "AIzaSyBMThYqMqN651eFHaAaw-z0uU8kkT8EAt4",
  authDomain: "gen-lang-client-0086542118.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-485fe82e-8929-4be1-a0f4-efb34a44eb98",
  storageBucket: "gen-lang-client-0086542118.firebasestorage.app",
  messagingSenderId: "549606272242",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth Helpers
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

// Firestore saving helpers with local-storage sync fallbacks
export async function saveUserPlanner(userId: string, plannerData: any) {
  try {
    const docRef = doc(db, 'planners', userId);
    await setDoc(docRef, {
      ...plannerData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn("Firestore save failed, caching locally:", error);
    localStorage.setItem(`smartbasket_planner_${userId}`, JSON.stringify(plannerData));
  }
}

export async function getUserPlanner(userId: string) {
  try {
    const docRef = doc(db, 'planners', userId);
    // Dynamic import to avoid type issues if needed
    const { getDoc } = await import('firebase/firestore');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.warn("Firestore fetch failed, checking local cache:", error);
  }
  const cached = localStorage.getItem(`smartbasket_planner_${userId}`);
  return cached ? JSON.parse(cached) : null;
}
