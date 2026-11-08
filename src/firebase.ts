import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type FirebaseStorage,
} from "firebase/storage";
import type { Product, StoreSettings, CategoryItem } from "./components/AdminPanel";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBiTqJs5fpMjlLU5bQH8ZUfDWHi3dvS-Hg",
  authDomain: "shambhavi-a2220.firebaseapp.com",
  projectId: "shambhavi-a2220",
  storageBucket: "shambhavi-a2220.firebasestorage.app",
  messagingSenderId: "717198386078",
  appId: "1:717198386078:web:048fe024cbd5ae307d6c8f",
};

const STORAGE_KEY_FIREBASE_CONFIG = "shambhavi_firebase_config_v1";

/**
 * Retrieve active Firebase config from either localStorage, Vite env, or default project.
 */
export function getStoredFirebaseConfig(): FirebaseConfig {
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (fromStorage) {
      const parsed = JSON.parse(fromStorage);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading stored Firebase config", e);
  }

  // Fallback to Vite environment variables if defined
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  // Active production Firebase project for Shambhavi
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveStoredFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  cachedApp = null;
  cachedDb = null;
  cachedStorage = null;
}

export function clearStoredFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
  cachedApp = null;
  cachedDb = null;
  cachedStorage = null;
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedStorage: FirebaseStorage | null = null;

export function getFirebaseInstance(): {
  app: FirebaseApp;
  db: Firestore;
  storage: FirebaseStorage;
} {
  const config = getStoredFirebaseConfig();

  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(config);
  }
  if (!cachedDb && cachedApp) {
    cachedDb = getFirestore(cachedApp);
  }
  if (!cachedStorage && cachedApp) {
    cachedStorage = getStorage(cachedApp);
  }

  return { app: cachedApp!, db: cachedDb!, storage: cachedStorage! };
}

/**
 * Upload an image file to Firebase Storage with progress tracking.
 * Returns the public HTTPS download URL.
 */
export async function uploadProductImageToStorage(
  file: File,
  folder = "products",
  onProgress?: (percent: number) => void
): Promise<string> {
  const { storage } = getFirebaseInstance();

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || "image/jpeg",
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Real-time listener for products collection in Firestore.
 */
export function subscribeToFirestoreProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const { db } = getFirebaseInstance();
    const colRef = collection(db, "products");

    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as Product), id: docSnap.id });
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (err) => {
        console.warn("Firestore products listener note:", err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn("Could not start Firestore products subscription:", err);
    return () => {};
  }
}

/**
 * Save or update a product in Firestore.
 */
export async function syncProductToFirestore(product: Product): Promise<void> {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, "products", product.id);
    await setDoc(docRef, product, { merge: true });
  } catch (err) {
    console.warn("Firestore product save note:", err);
  }
}

/**
 * Delete a product from Firestore.
 */
export async function removeProductFromFirestore(productId: string): Promise<void> {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, "products", productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore product delete note:", err);
  }
}

/**
 * Save Store Settings to Firestore.
 */
export async function syncStoreSettingsToFirestore(settings: StoreSettings): Promise<void> {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, "settings", "store_config");
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.warn("Firestore settings save note:", err);
  }
}

/**
 * Real-time listener for Store Settings.
 */
export function subscribeToFirestoreSettings(
  onUpdate: (settings: StoreSettings) => void
): () => void {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, "settings", "store_config");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as StoreSettings);
      }
    });
  } catch (err) {
    console.warn("Could not start Firestore settings subscription:", err);
    return () => {};
  }
}

/**
 * Sync entire local catalog & categories to Firestore (one-click migration)
 */
export async function seedAllToFirestore(
  products: Product[],
  categories: CategoryItem[],
  settings: StoreSettings
): Promise<number> {
  const { db } = getFirebaseInstance();

  // Sync settings
  await syncStoreSettingsToFirestore(settings);

  // Sync categories
  const catDoc = doc(db, "settings", "categories");
  await setDoc(catDoc, { items: categories });

  // Sync products
  let synced = 0;
  for (const product of products) {
    const pDoc = doc(db, "products", product.id);
    await setDoc(pDoc, product, { merge: true });
    synced++;
  }

  return synced;
}

/**
 * Check if Firestore has existing products
 */
export async function countFirestoreProducts(): Promise<number> {
  try {
    const { db } = getFirebaseInstance();
    const colRef = collection(db, "products");
    const snap = await getDocs(colRef);
    return snap.size;
  } catch (e) {
    return 0;
  }
}

/**
 * Auto-seed Firestore on initial launch if collection is empty
 */
export async function autoSeedIfEmpty(
  products: Product[],
  categories: CategoryItem[],
  settings: StoreSettings
) {
  try {
    const count = await countFirestoreProducts();
    if (count === 0 && products.length > 0) {
      await seedAllToFirestore(products, categories, settings);
    }
  } catch (err) {
    console.warn("Auto-seed check note:", err);
  }
}
