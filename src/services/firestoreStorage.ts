import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { MockTest, TestAttempt, TeacherAccount, LandingPlatformConfig } from '../types';
import {
  saveTests,
  getStoredTests,
  saveAttempt as saveLocalAttempt,
  getStoredAttempts,
  getDeletedTestIds,
  addDeletedTestId,
  removeDeletedTestId,
  getDeletedTeacherIds,
  addDeletedTeacherId,
  removeDeletedTeacherId,
  getStoredTeachers,
  saveTeachers,
  deleteTeacher as storageDeleteTeacher,
  savePlatformConfig,
  getPlatformConfig,
} from './storage';
import { cleanTestId } from '../utils/cleanTestId';

const TESTS_COLLECTION = 'tests';
const ATTEMPTS_COLLECTION = 'attempts';
const TEACHERS_COLLECTION = 'teachers';
const CONFIG_COLLECTION = 'config';
const PLATFORM_CONFIG_DOC_ID = 'platform_main';

// Save or Update Test in Firestore & LocalStorage
export async function saveTestCloud(test: MockTest): Promise<void> {
  try {
    // Un-mark test from deleted IDs list if re-saving
    removeDeletedTestId(test.id);
    const cleaned = cleanTestId(test.id);
    if (cleaned) removeDeletedTestId(cleaned);

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
  const deletedIds = getDeletedTestIds();
  if (deletedIds.includes(testId) || deletedIds.includes(target)) {
    return null;
  }

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
        if (!deletedIds.includes(cloudTest.id) && !deletedIds.includes(cleanTestId(cloudTest.id))) {
          const currentLocal = getStoredTests();
          if (!currentLocal.some((t) => t.id === cloudTest.id)) {
            saveTests([cloudTest, ...currentLocal]);
          }
          return cloudTest;
        }
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
            !deletedIds.includes(tData.id) &&
            !deletedIds.includes(cleanTestId(tData.id)) &&
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
  const deletedIds = getDeletedTestIds();
  try {
    if (db) {
      const collRef = collection(db, TESTS_COLLECTION);
      const snapshot = await getDocs(collRef);
      const cloudTests: MockTest[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          const tData = docSnap.data() as MockTest;
          if (tData && tData.id && !deletedIds.includes(tData.id) && !deletedIds.includes(cleanTestId(tData.id))) {
            cloudTests.push(tData);
          }
        }
      });

      const mergedMap = new Map<string, MockTest>();
      localTests.forEach((t) => {
        if (!deletedIds.includes(t.id) && !deletedIds.includes(cleanTestId(t.id))) {
          mergedMap.set(t.id, t);
        }
      });
      cloudTests.forEach((t) => mergedMap.set(t.id, t));
      const mergedList = Array.from(mergedMap.values());
      saveTests(mergedList);
      return mergedList;
    }
  } catch (err) {
    console.warn('[Cloud Storage] Error fetching all tests from Firestore:', err);
  }

  return localTests.filter((t) => !deletedIds.includes(t.id));
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
  addDeletedTestId(testId);
  const cleaned = cleanTestId(testId);
  if (cleaned) addDeletedTestId(cleaned);

  try {
    if (db) {
      const docRef = doc(db, TESTS_COLLECTION, testId);
      await deleteDoc(docRef);
      if (cleaned && cleaned !== testId) {
        const docRefClean = doc(db, TESTS_COLLECTION, cleaned);
        await deleteDoc(docRefClean);
      }
    }
  } catch (err) {
    console.warn(`[Cloud Storage] Failed to delete test ${testId} from Firestore:`, err);
  }
}

// Save or Update Teacher in Firestore
export async function saveTeacherCloud(teacher: TeacherAccount): Promise<void> {
  try {
    removeDeletedTeacherId(teacher.id);
    removeDeletedTeacherId(teacher.email);
    if (db) {
      const docRef = doc(db, TEACHERS_COLLECTION, teacher.id);
      await setDoc(docRef, JSON.parse(JSON.stringify(teacher)), { merge: true });
    }
  } catch (err) {
    console.warn('[Cloud Storage] Failed to save teacher to Firestore:', err);
  }
}

