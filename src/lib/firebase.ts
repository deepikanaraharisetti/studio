
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAITa6yIQd2NWdrQVXG62Pd_BLoixG5eM8",
  authDomain: "studio-1373398294-3404b.firebaseapp.com",
  projectId: "studio-1373398294-3404b",
  storageBucket: "studio-1373398294-3404b.appspot.com",
  messagingSenderId: "73356956617",
  appId: "1:73356956617:web:73c7cc1b1fb64476be4e18"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
