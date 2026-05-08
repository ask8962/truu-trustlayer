import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

interface TruuLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function TruuLogo({ size = 32, showText = true, className = '' }: TruuLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AppLogo size={size} />
      {showText && (
        <span className="font-sans text-xl font-bold tracking-tight text-gradient-blue">
          TRUU
        </span>
      )}
    </div>
  );
}