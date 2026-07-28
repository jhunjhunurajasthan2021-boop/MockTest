import React from 'react';
import { MockTest } from '../../types';
import { useApp } from '../../context/AppContext';
import { Building2, Award, ShieldCheck, Sparkles } from 'lucide-react';

interface CoachingBrandingHeaderProps {
  test?: MockTest | null;
  customLogoUrl?: string;
  customName?: string;
  customTagline?: string;
  variant?: 'hero' | 'topbar' | 'compact';
  className?: string;
}

export const CoachingBrandingHeader: React.FC<CoachingBrandingHeaderProps> = ({
  test,
  customLogoUrl,
  customName,
  customTagline,
  variant = 'hero',
  className = '',
}) => {
  const { teachers, currentUser } = useApp();

  // Resolve matching teacher if test is provided
  const matchingTeacher = test
    ? teachers.find(
        (t) =>
          t.id === test.teacherId ||
          t.email.toLowerCase() === test.teacherId.toLowerCase()
      )
    : null;

  // Resolve Logo, Name, and Tagline in order of priority:
  // 1. Explicit props passed
  // 2. Test-level saved coaching branding
  // 3. Matching teacher's profile branding
  // 4. Currently logged in user (if previewing in Dashboard)
  // 5. Fallback defaults

  const logoUrl =
    customLogoUrl ||
    test?.coachingLogoUrl ||
    matchingTeacher?.coachingLogoUrl ||
    currentUser?.coachingLogoUrl ||
    '';

  const instituteName =
    customName ||
    test?.coachingName ||
    matchingTeacher?.instituteName ||
    currentUser?.instituteName ||
    'Coaching Institute';

  const tagline =
    customTagline ||
    test?.coachingTagline ||
    matchingTeacher?.coachingTagline ||
    currentUser?.coachingTagline ||
    'Official Online Mock Test Series';

  if (variant === 'topbar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={instituteName}
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl bg-white p-1 border border-slate-700/80 shadow-xs shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 font-black text-xs">
            {instituteName.charAt(0).toUpperCase() || 'C'}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-white truncate leading-tight">
              {instituteName}
            </span>
            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30">
              <ShieldCheck className="w-3 h-3 text-blue-400" /> Verified
            </span>
          </div>
          {tagline && (
            <p className="text-[10px] text-slate-300 truncate leading-tight font-medium">
              {tagline}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-3 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 ${className}`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={instituteName}
            className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
            {instituteName.charAt(0).toUpperCase() || 'C'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black text-slate-900 truncate">{instituteName}</h4>
          <p className="text-[11px] text-slate-500 truncate font-medium">{tagline}</p>
        </div>
      </div>
    );
  }

  // Hero Variant (Default for Test Start Registration page & Scorecard Header)
  return (
    <div className={`bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 text-slate-900 shadow-xs relative overflow-hidden ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-4 sm:gap-5">
          {logoUrl ? (
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
              <img
                src={logoUrl}
                alt={instituteName}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 font-black text-2xl sm:text-3xl">
              {instituteName.charAt(0).toUpperCase() || 'C'}
            </div>
          )}

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-blue-600" /> Coaching Partner Portal
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {instituteName}
            </h2>

            {tagline && (
              <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-snug">
                {tagline}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/90 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <div className="text-left">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Official Examination</span>
            <span className="text-xs font-black text-slate-800">Live Student Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
