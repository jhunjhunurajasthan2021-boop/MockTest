import { MockTest, TestAttempt, TeacherAccount, LandingPlatformConfig } from '../types';
import { SAMPLE_MOCK_TESTS } from '../data/sampleTests';

export const SUPER_ADMIN_EMAIL = 'jhunjhunu.rajasthan2021@gmail.com';
export const ADMIN_WHATSAPP_NUMBER = '8824125117';

const TESTS_KEY = 'mock_tests_series_v1';
const ATTEMPTS_KEY = 'mock_test_attempts_v1';
const TEACHERS_KEY = 'mock_test_teachers_v1';
const CONFIG_KEY = 'mock_test_platform_config_v1';
const DELETED_TESTS_KEY = 'mock_test_deleted_ids_v1';
const DELETED_TEACHERS_KEY = 'mock_test_deleted_teacher_ids_v1';

export function getDeletedTestIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_TESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addDeletedTestId(id: string) {
  if (!id) return;
  try {
    const list = getDeletedTestIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_TESTS_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

export function removeDeletedTestId(id: string) {
  if (!id) return;
  try {
    const list = getDeletedTestIds().filter((d) => d !== id);
    localStorage.setItem(DELETED_TESTS_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function getDeletedTeacherIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_TEACHERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addDeletedTeacherId(idOrEmail: string) {
  if (!idOrEmail) return;
  const target = idOrEmail.toLowerCase().trim();
  try {
    const list = getDeletedTeacherIds();
    if (!list.includes(target)) {
      list.push(target);
      localStorage.setItem(DELETED_TEACHERS_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

export function removeDeletedTeacherId(idOrEmail: string) {
  if (!idOrEmail) return;
  const target = idOrEmail.toLowerCase().trim();
  try {
    const list = getDeletedTeacherIds().filter((d) => d !== target);
    localStorage.setItem(DELETED_TEACHERS_KEY, JSON.stringify(list));
  } catch (e) {}
}

export const DEFAULT_PLATFORM_CONFIG: LandingPlatformConfig = {
  headlineText: 'Daily Mock Test Live Share With Direct Link To Students',
  subtitleText: 'Teacher Affordable Daily Mock Test & Test Series Platform - Create Unlimited Online Test Series, Share Instant Links With Students & Track Live Rank Analytics',
  monthlyPrice: 199,
  yearlyPrice: 1800,
  whatsappNumber: ADMIN_WHATSAPP_NUMBER,
  customAppLogo: '',
  monthlyPlanFeatures: [
    'Unlimited Mock Test & Question Creation',
    'Direct Student Link & WhatsApp Sharing',
    'Live Rank & Score Analytics',
    'Full Teacher Admin Panel Access',
    'Instant WhatsApp Support',
  ],
  yearlyPlanFeatures: [
    'All Monthly Plan Features Included',
    'Flat Savings (12 Months Complete Access)',
    'Custom Coaching Institute Branding',
    'Priority Super Admin Support',
    'Lifetime Student Attempt History',
  ],
  testimonials: [
    {
      id: 'testim-1',
      name: 'Ramesh Kumar Sir',
      roleOrInstitute: 'Science Director, Jhunjhunu Coaching',
      rating: 5,
      quote: 'Daily mock test direct link se share karna bilkul simple aur fast hai. Students rank and instant scoreboard se bahut motivated feel karte hain.',
    },
    {
      id: 'testim-2',
      name: 'Anita Verma Ma\'am',
      roleOrInstitute: 'Toppers Academy Director',
      rating: 5,
      quote: '₹199 monthly plan me poore month unlimited test series create kar sakte hain. WhatsApp student link share is super convenient!',
    },
    {
      id: 'testim-3',
      name: 'Vikram Singh Sir',
      roleOrInstitute: 'Excellence Classes Jaipur',
      rating: 5,
      quote: 'Yearly ₹1800 plan provides maximum savings. Platform operates smoothly on mobile for both teachers and students.',
    },
  ],
};

export function getPlatformConfig(): LandingPlatformConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) {
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_PLATFORM_CONFIG));
      } catch (e) {}
      return DEFAULT_PLATFORM_CONFIG;
    }
    const parsed = JSON.parse(raw);
    let num = parsed.whatsappNumber || ADMIN_WHATSAPP_NUMBER;
    if (num === '882412117' || num === '8824121117' || num.length < 10) {
      num = ADMIN_WHATSAPP_NUMBER;
    }
    return {
      ...DEFAULT_PLATFORM_CONFIG,
      ...parsed,
      whatsappNumber: num,
      testimonials: Array.isArray(parsed?.testimonials) && parsed.testimonials.length > 0 ? parsed.testimonials : DEFAULT_PLATFORM_CONFIG.testimonials,
    };
  } catch (err) {
    console.error('Error reading platform config:', err);
    return DEFAULT_PLATFORM_CONFIG;
  }
}

export function savePlatformConfig(config: LandingPlatformConfig): LandingPlatformConfig {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving platform config:', err);
    // If quota exceeded, try saving without customAppLogo if base64 is too huge, but log warning
    try {
      const fallbackConfig = { ...config };
      if (fallbackConfig.customAppLogo && fallbackConfig.customAppLogo.length > 500000) {
        console.warn('customAppLogo base64 too large for localStorage, compressing or removing');
      }
      localStorage.setItem(CONFIG_KEY, JSON.stringify(fallbackConfig));
    } catch (e) {
      console.error('Secondary save attempt failed:', e);
    }
  }
  return config;
}


const INITIAL_TEACHERS: TeacherAccount[] = [];

export function deduplicateTeachers(teachers: TeacherAccount[]): TeacherAccount[] {
  const map = new Map<string, TeacherAccount>();
  for (const t of teachers) {
    if (!t || !t.email) continue;
    const emailKey = t.email.toLowerCase().trim();
    if (!map.has(emailKey)) {
      map.set(emailKey, t);
    } else {
      const existing = map.get(emailKey)!;
      const existingExpiry = new Date(existing.expiryDate || 0).getTime();
      const currentExpiry = new Date(t.expiryDate || 0).getTime();
      if (currentExpiry > existingExpiry) {
        map.set(emailKey, { ...existing, ...t, id: existing.id || t.id });
      } else {
        map.set(emailKey, { ...t, ...existing });
      }
    }
  }
  return Array.from(map.values());
}

export function getStoredTeachers(): TeacherAccount[] {
  try {
    const raw = localStorage.getItem(TEACHERS_KEY);
    const deletedIds = getDeletedTeacherIds();
    if (raw === null) {
      try {
        localStorage.setItem(TEACHERS_KEY, JSON.stringify([]));
      } catch (e) {}
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(
        (t) => t && t.id && t.email && !deletedIds.includes(t.id.toLowerCase()) && !deletedIds.includes(t.email.toLowerCase())
      );
      return deduplicateTeachers(filtered);
    }
    return [];
  } catch (err) {
    console.error('Error reading teachers from storage:', err);
    return [];
  }
}

export function saveTeachers(teachers: TeacherAccount[]) {
  try {
    const deletedIds = getDeletedTeacherIds();
    const cleanTeachers = teachers.filter(
      (t) => t && t.id && t.email && !deletedIds.includes(t.id.toLowerCase()) && !deletedIds.includes(t.email.toLowerCase())
    );
    const deduplicated = deduplicateTeachers(cleanTeachers);
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(deduplicated));
  } catch (err) {
    console.error('Error saving teachers to storage:', err);
  }
}

export function createOrUpdateTeacher(teacher: TeacherAccount): TeacherAccount[] {
  removeDeletedTeacherId(teacher.id);
  removeDeletedTeacherId(teacher.email);
  const existingTeachers = getStoredTeachers();
  const cleanEmail = teacher.email.toLowerCase().trim();
  const filtered = existingTeachers.filter(
    (t) => t.id !== teacher.id && t.email.toLowerCase().trim() !== cleanEmail
  );
  filtered.unshift(teacher);
  const deduplicated = deduplicateTeachers(filtered);
  saveTeachers(deduplicated);
  return deduplicated;
}

export function deleteTeacher(id: string): TeacherAccount[] {
  const currentTeachers = getStoredTeachers();
  const toDelete = currentTeachers.find((t) => t.id === id || t.email.toLowerCase() === id.toLowerCase());
  if (toDelete) {
    addDeletedTeacherId(toDelete.id);
    addDeletedTeacherId(toDelete.email);
  } else {
    addDeletedTeacherId(id);
  }
  const teachers = currentTeachers.filter((t) => t.id !== id && t.email.toLowerCase() !== id.toLowerCase());
  saveTeachers(teachers);
  return teachers;
}

export function getStoredTests(): MockTest[] {
  try {
    const raw = localStorage.getItem(TESTS_KEY);
    const deletedIds = getDeletedTestIds();
    if (raw === null) {
      try {
        localStorage.setItem(TESTS_KEY, JSON.stringify([]));
      } catch (e) {}
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((t) => !deletedIds.includes(t.id));
    }
    return [];
  } catch (err) {
    console.error('Error reading tests from storage:', err);
    return [];
  }
}

export function saveTests(tests: MockTest[]) {
  try {
    const deletedIds = getDeletedTestIds();
    const cleanTests = tests.filter((t) => !deletedIds.includes(t.id));
    localStorage.setItem(TESTS_KEY, JSON.stringify(cleanTests));
  } catch (err) {
    console.error('Error saving tests to storage:', err);
  }
}

export function getStoredAttempts(): TestAttempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Error reading attempts from storage:', err);
    return [];
  }
}

