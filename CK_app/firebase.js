import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfHEWoaKuz8fiMKojoTEeJWMUzJDgiuVU",
  authDomain: "ck-app-database.firebaseapp.com",
  projectId: "ck-app-database",
  storageBucket: "ck-app-database.appspot.com",
  messagingSenderId: "253500838094",
  appId: "1:253500838094:web:b6bfcf4975f3323ab8c09f",
  measurementId: "G-T79H6D7WRT",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export let analytics;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});
