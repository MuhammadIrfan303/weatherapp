// Import the functions you need from the correct SDK modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDx-pdLmk01Tb8lOB2NzajKQ-dto8AiK-Y",
    authDomain: "weatherapp-6e7ce.firebaseapp.com",
    projectId: "weatherapp-6e7ce",
    storageBucket: "weatherapp-6e7ce.appspot.com",  // Fixed the storageBucket URL
    messagingSenderId: "352058177377",
    appId: "1:352058177377:web:229e13b8b7f7e6398b3720"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export the services
export { db, auth, provider };