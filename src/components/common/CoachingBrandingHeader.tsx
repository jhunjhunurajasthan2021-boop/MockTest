import React from 'react';
import { MockTest } from '../../types';
import { useApp } from '../../context/AppContext';
import { MockTestProLogo } from './MockTestProLogo';

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
    'MockTest Pro';

  const tagline =
    customTagline ||
    test?.coachingTagline ||
    matchingTeacher?.coachingTagline ||
    currentUser?.coachingTagline ||
    'Official Online Mock Test Series';

  const mappedVariant =
    variant === 'topbar' ? 'navbar' : variant === 'compact' ? 'compact' : 'hero';

  return (
    <MockTestProLogo
      logoUrl={logoUrl}
      name={instituteName}
      tagline={tagline}
      variant={mappedVariant}
      className={className}
    />
  );
};

