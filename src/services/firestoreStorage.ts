import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { MockTest, TestAttempt, TeacherAccount } from '../types';
import { saveTests, getStoredTests, saveAttempt as saveLocalAttempt, getStoredAttempts } from './storage';
import { cleanTestId } from '../utils/cleanTestId';

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

  const target = cleanTestId(testId) || testId;

  // First check local storage / memory with flexible matching
  const localTests = getStoredTests();
  const localMatch = localTests.find((t) => {
    if (!t || !t.id) return false;
    const tClean = cleanTestId(t.id);
    return (
      t.id === target ||
      t.id === testId ||
      (tClean && tClean === target) ||
      t.id.toLowerCase() === target.toLowerCase() ||
      t.id.replace(/[^a-zA-Z0-9]/g, '') === target.replace(/[^a-zA-Z0-9]/g, '')
    );
  });
  if (localMatch) return localMatch;

  // Query Firestore Cloud DB
  try {
    if (db) {
      // 1. Try direct doc ID
      let docRef = doc(db, TESTS_COLLECTION, target);
      let docSnap = await getDoc(docRef);

      if (!docSnap.exists() && testId !== target) {
        docRef = doc(db, TESTS_COLLECTION, testId);
        docSnap = await getDoc(docRef);
      }

      if (docSnap.exists()) {
        const cloudTest = docSnap.data() as MockTest;
        const currentLocal = getStoredTests();
        if (!currentLocal.some((t) => t.id === cloudTest.id)) {
          saveTests([cloudTest, ...currentLocal]);
        }
        return cloudTest;
      }

      // 2. Fallback: Query all tests collection in case doc ID format differs
      const collRef = collection(db, TESTS_COLLECTION);
      const querySnap = await getDocs(collRef);
      let found: MockTest | null = null;
      querySnap.forEach((dSnap) => {
        if (dSnap.exists()) {
          const tData = dSnap.data() as MockTest;
          if (
            tData &&
            tData.id &&
            (tData.id === target ||
              tData.id === testId ||
              cleanTestId(tData.id) === target ||
              tData.id.replace(/[^a-zA-Z0-9]/g, '') === target.replace(/[^a-zA-Z0-9]/g, ''))
          ) {
            found = tData;
          }
        }
      });

      if (found) {
        const currentLocal = getStoredTests();
        if (!currentLocal.some((t: MockTest) => t.id === (found as MockTest).id)) {
          saveTests([found, ...currentLocal]);
        }
        return found;
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
