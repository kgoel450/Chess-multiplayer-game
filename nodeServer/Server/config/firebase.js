require("dotenv").config();
const { initializeApp } = require("firebase/app");
const admin = require('firebase-admin');
const serviceAccount = require("./firebaseService.json");

// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
//   measurementId: process.env.FIREBASE_MEASUREMENT_ID
// };
const firebaseConfig = {
  apiKey: "AIzaSyBWLIJVu8rLKdenJ4MvUtha6F6-m8uPHQk",
  authDomain: "chess-eadc1.firebaseapp.com",
  projectId: "chess-eadc1",
  storageBucket: "chess-eadc1.appspot.com",
  messagingSenderId: "1028354129345",
  appId: "1:1028354129345:web:dd729d23f1be4409b64340",
  measurementId: "G-CZWCM0CYNL"
};
const fireApp = initializeApp(firebaseConfig);


console.log(process.env.FIREBASE_API_KEY);
const adminFireApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
module.exports = {fireApp, adminFireApp};