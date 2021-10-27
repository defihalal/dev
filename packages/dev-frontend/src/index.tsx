import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnT-bbTnIQ_pC1fr8Hjd56JIZVF6Qbqng",
  authDomain: "app-defihalal.firebaseapp.com",
  projectId: "app-defihalal",
  storageBucket: "app-defihalal.appspot.com",
  messagingSenderId: "160589954707",
  appId: "1:160589954707:web:60894da0c4e635bc47d766",
  measurementId: "G-XBFZ0WX2QJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
