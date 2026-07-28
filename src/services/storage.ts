import { MockTest, TestAttempt, TeacherAccount, LandingPlatformConfig } from '../types';
import { SAMPLE_MOCK_TESTS } from '../data/sampleTests';

export const SUPER_ADMIN_EMAIL = 'jhunjhunu.rajasthan2021@gmail.com';
export const ADMIN_WHATSAPP_NUMBER = '882412117';

const TESTS_KEY = 'mock_tests_series_v1';
const ATTEMPTS_KEY = 'mock_test_attempts_v1';
const TEACHERS_KEY = 'mock_test_teachers_v1';
const CONFIG_KEY = 'mock_test_platform_config_v1';

export const DEFAULT_PLATFORM_CONFIG: LandingPlatformConfig = {
  headlineText: 'Daily Mock Test Live Share With Direct Link To Students',
  subtitleText: 'Teacher Affordable Daily Mock Test & Test Series Platform - Create Unlimited Online Test Series, Share Instant Links With Students & Track Live Rank Analytics',
  monthlyPrice: 199,
  yearlyPrice: 1800,
  whatsappNumber: ADMIN_WHATSAPP_NUMBER,
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
    return {
      ...DEFAULT_PLATFORM_CONFIG,
      ...parsed,
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
  }
  return config;
}


const INITIAL_TEACHERS: TeacherAccount[] = [
  {
    id: 'teacher-demo-1',
    name: 'Sharma Sir',
    email: 'teacher@school.edu',
    phone: '9876543210',
    instituteName: 'Jhunjhunu Coaching Center',
    status: 'active',
    accessPasscode: 'TCH-8824',
    password: '123456',
    grantedAt: new Date().toISOString(),
    accessDays: 365,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Demo Teacher Account',
  },
];

export function getStoredTeachers(): TeacherAccount[] {
  try {
    const raw = localStorage.getItem(TEACHERS_KEY);
    if (!raw) {
      try {
        localStorage.setItem(TEACHERS_KEY, JSON.stringify(INITIAL_TEACHERS));
      } catch (e) {}
      return INITIAL_TEACHERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(INITIAL_TEACHERS));
    return INITIAL_TEACHERS;
  } catch (err) {
    console.error('Error reading teachers from storage:', err);
    return INITIAL_TEACHERS;
  }
}

export function saveTeachers(teachers: TeacherAccount[]) {
  try {
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
  } catch (err) {
    console.error('Error saving teachers to storage:', err);
  }
}

export function createOrUpdateTeacher(teacher: TeacherAccount): TeacherAccount[] {
  const teachers = getStoredTeachers();
  const idx = teachers.findIndex((t) => t.id === teacher.id || t.email.toLowerCase() === teacher.email.toLowerCase());
  if (idx >= 0) {
    teachers[idx] = teacher;
  } else {
    teachers.unshift(teacher);
  }
  saveTeachers(teachers);
  return teachers;
}

export function deleteTeacher(id: string): TeacherAccount[] {
  const teachers = getStoredTeachers().filter((t) => t.id !== id);
  saveTeachers(teachers);
  return teachers;
}

export function getStoredTests(): MockTest[] {
  try {
    const raw = localStorage.getItem(TESTS_KEY);
    if (!raw) {
      try {
        localStorage.setItem(TESTS_KEY, JSON.stringify(SAMPLE_MOCK_TESTS));
      } catch (e) {}
      return SAMPLE_MOCK_TESTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If array is empty, populate sample mock tests
    try {
      localStorage.setItem(TESTS_KEY, JSON.stringify(SAMPLE_MOCK_TESTS));
    } catch (e) {}
    return SAMPLE_MOCK_TESTS;
  } catch (err) {
    console.error('Error reading tests from storage:', err);
    return SAMPLE_MOCK_TESTS;
  }
}

export function saveTests(tests: MockTest[]) {
  try {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
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
  const tests = getStoredTests().filter(t => t.id !== testId);
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
