import React from 'react';
import { ShieldCheck, GraduationCap } from 'lucide-react';

interface BrandLogoProps {
  logoUrl?: string | null;
  name?: string;
  tagline?: string;
  variant?: 'navbar' | 'header' | 'hero' | 'compact';
  theme?: 'light' | 'dark';
  showVerified?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MockTestProLogo: React.FC<BrandLogoProps> = ({
  logoUrl,
  name,
  tagline,
  variant = 'navbar',
  theme = 'light',
  showVerified = true,
  onClick,
  className = '',
}) => {
  // Check if logo is custom (not empty, not default static files)
  const isCustomLogo =
    Boolean(logoUrl) &&
    logoUrl !== '/logo.png' &&
    logoUrl !== '/mocktest_pro_logo.jpg' &&
    logoUrl?.trim() !== '';

  const displayName = name && name !== 'Coaching Institute' ? name : 'MockTest Pro';
  const isDefaultBrand = !isCustomLogo && displayName === 'MockTest Pro';

  // 1. DEFAULT MOCKTEST PRO VECTOR BRAND MARK (Sharp, clean badge matching Sample Images 1 & 2)
  const renderDefaultIcon = (iconSize: 'sm' | 'md' | 'lg' = 'md') => {
    const dimensions = {
      sm: 'w-9 h-9 rounded-xl',
      md: 'w-10 h-10 sm:w-11 sm:h-11 rounded-2xl',
      lg: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
    }[iconSize];

    return (
      <div
        className={`${dimensions} bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 p-2 shadow-md shadow-blue-500/25 ring-1 ring-blue-400/30 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
      >
        <svg
          className="w-full h-full text-white drop-shadow-xs"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" fillOpacity="0.25" />
          <path d="m9 14 2 2 4-4" stroke="#38bdf8" strokeWidth="2.8" />
        </svg>
      </div>
    );
  };

  // 2. CUSTOM COACHING LOGO CONTAINER (Raw, unboxed image matching Sample Image 3)
  const renderCustomLogo = (logoSize: 'sm' | 'md' | 'lg' = 'md') => {
    const imgHeight = {
      sm: 'h-8 sm:h-10 max-w-[200px]',
      md: 'h-10 sm:h-14 max-w-[260px] sm:max-w-[340px]',
      lg: 'h-14 sm:h-20 max-w-[320px] sm:max-w-[450px]',
    }[logoSize];

    return (
      <div className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-102">
        <img
          src={logoUrl!}
          alt={displayName}
          referrerPolicy="no-referrer"
          className={`${imgHeight} w-auto object-contain`}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  };

  // NAVBAR VARIANT (Top Navigation Bar - Sample Images 1, 2, 3)
  if (variant === 'navbar') {
    const isDarkTheme = theme === 'dark';

    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3.5 group text-left cursor-pointer select-none ${className}`}
      >
        {isCustomLogo ? (
          renderCustomLogo('md')
        ) : (
          <>
            {renderDefaultIcon('md')}
            <div className="flex flex-col text-left">
              <div className={`flex items-center gap-0 text-xl sm:text-2xl font-black tracking-tight leading-none ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                <span>MockTest</span>
                <span className="text-blue-600">Pro</span>
              </div>
              <span className={`block text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase mt-1 leading-none ${isDarkTheme ? 'text-blue-200/90' : 'text-slate-500'}`}>
                TEST SERIES PLATFORM
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  // HERO VARIANT (Test Start, Scorecard Header, Main Portal Header)
  if (variant === 'hero') {
    return (
      <div
        onClick={onClick}
        className={`bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 text-slate-900 shadow-md relative overflow-hidden ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            {isCustomLogo ? renderCustomLogo('lg') : renderDefaultIcon('lg')}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                {showVerified && !isDefaultBrand && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Verified Institute
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                {tagline || (isDefaultBrand ? 'Comprehensive Online Mock Test Platform' : 'Official Coaching Test Series Partner')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COMPACT VARIANT (Cards, Sidebars, Widgets)
  return (
    <div
      onClick={onClick}
      className={`p-3 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 ${className}`}
    >
      {isCustomLogo ? renderCustomLogo('sm') : renderDefaultIcon('sm')}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-black text-slate-900 truncate">{displayName}</h4>
        <p className="text-xs text-slate-500 truncate font-medium">
          {tagline || 'Test Series Portal'}
        </p>
      </div>
    </div>
  );
};
