import firebase from 'firebase/app'
import 'firebase/firestore';
import 'firebase/storage'
import 'firebase/auth'

export const app = firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
});
