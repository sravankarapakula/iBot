// src/firebaseStub.js
// Temporary stubbed social auth functions to prevent runtime crashes.
// Replace with your actual Firebase auth logic when ready.

export async function signInWithGoogle() {
  // As a placeholder, open Google's signin in a new tab.
  // Real integration must use OAuth flow and redirect URIs.
  window.open("https://accounts.google.com/signin", "_blank", "noopener");
  return Promise.resolve();
}

export async function signInWithFacebook() {
  window.open("https://www.facebook.com/login.php", "_blank", "noopener");
  return Promise.resolve();
}

export async function signInWithApple() {
  window.open("https://appleid.apple.com/auth/authorize", "_blank", "noopener");
  return Promise.resolve();
}