// Helper to deduplicate teachers and track extra duplicate IDs for Firestore cleanup
function processAndDeduplicateTeachers(rawTeachers: TeacherAccount[]): { cleanList: TeacherAccount[]; duplicateIdsToDelete: string[] } {
  const mapByEmail = new Map<string, TeacherAccount>();
  const duplicateIdsToDelete: string[] = [];

  for (const t of rawTeachers) {
    if (!t || !t.email) continue;
    const emailKey = t.email.toLowerCase().trim();
    if (!mapByEmail.has(emailKey)) {
      mapByEmail.set(emailKey, t);
    } else {
      const existing = mapByEmail.get(emailKey)!;
      const existingExpiry = new Date(existing.expiryDate || 0).getTime();
      const currentExpiry = new Date(t.expiryDate || 0).getTime();

      if (currentExpiry > existingExpiry) {
        if (existing.id && existing.id !== t.id) {
          duplicateIdsToDelete.push(existing.id);
        }
        mapByEmail.set(emailKey, { ...existing, ...t, id: existing.id || t.id });
      } else {
        if (t.id && t.id !== existing.id) {
          duplicateIdsToDelete.push(t.id);
        }
        mapByEmail.set(emailKey, { ...t, ...existing });
      }
    }
  }

  return { cleanList: Array.from(mapByEmail.values()), duplicateIdsToDelete };
}

// Fetch all teachers from Firestore
export async function fetchAllTeachersCloud(): Promise<TeacherAccount[]> {
  const localTeachers = getStoredTeachers();
  try {
    if (db) {
      const collRef = collection(db, TEACHERS_COLLECTION);
      const snapshot = await getDocs(collRef);
      const rawTeachers: TeacherAccount[] = [];
      const deletedTeacherIds = getDeletedTeacherIds();

      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          const t = docSnap.data() as TeacherAccount;
          if (t && t.id && t.email && !deletedTeacherIds.includes(t.id.toLowerCase()) && !deletedTeacherIds.includes(t.email.toLowerCase())) {
            rawTeachers.push(t);
          }
        }
      });

      localTeachers.forEach((t) => {
        if (t && t.id && t.email && !deletedTeacherIds.includes(t.id.toLowerCase()) && !deletedTeacherIds.includes(t.email.toLowerCase())) {
          rawTeachers.push(t);
        }
      });

      const { cleanList, duplicateIdsToDelete } = processAndDeduplicateTeachers(rawTeachers);

      // Async cleanup duplicate documents from cloud
      if (duplicateIdsToDelete.length > 0 && db) {
        duplicateIdsToDelete.forEach((dupId) => {
          try {
            deleteDoc(doc(db, TEACHERS_COLLECTION, dupId));
          } catch (e) {}
        });
      }

      saveTeachers(cleanList);
      return cleanList;
    }
  } catch (err) {
    console.warn('[Cloud Storage] Error fetching all teachers from Firestore:', err);
  }

  return localTeachers;
}

// Delete teacher from Firestore Cloud DB
export async function deleteTeacherCloud(teacherId: string, email?: string): Promise<void> {
  try {
    addDeletedTeacherId(teacherId);
    if (email) addDeletedTeacherId(email);
    if (db) {
      const docRef = doc(db, TEACHERS_COLLECTION, teacherId);
      await deleteDoc(docRef);
    }
  } catch (err) {
    console.warn(`[Cloud Storage] Failed to delete teacher ${teacherId} from Firestore:`, err);
  }
}

// Save Platform Config to Firestore Cloud DB & LocalStorage
export async function savePlatformConfigCloud(config: LandingPlatformConfig): Promise<void> {
  try {
    savePlatformConfig(config);
    if (db) {
      const docRef = doc(db, CONFIG_COLLECTION, PLATFORM_CONFIG_DOC_ID);
      await setDoc(docRef, JSON.parse(JSON.stringify(config)), { merge: true });
      console.log('[Cloud Storage] Saved platformConfig to Firestore');
    }
  } catch (err) {
    console.warn('[Cloud Storage] Failed to save platformConfig to Firestore:', err);
  }
}

