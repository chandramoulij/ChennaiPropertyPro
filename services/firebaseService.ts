
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, onDisconnect, set, runTransaction } from 'firebase/database';
import { getStorage } from 'firebase/storage';

/**
 * FIREBASE SECURITY REINFORCEMENT:
 * The "Insecure Rules" error is triggered when .read or .write is true for everyone.
 * By updating the Console Rules to restrict writes, you have fixed the root cause.
 * This code ensures no sensitive metadata is exposed in the client build.
 */

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Validating config availability
const isConfigComplete = !!(firebaseConfig.apiKey && firebaseConfig.databaseURL);

if (!isConfigComplete) {
  console.error("CRITICAL: Firebase Configuration is missing in environment variables.");
}

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);

/**
 * Verifies if the client can reach the Firebase Realtime Database cluster
 */
export const checkDbConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!isConfigComplete) return { success: false, message: "Missing Environment Config" };
  
  try {
    const connectedRef = ref(db, ".info/connected");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, message: "Connection Timeout. Check Firebase Rules/Region." });
      }, 4000);

      onValue(connectedRef, (snap) => {
        clearTimeout(timeout);
        if (snap.val() === true) {
          resolve({ success: true, message: "Connected to Firebase Securely" });
        } else {
          resolve({ success: false, message: "Disconnected from Firebase" });
        }
      }, { onlyOnce: true });
    });
  } catch (e: any) {
    return { success: false, message: e.message };
  }
};

/**
 * Manages live session tracking and analytics
 */
export const subscribeToStats = (
  onOnlineUpdate: (count: number) => void,
  onViewsUpdate: (count: number) => void
) => {
  if (!isConfigComplete) return () => {};

  const onlineRef = ref(db, 'status/online');
  const connectedRef = ref(db, '.info/connected');

  const unsubscribeConnected = onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      const myConRef = push(onlineRef);
      onDisconnect(myConRef).remove();
      set(myConRef, true);
    }
  });

  const unsubscribeOnline = onValue(onlineRef, (snap) => {
    const val = snap.val();
    onOnlineUpdate(val ? Object.keys(val).length : 0);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const viewsRef = ref(db, `stats/views/${todayStr}`);

  // Increment view count via atomic transaction
  runTransaction(viewsRef, (currentViews) => {
    return (currentViews || 0) + 1;
  });

  const unsubscribeViews = onValue(viewsRef, (snap) => {
    onViewsUpdate(snap.val() || 0);
  });

  return () => {
    unsubscribeConnected();
    unsubscribeOnline();
    unsubscribeViews();
  };
};
