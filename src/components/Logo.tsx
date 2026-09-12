import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1 py-0.2',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
  };

  return (
    <div id="contentflow-brand-logo" className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 ${iconSizes[size]}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4/6 h-4/6">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m8 17 4 4 4-4" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-slate-900 ${textSizes[size]}`}>
            CONTENTFLOW
          </span>
          <span className={`rounded-md bg-indigo-600 text-white font-extrabold tracking-wider uppercase ${badgeSizes[size]}`}>
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 tracking-normal mt-0.5">
            Turn Ideas Into Content That Connects.
          </span>
        )}
      </div>
    </div>
  );
};
