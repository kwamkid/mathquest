// lib/utils/suppressConsoleError.ts

/**
 * Temporarily suppress console.error for Firebase Auth errors
 * This prevents red errors in the console for expected authentication failures
 */
export function suppressConsoleError() {
  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    // Check if it's a Firebase Auth error
    const errorString = args.join(' ');
    const isFirebaseAuthError = 
      errorString.includes('auth/invalid-credential') ||
      errorString.includes('auth/wrong-password') ||
      errorString.includes('auth/user-not-found') ||
      errorString.includes('auth/invalid-email') ||
      errorString.includes('FirebaseError');
    
    // If it's not a Firebase Auth error, show it
    if (!isFirebaseAuthError) {
      originalError.apply(console, args);
    }
  };
  
  // Return a function to restore the original console.error
  return () => {
    console.error = originalError;
  };
}