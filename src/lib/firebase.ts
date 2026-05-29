import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDFpF8yXU0a8lxgQ-GnnrKDJRomXJPqZJk",
  authDomain: "dairy-os-app.firebaseapp.com",
  projectId: "dairy-os-app",
  storageBucket: "dairy-os-app.firebasestorage.app",
  messagingSenderId: "47485852012",
  appId: "1:47485852012:web:4fc7c91913ae4c0ab8fb49",
  measurementId: "G-GL8CK2PLK7"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
