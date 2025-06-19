import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQk6vG03mu0C1jz2KBf5e0N0NwaIKgJm4",
  authDomain: "artguard-94a84.firebaseapp.com",
  projectId: "artguard-94a84",
  storageBucket: "artguard-94a84.firebasestorage.app",
  messagingSenderId: "855874658805",
  appId: "1:855874658805:web:d4359c86c70ca437ec00bc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };