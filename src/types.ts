export type QuestionType =
  | 'mcq_single'
  | 'mcq_multiple'
  | 'true_false'
  | 'integer'
  | 'fill_blanks';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type TestType = 'subjective' | 'full';

export interface TestSection {
  id: string;
  name: string;
  durationMinutes: number; // Section duration in minutes (0 if no separate section timer)
  positiveMarks: number;   // Default positive marks per question in this section
  negativeMarks: number;   // Default negative penalty per question in this section
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswer?: string; // For integer or fill_blanks
  explanation: string;
  positiveMarks: number;
  negativeMarks: number;
  subject: string;
  sectionId?: string; // Optional section ID for multi-section full mock tests
  topic?: string;
  difficulty: DifficultyLevel;
  imageUrl?: string;
}

export interface TestSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultImmediately: boolean;
  allowMultipleAttempts: boolean;
  enableNegativeMarking: boolean;
  preventTabSwitching: boolean; // Anti-cheating proctoring
  passingPercentage: number;
}

export interface PromoAdConfig {
  enabled: boolean;
  title?: string;
  description?: string;
  imageUrl?: string;
  courseUrl?: string;  // Target redirect link when student clicks ad
  buttonText?: string;
}

export interface SectionAttempt {
  sectionId: string;
  sectionName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  isSubmitted?: boolean;
  timeSpentSeconds?: number;
}

export interface MockTest {
  id: string;
  title: string;
  description: string;
  subject: string;
  testType?: TestType;       // 'subjective' | 'full'
  sections?: TestSection[];  // List of sections for full mock tests
  totalMarks: number;
  durationMinutes: number;
  startTime?: string; // ISO date string for test window start
  endTime?: string;   // ISO date string for test window end
  expiryDate?: string; // ISO date string for link expiry
  settings: TestSettings;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  isPublished: boolean;
  startAd?: PromoAdConfig;  // Banner ad on test registration / start page
  resultAd?: PromoAdConfig; // Banner ad on scorecard / test submission page
  leftAd?: PromoAdConfig;   // Left Sidebar Ad Banner (PNG / JPG / JPEG)
  rightAd?: PromoAdConfig;  // Right Sidebar Ad Banner (PNG / JPG / JPEG)
  coachingLogoUrl?: string; // Teacher custom coaching logo URL
  coachingName?: string;    // Teacher coaching institute name
  coachingTagline?: string; // Teacher coaching tagline / subtitle
}

export interface StudentInfo {
  name: string;
  email: string;
  phone: string;
  rollNumber?: string;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionIds?: string[]; // For MCQ single / multiple
  textAnswer?: string;          // For integer / fill in blanks
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  student: StudentInfo;
  answers: Record<string, StudentAnswer>; // questionId -> Answer
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  tabSwitchCount: number;
  sectionBreakdown?: SectionAttempt[];
}

export interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  correctQuestions: number;
  obtainedMarks: number;
  totalMarks: number;
}

export type UserRole = 'super_admin' | 'teacher' | 'student';

export interface TeacherAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  instituteName?: string;
  coachingLogoUrl?: string;   // Coaching Logo Image URL
  coachingTagline?: string;   // Coaching Subtitle / Tagline
  allowCustomBranding?: boolean; // Super Admin access permission for custom branding
  status: 'active' | 'expired' | 'blocked' | 'pending';
  accessPasscode: string;
  password?: string;        // Login password option
  grantedAt: string;        // ISO string
  accessDays: number;       // e.g. 7, 30, 90, 365, 99999 (lifetime)
  expiryDate: string;       // ISO string
  notes?: string;
}

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  instituteName?: string;
  coachingLogoUrl?: string;
  coachingTagline?: string;
  allowCustomBranding?: boolean;
  role: UserRole;
  accessPasscode?: string;
  accessDaysRemaining?: number;
  expiryDate?: string;
  isSuperAdmin: boolean;
  status?: string;
}

export interface AdminAuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
}

export interface TeacherTestimonial {
  id: string;
  name: string;
  roleOrInstitute: string;
  avatarUrl?: string;
  rating: number;
  quote: string;
}

export interface LandingPlatformConfig {
  headlineText: string;
  subtitleText: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPlanFeatures: string[];
  yearlyPlanFeatures: string[];
  whatsappNumber: string;
  testimonials: TeacherTestimonial[];
}

