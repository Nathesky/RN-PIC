import {initializeApp} from "firebase/app";
import {getStorage} from "firebase/storage";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHt6EJZn7CI7vzD_k5YnbQoMAEjExh3go",
  authDomain: "photos-aecf4.firebaseapp.com",
  projectId: "photos-aecf4",
  storageBucket: "photos-aecf4.appspot.com",
  messagingSenderId: "703451523257",
  appId: "1:703451523257:web:bcab654520faf87d591368"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const fire = getFirestore(app);