export function saveAttempt(attempt: TestAttempt) {
  try {
    const attempts = getStoredAttempts();
    attempts.unshift(attempt);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (err) {
    console.error('Error saving attempt to storage:', err);
  }
}

export function deleteAttempt(attemptId: string): TestAttempt[] {
  try {
    const attempts = getStoredAttempts().filter((a) => a.id !== attemptId);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
    return attempts;
  } catch (err) {
    console.error('Error deleting attempt from storage:', err);
    return getStoredAttempts();
  }
}

export function clearTestAttempts(testId: string): TestAttempt[] {
  try {
    const attempts = getStoredAttempts().filter((a) => a.testId !== testId);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
    return attempts;
  } catch (err) {
    console.error('Error clearing test attempts from storage:', err);
    return getStoredAttempts();
  }
}

export function getTestById(testId: string): MockTest | undefined {
  const tests = getStoredTests();
  return tests.find(t => t.id === testId);
}

export function deleteTest(testId: string): MockTest[] {
  addDeletedTestId(testId);
  const tests = getStoredTests().filter((t) => t.id !== testId);
  saveTests(tests);
  return tests;
}

export function cloneTest(testId: string): MockTest | undefined {
  const existing = getTestById(testId);
  if (!existing) return undefined;

  const cloned: MockTest = {
    ...existing,
    id: `test-${Date.now()}`,
    title: `${existing.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tests = getStoredTests();
  tests.unshift(cloned);
  saveTests(tests);
  return cloned;
}
