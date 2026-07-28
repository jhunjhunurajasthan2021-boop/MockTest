import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { MockTest, TestAttempt, TeacherAccount } from '../types';
import { saveTests, getStoredTests, saveAttempt as saveLocalAttempt, getStoredAttempts } from './storage';

const TESTS_COLLECTION = 'tests';
const ATTEMPTS_COLLECTION = 'attempts';
const TEACHERS_COLLECTION = 'teachers';

// Save or Update Test in Firestore & LocalStorage
export async function saveTestCloud(test: MockTest): Promise<void> {
  try {
    // 1. Save to localStorage immediately for instant offline/local rendering
    const localTests = getStoredTests();
    const existingIdx = localTests.findIndex((t) => t.id === test.id);
    let updated: MockTest[];
    if (existingIdx >= 0) {
      updated = [...localTests];
      updated[existingIdx] = test;
    } else {
      updated = [test, ...localTests];
    }
    saveTests(updated);

    // 2. Persist to Firestore Cloud DB
    if (db) {
      const docRef = doc(db, TESTS_COLLECTION, test.id);
      await setDoc(docRef, JSON.parse(JSON.stringify(test)), { merge: true });
      console.log(`[Cloud Storage] Saved test ${test.id} to Firestore`);
    }
  } catch (err) {
    console.warn('[Cloud Storage] Failed to save test to Firestore, falling back to localStorage:', err);
  }
}

// Fetch single test by ID from Firestore Cloud DB
export async function fetchTestCloud(testId: string): Promise<MockTest | null> {
  if (!testId) return null;

  // First check local storage / memory
  const localTests = getStoredTests();
  const localMatch = localTests.find((t) => t.id === testId);
  if (localMatch) return localMatch;

  // Query Firestore Cloud DB
  try {
    if (db) {
      const docRef = doc(db, TESTS_COLLECTION, testId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudTest = docSnap.data() as MockTest;
        // Save to local storage as cache
        const currentLocal = getStoredTests();
        if (!currentLocal.some((t) => t.id === cloudTest.id)) {
          saveTests([cloudTest, ...currentLocal]);
        }
        return cloudTest;
      }
    }
  } catch (err) {
    console.warn(`[Cloud Storage] Error fetching test ${testId} from Firestore:`, err);
  }

  return null;
}

// Fetch all published tests from Firestore Cloud DB and merge with local storage
export async function fetchAllTestsCloud(): Promise<MockTest[]> {
  const localTests = getStoredTests();
  try {
    if (db) {
      const collRef = collection(db, TESTS_COLLECTION);
      const snapshot = await getDocs(collRef);
      const cloudTests: MockTest[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          cloudTests.push(docSnap.data() as MockTest);
        }
      });

      if (cloudTests.length > 0) {
        // Merge cloud tests with local tests
        const mergedMap = new Map<string, MockTest>();
        localTests.forEach((t) => mergedMap.set(t.id, t));
        cloudTests.forEach((t) => mergedMap.set(t.id, t));
        const mergedList = Array.from(mergedMap.values());
        saveTests(mergedList);
        return mergedList;
      }
    }
  } catch (err) {
    console.warn('[Cloud Storage] Error fetching all tests from Firestore:', err);
  }

  return localTests;
}

// Save student attempt to Firestore Cloud DB
export async function saveAttemptCloud(attempt: TestAttempt): Promise<void> {
  saveLocalAttempt(attempt);
  try {
    if (db) {
      const docRef = doc(db, ATTEMPTS_COLLECTION, attempt.id);
      await setDoc(docRef, JSON.parse(JSON.stringify(attempt)), { merge: true });
    }
  } catch (err) {
    console.warn('[Cloud Storage] Failed to save attempt to Firestore:', err);
  }
}

// Fetch attempts for a test from Firestore Cloud DB
export async function fetchAttemptsCloud(testId?: string): Promise<TestAttempt[]> {
  const localAttempts = getStoredAttempts();
  try {
    if (db) {
      const collRef = collection(db, ATTEMPTS_COLLECTION);
      const q = testId ? query(collRef, where('testId', '==', testId)) : collRef;
      const snapshot = await getDocs(q);
      const cloudAttempts: TestAttempt[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          cloudAttempts.push(docSnap.data() as TestAttempt);
        }
      });

      if (cloudAttempts.length > 0) {
        const mergedMap = new Map<string, TestAttempt>();
        localAttempts.forEach((a) => mergedMap.set(a.id, a));
        cloudAttempts.forEach((a) => mergedMap.set(a.id, a));
        return Array.from(mergedMap.values());
      }
    }
  } catch (err) {
    console.warn('[Cloud Storage] Error fetching attempts from Firestore:', err);
  }

  return localAttempts;
}

// Delete test from Firestore Cloud DB
export async function deleteTestCloud(testId: string): Promise<void> {
  try {
    if (db) {
      const docRef = doc(db, TESTS_COLLECTION, testId);
      await deleteDoc(docRef);
    }
  } catch (err) {
    console.warn(`[Cloud Storage] Failed to delete test ${testId} from Firestore:`, err);
  }
}
