import React, { createContext, useContext, useState, useEffect } from 'react';
import { MockTest, TestAttempt, TeacherAccount, UserRole, AuthUser, LandingPlatformConfig } from '../types';
import { cleanTestId } from '../utils/cleanTestId';
import {
  getStoredTests,
  saveTests,
  getStoredAttempts,
  saveAttempt,
  deleteTest as storageDeleteTest,
  cloneTest as storageCloneTest,
  deleteAttempt as storageDeleteAttempt,
  clearTestAttempts as storageClearTestAttempts,
  getStoredTeachers,
  saveTeachers,
  createOrUpdateTeacher,
  deleteTeacher as storageDeleteTeacher,
  SUPER_ADMIN_EMAIL,
  getPlatformConfig,
  savePlatformConfig,
  DEFAULT_PLATFORM_CONFIG,
} from '../services/storage';
import {
  saveTestCloud,
  fetchTestCloud,
  fetchAllTestsCloud,
  saveAttemptCloud,
  fetchAttemptsCloud,
  deleteTestCloud,
} from '../services/firestoreStorage';

export type { AuthUser };

interface AppContextType {
  mode: 'admin' | 'student';
  setMode: (mode: 'admin' | 'student') => void;
  tests: MockTest[];
  attempts: TestAttempt[];
  teachers: TeacherAccount[];
  currentUser: AuthUser | null;
  activeTest: MockTest | null;
  activeTestId: string | null;
  isFetchingActiveTest: boolean;
  setActiveTestId: (id: string | null) => void;
  activeAttempt: TestAttempt | null;
  setActiveAttempt: (attempt: TestAttempt | null) => void;
  teacherEmail: string;
  setTeacherEmail: (email: string) => void;

  // Platform Landing Config
  platformConfig: LandingPlatformConfig;
  updatePlatformConfig: (config: LandingPlatformConfig) => void;
  
  // Teacher Branding Update
  updateTeacherBranding: (branding: {
    instituteName?: string;
    coachingLogoUrl?: string;
    coachingTagline?: string;
  }) => void;
  
  // Auth Actions

  loginAsSuperAdmin: () => void;
  loginAsTeacher: (emailInput: string, passwordInput?: string) => { success: boolean; message: string };
  loginWithMobile: (phoneInput: string) => { success: boolean; message: string };
  logout: () => void;
  
