import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
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
} from '../firebaseConfig';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebaseConfig';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to sign up with email and password
  async function signup(email, password, displayName) {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Create user profile in the database
      await saveUserToDatabase(userCredential.user, displayName);
      
      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      setError(getReadableErrorMessage(error));
      throw error;
    }
  }

  // Function to log in with email and password
  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      setError(getReadableErrorMessage(error));
      throw error;
    }
  }

  // Function to log in with Google
  async function loginWithGoogle() {
    try {
      setError('');
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Check if this is a new user
      const isNewUser = userCredential._tokenResponse.isNewUser;
      
      if (isNewUser) {
        // Save user to database if they're new
        await saveUserToDatabase(userCredential.user, userCredential.user.displayName);
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Google login error:', error);
      setError(getReadableErrorMessage(error));
      throw error;
    }
  }

  // Function to log out
  async function logout() {
    try {
      setError('');
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      setError(getReadableErrorMessage(error));
      throw error;
    }
  }

  // Function to reset password
  async function resetPassword(email) {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(getReadableErrorMessage(error));
      throw error;
    }
  }

  // Function to save user data to the database
  async function saveUserToDatabase(user, displayName) {
    try {
      const userRef = ref(database, `users/${user.uid}`);
      
      // Check if user already exists
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // Create new user profile
        await set(userRef, {
          email: user.email,
          displayName: displayName || user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: user.emailVerified
        });
      } else {
        // Update last login time
        await set(userRef, {
          ...snapshot.val(),
          lastLogin: new Date().toISOString(),
          emailVerified: user.emailVerified
        });
      }
    } catch (error) {
      console.error('Error saving user to database:', error);
      throw error;
    }
  }

  // Helper function to convert Firebase error codes to readable messages
  function getReadableErrorMessage(error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or try logging in.';
      case 'auth/invalid-email':
        return 'The email address is not valid. Please enter a valid email.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password (at least 6 characters).';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing the sign in. Please try again.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups for this website.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials. Try signing in using a different method.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/requires-recent-login':
        return 'This operation requires a more recent login. Please log out and log back in.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later or reset your password.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // Set up an observer for changes to the user's sign-in state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up the observer when the component unmounts
    return unsubscribe;
  }, []);

  // The value object that will be provided to components that use this context
  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    error,
    setError,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
