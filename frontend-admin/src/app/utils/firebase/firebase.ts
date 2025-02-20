// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "meocamp-b6231.firebaseapp.com",
  projectId: "meocamp-b6231",
  storageBucket: "meocamp-b6231.appspot.com",
  messagingSenderId: "149549575885",
  appId: "1:149549575885:web:3fd3f396aa9debdd05c384",
  measurementId: "G-MXSBFMP1FB"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const uploadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `vehicles/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
// const analytics = getAnalytics(app);