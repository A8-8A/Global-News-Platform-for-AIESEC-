// Firebase app + Storage initialisation.
//
// All config values come from environment variables so the same build
// can target any Firebase project without code changes.  Add the six
// VITE_FIREBASE_* vars to your .env (local) and to Firebase Hosting
// environment config / CI secrets (production).
//
// Storage bucket is set to the project's default:
//   <projectId>.firebasestorage.app
// Override with VITE_FIREBASE_STORAGE_BUCKET if you use a custom domain.

import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Avoid re-initialising if Vite HMR re-runs this module.
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const storage = getStorage(app);
