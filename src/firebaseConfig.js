import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCk8G-X2__KsABX8HM_hmSSpFuDg29dbN8",
  authDomain: "beat-the-books-183db.firebaseapp.com",
  projectId: "beat-the-books-183db",
  storageBucket: "beat-the-books-183db.firebasestorage.app",
  messagingSenderId: "991881187689",
  appId: "1:991881187689:web:02fc088f8015734b13edf8",
  measurementId: "G-VYTTECV7ME",
  databaseURL: "https://beat-the-books-183db-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Add error logging for database initialization
const connectedRef = ref(database, '.info/connected');
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log('✅ Connected to Firebase Realtime Database');
  } else {
    console.log('❌ Not connected to Firebase Realtime Database');
  }
});

export { database };
export default app;
