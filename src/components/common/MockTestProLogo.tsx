import React, { useState, useEffect } from 'react';
import { ShieldCheck, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
  const [customImgFailed, setCustomImgFailed] = useState(false);
  const [defaultImgFailed, setDefaultImgFailed] = useState(false);

  useEffect(() => {
    setCustomImgFailed(false);
  }, [logoUrl]);

  let platformConfig: any = null;
  try {
    const appCtx = useApp();
    platformConfig = appCtx?.platformConfig;
  } catch (e) {
    platformConfig = null;
  }

  // Check if logo is custom (valid URL string, not default static files)
  const isCustomLogo =
    Boolean(logoUrl) &&
    typeof logoUrl === 'string' &&
    logoUrl !== '/logo.png' &&
    logoUrl !== '/mocktest_pro_logo.jpg' &&
    logoUrl.trim() !== '' &&
    (logoUrl.startsWith('http://') ||
     logoUrl.startsWith('https://') ||
     logoUrl.startsWith('data:image/') ||
     logoUrl.startsWith('/'));

  const displayName = name && name !== 'Coaching Institute' ? name : 'MockTest Pro';
  const isDefaultBrand = !isCustomLogo && displayName === 'MockTest Pro';

  const defaultAppLogoUrl = platformConfig?.customAppLogo || '/logo.png';

  // Fallback badge if image load fails completely
  const renderFallbackBadge = (logoSize: 'sm' | 'md' | 'lg' = 'md') => {
    const badgeSize = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-9 h-9 sm:w-10 sm:h-10 text-sm',
      lg: 'w-12 h-12 sm:w-16 sm:h-16 text-xl sm:text-2xl',
    }[logoSize];

    const initial = displayName ? displayName.trim().charAt(0).toUpperCase() : 'M';

    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black shadow-xs shrink-0 ${badgeSize}`}
      >
        {initial}
      </div>
    );
  };

  const renderLogoImage = (logoSize: 'sm' | 'md' | 'lg' = 'md') => {
    const imgHeight = {
      sm: 'h-8 sm:h-9 max-w-[120px]',
      md: 'h-9 sm:h-11 max-w-[180px]',
      lg: 'h-14 sm:h-20 max-w-[300px]',
    }[logoSize];

    // 1. Try Custom Logo if provided and not marked failed
    if (isCustomLogo && !customImgFailed) {
      return (
        <div className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
          <img
            src={logoUrl!}
            alt={displayName}
            referrerPolicy="no-referrer"
            className={`${imgHeight} w-auto object-contain`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setCustomImgFailed(true);
            }}
          />
        </div>
      );
    }

    // 2. Try Default App Logo if not marked failed
    if (defaultAppLogoUrl && !defaultImgFailed) {
      return (
        <div className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
          <img
            src={defaultAppLogoUrl}
            alt={displayName}
            className={`${imgHeight} w-auto object-contain drop-shadow-xs`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setDefaultImgFailed(true);
            }}
          />
        </div>
      );
    }

    // 3. Fallback Initial Badge
    return renderFallbackBadge(logoSize);
  };

  // NAVBAR VARIANT (Top Navigation Bar)
  if (variant === 'navbar') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 group text-left cursor-pointer select-none ${className}`}
      >
        {renderLogoImage('md')}

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
              {displayName}
            </span>
            {showVerified && !isDefaultBrand && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Verified
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 leading-tight">
            {tagline || (isDefaultBrand ? 'Online Test Series' : 'Official Partner')}
          </span>
        </div>
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
            {renderLogoImage('lg')}

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
      {renderLogoImage('sm')}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-black text-slate-900 truncate">{displayName}</h4>
        <p className="text-xs text-slate-500 truncate font-medium">
          {tagline || 'Test Series Portal'}
        </p>
      </div>
    </div>
  );
};