// Fetch Platform Config from Firestore Cloud DB
export async function fetchPlatformConfigCloud(): Promise<LandingPlatformConfig | null> {
  const localConfig = getPlatformConfig();
  try {
    if (db) {
      const docRef = doc(db, CONFIG_COLLECTION, PLATFORM_CONFIG_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudConfig = snap.data() as LandingPlatformConfig;
        const merged = {
          ...localConfig,
          ...cloudConfig,
        };
        savePlatformConfig(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('[Cloud Storage] Error fetching platformConfig from Firestore:', err);
  }
  return localConfig;
}

// Real-Time Subscriptions for live synchronization across browser tabs / devices

export function subscribeTestsCloud(onUpdate: (tests: MockTest[]) => void): () => void {
  if (!db) return () => {};

  try {
    const collRef = collection(db, TESTS_COLLECTION);
    return onSnapshot(
      collRef,
      (snapshot) => {
        const deletedIds = getDeletedTestIds();
        const cloudTests: MockTest[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const tData = docSnap.data() as MockTest;
            if (tData && tData.id && !deletedIds.includes(tData.id) && !deletedIds.includes(cleanTestId(tData.id))) {
              cloudTests.push(tData);
            }
          }
        });

        // Also merge with local tests if any local test is not yet in cloud or deleted
        const localTests = getStoredTests();
        const mergedMap = new Map<string, MockTest>();
        localTests.forEach((t) => {
          if (!deletedIds.includes(t.id) && !deletedIds.includes(cleanTestId(t.id))) {
            mergedMap.set(t.id, t);
          }
        });
        cloudTests.forEach((t) => mergedMap.set(t.id, t));

        const mergedList = Array.from(mergedMap.values());
        saveTests(mergedList);
        onUpdate(mergedList);
      },
      (error) => {
        console.warn('[Cloud Storage] Realtime tests listener error:', error);
      }
    );
  } catch (e) {
    console.warn('[Cloud Storage] Failed to attach tests subscription:', e);
    return () => {};
  }
}

export function subscribeTeachersCloud(onUpdate: (teachers: TeacherAccount[]) => void): () => void {
  if (!db) return () => {};

  try {
    const collRef = collection(db, TEACHERS_COLLECTION);
    return onSnapshot(
      collRef,
      (snapshot) => {
        const deletedTeacherIds = getDeletedTeacherIds();
        const rawTeachers: TeacherAccount[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const t = docSnap.data() as TeacherAccount;
            if (t && t.id && t.email && !deletedTeacherIds.includes(t.id.toLowerCase()) && !deletedTeacherIds.includes(t.email.toLowerCase())) {
              rawTeachers.push(t);
            }
          }
        });

        const localTeachers = getStoredTeachers();
        localTeachers.forEach((t) => {
          if (t && t.id && t.email && !deletedTeacherIds.includes(t.id.toLowerCase()) && !deletedTeacherIds.includes(t.email.toLowerCase())) {
            rawTeachers.push(t);
          }
        });

        const { cleanList, duplicateIdsToDelete } = processAndDeduplicateTeachers(rawTeachers);

        if (duplicateIdsToDelete.length > 0 && db) {
          duplicateIdsToDelete.forEach((dupId) => {
            try {
              deleteDoc(doc(db, TEACHERS_COLLECTION, dupId));
            } catch (e) {}
          });
        }

        saveTeachers(cleanList);
        onUpdate(cleanList);
      },
      (error) => {
        console.warn('[Cloud Storage] Realtime teachers listener error:', error);
      }
    );
  } catch (e) {
    console.warn('[Cloud Storage] Failed to attach teachers subscription:', e);
    return () => {};
  }
}

export function subscribeAttemptsCloud(onUpdate: (attempts: TestAttempt[]) => void): () => void {
  if (!db) return () => {};

  try {
    const collRef = collection(db, ATTEMPTS_COLLECTION);
    return onSnapshot(
      collRef,
      (snapshot) => {
        const cloudAttempts: TestAttempt[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            cloudAttempts.push(docSnap.data() as TestAttempt);
          }
        });

        const localAttempts = getStoredAttempts();
        const mergedMap = new Map<string, TestAttempt>();
        localAttempts.forEach((a) => mergedMap.set(a.id, a));
        cloudAttempts.forEach((a) => mergedMap.set(a.id, a));

        const mergedList = Array.from(mergedMap.values());
        try {
          localStorage.setItem('mock_test_attempts_v1', JSON.stringify(mergedList));
        } catch (e) {}
        onUpdate(mergedList);
      },
      (error) => {
        console.warn('[Cloud Storage] Realtime attempts listener error:', error);
      }
    );
  } catch (e) {
    console.warn('[Cloud Storage] Failed to attach attempts subscription:', e);
    return () => {};
  }
}