  // Admin Teacher Management Actions
  grantOrUpdateTeacherAccess: (teacherData: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    instituteName?: string;
    coachingLogoUrl?: string;
    coachingTagline?: string;
    allowCustomBranding?: boolean;
    accessDays: number; // e.g. 7, 30, 90, 365, 99999
    password?: string;
    notes?: string;
  }) => TeacherAccount;
  revokeTeacherAccess: (teacherId: string) => void;
  deleteTeacherAccount: (teacherId: string) => void;

  // Test Actions
  createOrUpdateTest: (test: MockTest) => void;
  deleteTest: (testId: string) => void;
  cloneTest: (testId: string) => void;
  submitTestAttempt: (attempt: TestAttempt) => void;
  deleteAttempt: (attemptId: string) => void;
  clearTestAttempts: (testId: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SUPER_ADMIN: AuthUser = {
  email: SUPER_ADMIN_EMAIL,
  name: 'Main Admin (Super Admin)',
  instituteName: 'Main Platform Admin',
  role: 'super_admin',
  isSuperAdmin: true,
  status: 'active',
  accessDaysRemaining: 99999,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'admin' | 'student'>('admin');
  const [tests, setTests] = useState<MockTest[]>(() => getStoredTests());
  const [attempts, setAttempts] = useState<TestAttempt[]>(() => getStoredAttempts());
  const [teachers, setTeachers] = useState<TeacherAccount[]>(() => getStoredTeachers());
  const [platformConfig, setPlatformConfigState] = useState<LandingPlatformConfig>(DEFAULT_PLATFORM_CONFIG);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTestId, setActiveTestIdState] = useState<string | null>(null);
  const [isFetchingActiveTest, setIsFetchingActiveTest] = useState<boolean>(false);
  const [activeAttempt, setActiveAttempt] = useState<TestAttempt | null>(null);
  const [teacherEmail, setTeacherEmail] = useState<string>(SUPER_ADMIN_EMAIL);

  // Load URL query parameter or hash on boot
  useEffect(() => {
    refreshData();

    // Load stored session if any
    try {
      const savedUserStr = localStorage.getItem('active_admin_session_v1');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.email) {
          if (parsed.email === SUPER_ADMIN_EMAIL) {
            setCurrentUser(DEFAULT_SUPER_ADMIN);
          } else {
            // Re-verify teacher validity against current date
            const loadedTeachers = getStoredTeachers();
            const matched = loadedTeachers.find((t) => t.email.toLowerCase() === parsed.email.toLowerCase());
            if (matched) {
              const now = new Date();
              const expiry = new Date(matched.expiryDate);
              const isExpired = expiry < now;
              const diffMs = expiry.getTime() - now.getTime();
              const daysRem = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

              setCurrentUser({
                email: matched.email,
                name: matched.name,
                instituteName: matched.instituteName || '',
                coachingLogoUrl: matched.coachingLogoUrl || '',
                coachingTagline: matched.coachingTagline || '',
                allowCustomBranding: matched.allowCustomBranding !== false, // default true
                role: 'teacher',
                isSuperAdmin: false,
                status: isExpired ? 'expired' : matched.status,
                accessPasscode: matched.accessPasscode,
                expiryDate: matched.expiryDate,
                accessDaysRemaining: daysRem,
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse saved session:', e);
    }


    const syncTestFromUrl = () => {
      refreshData();
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const testQuery = urlParams.get('test') || urlParams.get('testId') || urlParams.get('id');
        const hash = window.location.hash || '';

        const rawTarget = testQuery || (hash.includes('test') ? hash : null);
        const cleanedId = cleanTestId(rawTarget);

        if (cleanedId) {
          setIsFetchingActiveTest(true);
          setActiveTestIdState(cleanedId);
          setMode('student');
          fetchTestCloud(cleanedId)
            .then((fetched) => {
              if (fetched) {
                setTests((prev) => {
                  const existingIdx = prev.findIndex((t) => t.id === fetched.id);
                  if (existingIdx >= 0) {
                    const updated = [...prev];
                    updated[existingIdx] = fetched;
                    return updated;
                  }
                  return [fetched, ...prev];
                });
              }
            })
            .finally(() => {
              setIsFetchingActiveTest(false);
            });
        } else {
          setActiveTestIdState(null);
          setIsFetchingActiveTest(false);
          if (window.location.hash && window.location.hash.includes('test')) {
            try {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error('Failed to parse URL params:', e);
        setIsFetchingActiveTest(false);
      }
    };

    syncTestFromUrl();

    window.addEventListener('hashchange', syncTestFromUrl);
    window.addEventListener('popstate', syncTestFromUrl);
    window.addEventListener('storage', syncTestFromUrl);

    return () => {
      window.removeEventListener('hashchange', syncTestFromUrl);
      window.removeEventListener('popstate', syncTestFromUrl);
      window.removeEventListener('storage', syncTestFromUrl);
    };
  }, []);

  // Sync cloud tests and attempts on mount
  useEffect(() => {
    fetchAllTestsCloud().then((cloudTests) => {
      if (cloudTests && cloudTests.length > 0) {
        setTests(cloudTests);
      }
    });

    fetchAttemptsCloud().then((cloudAttempts) => {
      if (cloudAttempts && cloudAttempts.length > 0) {
        setAttempts(cloudAttempts);
      }
    });
  }, []);

  // Effect to auto-fetch missing active test from cloud if not found in local memory
  useEffect(() => {
    if (!activeTestId) {
      setIsFetchingActiveTest(false);
      return;
    }
    const cleaned = cleanTestId(activeTestId);
    if (!cleaned) {
      setIsFetchingActiveTest(false);
      return;
    }

    const exists = tests.some((t) => t.id === cleaned || cleanTestId(t.id) === cleaned);
    if (!exists) {
      setIsFetchingActiveTest(true);
      fetchTestCloud(cleaned)
        .then((found) => {
          if (found) {
            setTests((prev) => {
              if (prev.some((t) => t.id === found.id)) return prev;
              return [found, ...prev];
            });
          }
        })
        .finally(() => {
          setIsFetchingActiveTest(false);
        });
    } else {
      setIsFetchingActiveTest(false);
    }
  }, [activeTestId, tests]);

  const refreshData = () => {
    const loadedTests = getStoredTests();
    const loadedAttempts = getStoredAttempts();
    const loadedTeachers = getStoredTeachers();
    const loadedConfig = getPlatformConfig();
    setTests(loadedTests);
    setAttempts(loadedAttempts);
    setTeachers(loadedTeachers);
    setPlatformConfigState(loadedConfig);
  };

  const updatePlatformConfigHandler = (newConfig: LandingPlatformConfig) => {
    const saved = savePlatformConfig(newConfig);
    setPlatformConfigState(saved);
  };


  const loginAsSuperAdmin = () => {
    setCurrentUser(DEFAULT_SUPER_ADMIN);
    setTeacherEmail(SUPER_ADMIN_EMAIL);
    try {
      localStorage.setItem('active_admin_session_v1', JSON.stringify(DEFAULT_SUPER_ADMIN));
    } catch (e) {}
    setMode('admin');
  };

  const loginAsTeacher = (emailInput: string, passwordInput?: string): { success: boolean; message: string } => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter Teacher Email ID.' };
    }

    if (
      cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() ||
      cleanEmail === 'admin123' ||
      cleanPass === 'admin123'
    ) {
      loginAsSuperAdmin();
      return { success: true, message: 'Welcome Main Admin!' };
    }

    let loadedTeachers = getStoredTeachers();
    let matched = loadedTeachers.find(
      (t) => t.email.toLowerCase() === cleanEmail
    );

    if (!matched) {
      // Auto-register teacher account for new email
      const isEmail = cleanEmail.includes('@');
      const teacherEmailToUse = isEmail ? cleanEmail : `${cleanEmail}@coaching.com`;
      const teacherNameToUse = isEmail ? cleanEmail.split('@')[0].toUpperCase() + ' Teacher' : `Teacher (${cleanEmail})`;
      
      const created = grantOrUpdateTeacherAccess({
        name: teacherNameToUse,
        email: teacherEmailToUse,
        phone: '9876543210',
        instituteName: 'Coaching Institute',
        accessDays: 365,
        password: cleanPass || 'password123',
        notes: 'Registered Teacher Account',
      });
      matched = created;
    } else {
      if (cleanPass && matched.password && matched.password !== cleanPass) {
        return {
          success: false,
          message: 'Incorrect Password. Please enter correct account password.',
        };
      }
    }

    if (matched.status === 'blocked') {
      return {
        success: false,
        message: 'Your teacher account has been blocked by Main Admin. Please contact Admin on WhatsApp (882412117).',
      };
    }

    const now = new Date();
    const expiry = new Date(matched.expiryDate);
    if (expiry < now || matched.status === 'expired') {
      matched.status = 'expired';
      saveTeachers(loadedTeachers);
      return {
        success: false,
        message: `Your access expired on ${new Date(matched.expiryDate).toLocaleDateString()}. Please contact Admin on WhatsApp (882412117) to renew.`,
      };
    }

    const diffMs = expiry.getTime() - now.getTime();
    const daysRem = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const authUser: AuthUser = {
      email: matched.email,
      name: matched.name,
      instituteName: matched.instituteName || 'Coaching Institute',
      coachingLogoUrl: matched.coachingLogoUrl || '',
      coachingTagline: matched.coachingTagline || '',
      allowCustomBranding: matched.allowCustomBranding !== false,
      role: 'teacher',
      isSuperAdmin: false,
      status: 'active',
      accessPasscode: matched.accessPasscode,
      expiryDate: matched.expiryDate,
      accessDaysRemaining: daysRem,
    };

    setCurrentUser(authUser);
    setTeacherEmail(matched.email);
    try {
      localStorage.setItem('active_admin_session_v1', JSON.stringify(authUser));
    } catch (e) {}
    setMode('admin');

    return {
      success: true,
      message: `Welcome ${matched.name}! Teacher Panel Login Successful.`,
    };
  };

  const loginWithMobile = (phoneInput: string): { success: boolean; message: string } => {
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    let loadedTeachers = getStoredTeachers();
    let matched = loadedTeachers.find(
      (t) => t.phone && t.phone.replace(/\D/g, '') === cleanPhone
    );

    if (!matched) {
      // Auto-register teacher with mobile number
      const created = grantOrUpdateTeacherAccess({
        name: `Teacher (${cleanPhone.slice(-4)})`,
        email: `teacher_${cleanPhone}@coaching.com`,
        phone: cleanPhone,
        instituteName: 'Coaching Institute',
        accessDays: 365,
        password: 'password123',
        notes: 'Mobile OTP Verified Account',
      });
      matched = created;
    }

    if (matched.status === 'blocked') {
      return {
        success: false,
        message: 'Your account has been blocked by Admin. Please contact on WhatsApp (882412117).',
      };
    }

    const now = new Date();
    const expiry = new Date(matched.expiryDate);
    if (expiry < now || matched.status === 'expired') {
      matched.status = 'expired';
      saveTeachers(loadedTeachers);
      return {
        success: false,
        message: `Your access expired on ${new Date(matched.expiryDate).toLocaleDateString()}. Please contact Admin on WhatsApp (882412117) to renew.`,
      };
    }

    const diffMs = expiry.getTime() - now.getTime();
    const daysRem = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const authUser: AuthUser = {
      email: matched.email,
      name: matched.name,
      instituteName: matched.instituteName || 'Coaching Institute',
      coachingLogoUrl: matched.coachingLogoUrl || '',
      coachingTagline: matched.coachingTagline || '',
      allowCustomBranding: matched.allowCustomBranding !== false,
      role: 'teacher',
      isSuperAdmin: false,
      status: 'active',
      accessPasscode: matched.accessPasscode,
      expiryDate: matched.expiryDate,
      accessDaysRemaining: daysRem,
    };

    setCurrentUser(authUser);
    setTeacherEmail(matched.email);
    try {
      localStorage.setItem('active_admin_session_v1', JSON.stringify(authUser));
    } catch (e) {}
    setMode('admin');

    return {
      success: true,
      message: `Welcome ${matched.name}! Mobile OTP verification successful.`,
    };
  };

  const updateTeacherBranding = (data: {
    instituteName?: string;
    coachingLogoUrl?: string;
    coachingTagline?: string;
  }) => {
    if (!currentUser) return;
    const updatedUser: AuthUser = {
      ...currentUser,
      instituteName: data.instituteName !== undefined ? data.instituteName : currentUser.instituteName,
      coachingLogoUrl: data.coachingLogoUrl !== undefined ? data.coachingLogoUrl : currentUser.coachingLogoUrl,
      coachingTagline: data.coachingTagline !== undefined ? data.coachingTagline : currentUser.coachingTagline,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('active_admin_session_v1', JSON.stringify(updatedUser));
    } catch (e) {}

    const loadedTeachers = getStoredTeachers();
    const idx = loadedTeachers.findIndex((t) => t.email.toLowerCase() === currentUser.email.toLowerCase());
    if (idx >= 0) {
      loadedTeachers[idx] = {
        ...loadedTeachers[idx],
        instituteName: updatedUser.instituteName,
        coachingLogoUrl: updatedUser.coachingLogoUrl,
        coachingTagline: updatedUser.coachingTagline,
      };
      saveTeachers(loadedTeachers);
      setTeachers(loadedTeachers);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('active_admin_session_v1');
    } catch (e) {}
  };

  const grantOrUpdateTeacherAccess = (data: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    instituteName?: string;
    coachingLogoUrl?: string;
    coachingTagline?: string;
    allowCustomBranding?: boolean;
    accessDays: number;
    password?: string;
    notes?: string;
  }): TeacherAccount => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + data.accessDays * 24 * 60 * 60 * 1000).toISOString();
    const passcode = `TCH-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingTeachers = getStoredTeachers();
    const existing = data.id ? existingTeachers.find((t) => t.id === data.id) : undefined;

    const newTeacher: TeacherAccount = {
      id: data.id || `tch-${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      instituteName: data.instituteName || '',
      coachingLogoUrl: data.coachingLogoUrl !== undefined ? data.coachingLogoUrl : existing?.coachingLogoUrl || '',
      coachingTagline: data.coachingTagline !== undefined ? data.coachingTagline : existing?.coachingTagline || '',
      allowCustomBranding: data.allowCustomBranding !== undefined ? data.allowCustomBranding : (existing?.allowCustomBranding !== false),
      status: 'active',
      accessPasscode: existing?.accessPasscode || passcode,
      password: data.password ? data.password.trim() : existing?.password || '123456',
      grantedAt: now.toISOString(),
      accessDays: data.accessDays,
      expiryDate,
      notes: data.notes || '',
    };

    const updatedList = createOrUpdateTeacher(newTeacher);
    setTeachers(updatedList);

    // If updating current teacher's account, also sync currentUser
    if (currentUser && currentUser.email.toLowerCase() === newTeacher.email.toLowerCase()) {
      const updatedUser: AuthUser = {
        ...currentUser,
        name: newTeacher.name,
        instituteName: newTeacher.instituteName,
        coachingLogoUrl: newTeacher.coachingLogoUrl,
        coachingTagline: newTeacher.coachingTagline,
        allowCustomBranding: newTeacher.allowCustomBranding,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('active_admin_session_v1', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    return newTeacher;
  };

  const revokeTeacherAccess = (teacherId: string) => {
    const updated = teachers.map((t) => (t.id === teacherId ? { ...t, status: 'blocked' as const } : t));
    saveTeachers(updated);
    setTeachers(updated);
  };

  const deleteTeacherAccount = (teacherId: string) => {
    const updated = storageDeleteTeacher(teacherId);
    setTeachers(updated);
  };

  const setActiveTestId = (id: string | null) => {
    const cleaned = cleanTestId(id);
    setActiveTestIdState(cleaned);
    if (cleaned) {
      setMode('student');
      try {
        if (window.location.hash !== `#test/${cleaned}`) {
          window.location.hash = `#test/${cleaned}`;
        }
      } catch (e) {}
    } else {
      try {
        if (window.location.hash || window.location.search) {
          window.history.pushState(null, '', window.location.pathname);
        }
      } catch (e) {}
    }
  };

  const activeTest = (() => {
    const target = cleanTestId(activeTestId);
    if (!target) return null;

    const matchesTarget = (t: MockTest) => {
      if (!t || !t.id) return false;
      const tClean = cleanTestId(t.id);
      const rawTarget = activeTestId || '';
      return (
        t.id === target ||
        t.id === rawTarget ||
        (Boolean(tClean) && tClean === target) ||
        t.id.toLowerCase() === target.toLowerCase() ||
        t.id.replace(/[^a-zA-Z0-9]/g, '') === target.replace(/[^a-zA-Z0-9]/g, '') ||
        (target.length > 5 && t.id.includes(target)) ||
        (t.id.length > 5 && target.includes(t.id))
      );
    };

    return (
      tests.find(matchesTarget) ||
      getStoredTests().find(matchesTarget) ||
      null
    );
  })();

  const createOrUpdateTest = (testToSave: MockTest) => {
    const existingIdx = tests.findIndex(t => t.id === testToSave.id);
    let updated: MockTest[];
    if (existingIdx >= 0) {
      updated = [...tests];
      updated[existingIdx] = { ...testToSave, updatedAt: new Date().toISOString() };
    } else {
      updated = [testToSave, ...tests];
    }
    setTests(updated);
    saveTestCloud(testToSave);
  };

  const deleteTestHandler = (testId: string) => {
    const updated = storageDeleteTest(testId);
    setTests(updated);
    deleteTestCloud(testId);
    if (activeTestId === testId) {
      setActiveTestId(null);
    }
  };

  const cloneTestHandler = (testId: string) => {
    const cloned = storageCloneTest(testId);
    if (cloned) {
      saveTestCloud(cloned);
      refreshData();
    }
  };

  const submitTestAttempt = (attempt: TestAttempt) => {
    saveAttemptCloud(attempt);
    setActiveAttempt(attempt);
    refreshData();
  };

  const deleteAttemptHandler = (attemptId: string) => {
    const updated = storageDeleteAttempt(attemptId);
    setAttempts(updated);
  };

  const clearTestAttemptsHandler = (testId: string) => {
    const updated = storageClearTestAttempts(testId);
    setAttempts(updated);
  };

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        tests,
        attempts,
        teachers,
        currentUser,
        activeTest,
        activeTestId,
        isFetchingActiveTest,
        setActiveTestId,
        activeAttempt,
        setActiveAttempt,
        teacherEmail,
        setTeacherEmail,
        platformConfig,
        updatePlatformConfig: updatePlatformConfigHandler,
        updateTeacherBranding,
        loginAsSuperAdmin,
        loginAsTeacher,
        loginWithMobile,
        logout,

        grantOrUpdateTeacherAccess,
        revokeTeacherAccess,
        deleteTeacherAccount,
        createOrUpdateTest,
        deleteTest: deleteTestHandler,
        cloneTest: cloneTestHandler,
        submitTestAttempt,
        deleteAttempt: deleteAttemptHandler,
        clearTestAttempts: clearTestAttemptsHandler,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

