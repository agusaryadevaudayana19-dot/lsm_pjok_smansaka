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
  browserPopupRedirectResolver,
  setPersistence,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use browserPopupRedirectResolver and safe non-IndexedDB persistence
// to prevent "auth/argument-error" and IndexedDB closing errors in iframes
export const auth: Auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
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

    // Enforce persistence if supported
    try {
      if (typeof window !== 'undefined') {
        await setPersistence(auth, browserLocalPersistence).catch(() => {});
      }
    } catch {
      // ignore
    }

    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
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
    if (err?.code === 'auth/unauthorized-domain') {
      throw new Error('Domain belum diotorisasi di Firebase Authentication Console.');
    }
    if (err?.code === 'auth/argument-error') {
      throw new Error('Konfigurasi autentikasi peramban tidak sesuai. Silakan buka aplikasi di tab baru.');
    }

    // Handle IDBDatabase connection closing error
    if (
      err?.message &&
      (err.message.includes('IDBDatabase') || err.message.includes('database connection is closing'))
    ) {
      try {
        await setPersistence(auth, inMemoryPersistence).catch(() => {});
        const retryResult = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
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
