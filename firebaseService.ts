
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, onDisconnect, set, runTransaction } from 'firebase/database';
import { getStorage } from 'firebase/storage';

/**
 * FIREBASE CONFIGURATION
 * These values are injected by Vite from your .env file.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || "",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || ""
};

// Check if config is actually loaded
const isConfigAvailable = !!firebaseConfig.apiKey && !!firebaseConfig.databaseURL;

if (!isConfigAvailable) {
  console.warn("Firebase config not found. If this is a local preview, ensure VITE_FIREBASE_... variables are set.");
}

// Initialize Firebase only if we have a config, otherwise export dummies to prevent crashes
const app = isConfigAvailable ? initializeApp(firebaseConfig) : null;

export const db = app ? getDatabase(app) : ({} as any);
export const storage = app ? getStorage(app) : ({} as any);

export const checkDbConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!app) return { success: false, message: "Firebase not initialized" };
  
  try {
    const connectedRef = ref(db, ".info/connected");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, message: "Connection timeout" });
      }, 5000);

      onValue(connectedRef, (snap) => {
        clearTimeout(timeout);
        if (snap.val() === true) {
          resolve({ success: true, message: "Connected" });
        } else {
          resolve({ success: false, message: "Disconnected" });
        }
      }, { onlyOnce: true });
    });
  } catch (e: any) {
    return { success: false, message: e.message };
  }
};

export const subscribeToStats = (
  onOnlineUpdate: (count: number) => void,
  onViewsUpdate: (count: number) => void
) => {
  if (!app || !isConfigAvailable) return () => {};

  try {
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
  } catch (e) {
    console.error("Stats subscription failed:", e);
    return () => {};
  }
};
