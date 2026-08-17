import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKFn810HZLDfh2XN_iVZPfU5pMf-2c3_Q",
  authDomain: "agobrand-fa8e8.firebaseapp.com",
  projectId: "agobrand-fa8e8",
  storageBucket: "agobrand-fa8e8.firebasestorage.app",
  messagingSenderId: "581871100676",
  appId: "1:581871100676:web:8032bc3948eab2089d6651",
};

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);