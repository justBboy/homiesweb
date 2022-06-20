import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { connectAuthEmulator, getAuth, RecaptchaVerifier } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { connectStorageEmulator, getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDKnD-Z31YFqJSHEZ7eCNkZUEPowNjGtWc",
  authDomain: "homiezfoods.firebaseapp.com",
  projectId: "homiezfoods",
  storageBucket: "homiezfoods.appspot.com",
  messagingSenderId: "115752947956",
  appId: "1:115752947956:web:9cab1e2a032e45aacb8ea1",
  measurementId: "G-X9DVGTYCGW"
};

let analytics;

const app = initializeApp(firebaseConfig);

if(app.name && typeof window !== "undefined")
  analytics = getAnalytics(app)

export const auth = getAuth(app)
connectAuthEmulator(auth, "http://localhost:9099")
export const db = getFirestore(app)
connectFirestoreEmulator(db, "localhost", 8080)
export const storage = getStorage(app)
connectStorageEmulator(storage, "localhost", 9199)
