import React from 'react';
import { MockTest, StudentInfo } from '../../types';
import { CoachingBrandingHeader } from '../common/CoachingBrandingHeader';
import {
  CheckCircle2,
  Megaphone,
  ExternalLink,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';

interface StudentExitScreenProps {
  test: MockTest | null;
  studentInfo?: StudentInfo;
  onReturnHome: () => void;
}

export const StudentExitScreen: React.FC<StudentExitScreenProps> = ({
  test,
  studentInfo,
  onReturnHome,
}) => {
  const coachingName = test?.coachingName || 'Coaching Institute';

  const startAd = test?.startAd;
  const resultAd = test?.resultAd;
  const leftAd = test?.leftAd;
  const rightAd = test?.rightAd;

  const featuredAd = (startAd?.enabled && (startAd.title || startAd.imageUrl)) ? startAd : ((resultAd?.enabled && (resultAd.title || resultAd.imageUrl)) ? resultAd : null);

  const formatExternalUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* 1. Coaching Institute Branding Header */}
      <CoachingBrandingHeader test={test} variant="hero" />

      {/* 2. Main Thank You Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5 relative overflow-hidden">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-200/80">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Test Completed / परीक्षा पूर्ण
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Thank You for Taking the Exam!
          </h1>
          <p className="text-sm font-bold text-emerald-700">
            (परीक्षा सत्र सफलतापूर्वक समाप्त हो गया है)
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {studentInfo?.name ? (
            <>Dear <strong className="text-slate-900">{studentInfo.name}</strong>, your answers have been securely recorded. </>
          ) : (
            <>Your answers have been securely recorded. </>)}
          Thank you for appearing in <strong className="text-slate-900">{test?.title || 'the online mock examination'}</strong>. We wish you the best for your competitive journey!
        </p>

        <div className="pt-2">
          <button
            onClick={onReturnHome}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Student Home (मुख्य पृष्ठ)
          </button>
        </div>
      </div>

      {/* 3. Featured Promotional Course Ad Banner (Featured Course Offer) */}
      {featuredAd && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-0.5 rounded-3xl shadow-lg animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-[22px] overflow-hidden p-6 sm:p-8 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider">
                <Megaphone className="w-4 h-4 text-amber-600" /> Recommended Course Offer (कोर्स सूचना)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {featuredAd.title || 'Special Online Course Offer'}
              </h2>
              {featuredAd.description && (
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
                  {featuredAd.description}
                </p>
              )}
              {featuredAd.courseUrl && (
                <div className="pt-1">
                  <a
                    href={formatExternalUrl(featuredAd.courseUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/25 transition transform hover:-translate-y-0.5"
                  >
                    {featuredAd.buttonText || '👉 Explore Recommended Course'}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {featuredAd.imageUrl && (
              <a
                href={formatExternalUrl(featuredAd.courseUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative shrink-0 w-full md:w-72 h-40 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md hover:border-amber-400 transition bg-slate-900"
              >
                <img
                  src={featuredAd.imageUrl}
                  alt={featuredAd.title || 'Course Banner'}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition flex items-center justify-center p-2">
                  <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    Open Course Link <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 4. Left & Right Sidebar Ads Display Grid */}
      {((leftAd?.enabled && (leftAd.imageUrl || leftAd.title)) || (rightAd?.enabled && (rightAd.imageUrl || rightAd.title))) && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
            <BookOpen className="w-4 h-4 text-blue-600" /> Featured Batches & Test Series Banners (विशेष ऑफर)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Ad Banner Card */}
            {leftAd?.enabled && (leftAd.imageUrl || leftAd.title) && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black uppercase border border-blue-200">
                      Left Side Banner Ad
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">160×600 / 300×600 Banner</span>
                  </div>

                  <a
                    href={formatExternalUrl(leftAd.courseUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-blue-400 transition relative bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white min-h-[160px] p-4 flex flex-col justify-end"
                  >
                    {leftAd.imageUrl && (
                      <img
                        src={leftAd.imageUrl}
                        alt={leftAd.title || 'Left Sidebar Banner'}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    )}
                    <div className="relative z-10 bg-slate-950/70 p-3 rounded-xl backdrop-blur-xs flex items-center justify-between gap-2 border border-white/10">
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                        Open Course <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>

                  {leftAd.title && (
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{leftAd.title}</h4>
                  )}
                </div>

                {leftAd.courseUrl && (
                  <a
                    href={formatExternalUrl(leftAd.courseUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    Explore Course Details <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Right Ad Banner Card */}
            {rightAd?.enabled && (rightAd.imageUrl || rightAd.title) && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase border border-indigo-200">
                      Right Side Banner Ad
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">160×600 / 300×600 Banner</span>
                  </div>

                  <a
                    href={formatExternalUrl(rightAd.courseUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-indigo-400 transition relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white min-h-[160px] p-4 flex flex-col justify-end"
                  >
                    {rightAd.imageUrl && (
                      <img
                        src={rightAd.imageUrl}
                        alt={rightAd.title || 'Right Sidebar Banner'}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    )}
                    <div className="relative z-10 bg-slate-950/70 p-3 rounded-xl backdrop-blur-xs flex items-center justify-between gap-2 border border-white/10">
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                        Open Course <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>

                  {rightAd.title && (
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{rightAd.title}</h4>
                  )}
                </div>

                {rightAd.courseUrl && (
                  <a
                    href={formatExternalUrl(rightAd.courseUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    Explore Course Details <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Fallback Default Institute Offer Banner if no custom ad configured */}
      {!featuredAd && (!leftAd?.enabled || !leftAd?.imageUrl) && (!rightAd?.enabled || !rightAd?.imageUrl) && (
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-blue-400" /> {coachingName} Official Batches
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Stay Connected for Upcoming Test Series & Live Batches
            </h3>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Enhance your exam performance with comprehensive practice sets, 1-on-1 doubt solving, and structured mock test series.
            </p>
          </div>

          <button
            onClick={onReturnHome}
            className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs sm:text-sm rounded-xl transition shrink-0 shadow-md"
          >
            Explore More Tests
          </button>
        </div>
      )}
    </div>
  );
};
