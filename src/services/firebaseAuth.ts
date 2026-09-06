import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  setPersistence,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use browserLocalPersistence and inMemoryPersistence instead of indexedDBLocalPersistence
// to completely prevent "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing"
// errors that occur in sandboxed iframes or partitioned storage.
export const auth: Auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
    });
  } catch {
    return getAuth(app);
  }
})();

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({ prompt: 'select_account' });

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onSuccess?: (user: FirebaseUser, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    const token = getGoogleAccessToken();
    if (user && token) {
      if (onSuccess) onSuccess(user, token);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onFailure) onFailure();
      }
    }
  });
};

export const signInWithGoogle = async (): Promise<{
  user: FirebaseUser;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;

    // Enforce persistence without IndexedDB
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {
      try {
        await setPersistence(auth, inMemoryPersistence);
      } catch {
        // ignore
      }
    }

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh akses token Google');
    }

    cachedAccessToken = credential.accessToken;
    setGoogleAccessToken(credential.accessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);

    if (err?.code === 'auth/popup-closed-by-user') {
      throw new Error('Jendela login Google ditutup sebelum proses selesai. Silakan coba lagi.');
    }
    if (err?.code === 'auth/popup-blocked') {
      throw new Error('Jendela pop-up login Google diblokir oleh browser. Harap izinkan pop-up.');
    }
    if (err?.code === 'auth/cancelled-popup-request') {
      throw new Error('Proses login Google dibatalkan karena ada permintaan baru.');
    }

    // Handle IDBDatabase connection closing error
    if (
      err?.message &&
      (err.message.includes('IDBDatabase') || err.message.includes('database connection is closing'))
    ) {
      try {
        await setPersistence(auth, inMemoryPersistence);
        const retryResult = await signInWithPopup(auth, provider);
        const retryCred = GoogleAuthProvider.credentialFromResult(retryResult);
        if (retryCred?.accessToken) {
          cachedAccessToken = retryCred.accessToken;
          setGoogleAccessToken(retryCred.accessToken);
          return { user: retryResult.user, accessToken: cachedAccessToken };
        }
      } catch (retryErr: any) {
        console.error('Retry Google Sign In Error:', retryErr);
        throw new Error(
          'Koneksi IndexedDB dibatasi di dalam iframe. Silakan buka aplikasi di tab baru untuk menghubungkan Google Spreadsheet.'
        );
      }
    }

    throw err;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = (): string | null => {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const saved = localStorage.getItem('lms_pjok_google_token');
    if (saved) {
      cachedAccessToken = saved;
      return saved;
    }
  } catch {
    // ignore
  }
  return null;
};

export const setGoogleAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      localStorage.setItem('lms_pjok_google_token', token);
    } else {
      localStorage.removeItem('lms_pjok_google_token');
    }
  } catch {
    // ignore
  }
};

export const googleSignOut = async () => {
  try {
    await signOut(auth);
  } finally {
    setGoogleAccessToken(null);
  }
};
