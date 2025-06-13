import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged, updateProfile } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCk8G-X2__KsABX8HM_hmSSpFuDg29dbN8",
  authDomain: "beat-the-books-183db.firebaseapp.com",
  projectId: "beat-the-books-183db",
  storageBucket: "beat-the-books-183db.appspot.com",
  messagingSenderId: "991881187689",
  appId: "1:991881187689:web:02fc088f8015734b13edf8",
  measurementId: "G-VYTTECV7ME",
  databaseURL: "https://beat-the-books-183db-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Add the project ID explicitly to avoid missing-project-id error
  app_project_id: 'beat-the-books-183db'
});

// Add additional scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Add error logging for database initialization
try {
  const connectedRef = ref(database, '.info/connected');
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log('✅ Connected to Firebase Realtime Database');
    } else {
      console.log('❌ Not connected to Firebase Realtime Database');
    }
  }, (error) => {
    console.error('Firebase connection error:', error);
  });
} catch (error) {
  console.error('Error initializing Firebase connection:', error);
}

export { 
  database, 
  auth, 
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
};
export default app;