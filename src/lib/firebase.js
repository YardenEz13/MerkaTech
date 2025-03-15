// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGaXdlr4a9qiuDcWYdtSvFHnRi0x6QE4w",
  authDomain: "esp32-tank-98491.firebaseapp.com",
  databaseURL: "https://esp32-tank-98491-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "esp32-tank-98491",
  storageBucket: "esp32-tank-98491.firebasestorage.app",
  messagingSenderId: "791891509666",
  appId: "1:791891509666:web:116190342b660be98cb2fb",
  measurementId: "G-THLNQ6X457"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);