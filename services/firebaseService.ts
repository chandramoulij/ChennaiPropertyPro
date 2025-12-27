import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, onDisconnect, set, runTransaction } from 'firebase/database';

// FALLBACKS: Used if the VPS .env file is missing or incorrectly formatted
const DEFAULT_DB_URL = "https://chennaipropertypro-2d67d-default-rtdb.asia-southeast1.firebasedatabase.app";
const DEFAULT_API_KEY = "AIzaSyANAY_fwXZeNEeaks7Q--fJZmyFE0IiuT8";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || DEFAULT_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "chennaipropertypro-2d67d.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || DEFAULT_DB_URL,
  projectId: process.env.FIREBASE_PROJECT_ID || "chennaipropertypro-2d67d",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "chennaipropertypro-2d67d.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "784327487204",
  appId: process.env.FIREBASE_APP_ID || "1:784327487204:web:139b382eaf1ab10a5186f1",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-W2GPV9H87V"
};

const app = initializeApp(firebaseConfig);

// CRITICAL: Explicitly set the database URL to handle the Regional Cluster (asia-southeast1)
export const db = getDatabase(app, firebaseConfig.databaseURL);

export const getFirebaseConfigStatus = () => {
  return {
    hasApiKey: !!firebaseConfig.apiKey,
    hasDbUrl: !!firebaseConfig.databaseURL,
    currentUrl: firebaseConfig.databaseURL
  };
};

export const checkDbConnection = async (): Promise<{ success: boolean; message: string; url: string }> => {
  try {
    const connectedRef = ref(db, ".info/connected");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ 
          success: false, 
          message: "Timeout: No response from Firebase cluster. Ensure your DB Rules are set to public.", 
          url: firebaseConfig.databaseURL 
        });
      }, 5000);

      onValue(connectedRef, (snap) => {
        clearTimeout(timeout);
        if (snap.val() === true) {
          resolve({ success: true, message: "Connected to Asia-SE1 Database", url: firebaseConfig.databaseURL });
        } else {
          resolve({ success: false, message: "Disconnected: Socket could not be established.", url: firebaseConfig.databaseURL });
        }
      }, { onlyOnce: true });
    });
  } catch (e: any) {
    return { success: false, message: `Init Error: ${e.message}`, url: firebaseConfig.databaseURL };
  }
};

export const subscribeToStats = (
  onOnlineUpdate: (count: number) => void,
  onViewsUpdate: (count: number) => void
) => {
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
    if (snap && snap.val()) {
      const val = snap.val();
      onOnlineUpdate(typeof val === 'object' ? Object.keys(val).length : 0);
    } else {
      onOnlineUpdate(0);
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const viewsRef = ref(db, `stats/views/${todayStr}`);

  runTransaction(viewsRef, (currentViews) => {
    return (currentViews || 0) + 1;
  });

  const unsubscribeViews = onValue(viewsRef, (snap) => {
    const val = snap.val();
    onViewsUpdate(val || 0);
  });

  return () => {
    unsubscribeConnected();
    unsubscribeOnline();
    unsubscribeViews();
  };
};