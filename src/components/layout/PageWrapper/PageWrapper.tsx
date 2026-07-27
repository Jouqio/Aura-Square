// PageWrapper.tsx — standard page padding container
import React from 'react';

interface PageWrapperProps {
  children:   React.ReactNode;
  className?: string;
  /** Remove horizontal padding (e.g. full-bleed game canvas) */
  flush?:     boolean;
}

export function PageWrapper({
  children,
  className = '',
  flush     = false,
}: PageWrapperProps): React.JSX.Element {
  return (
    <div className={`
      w-full min-h-full
      ${flush ? '' : 'px-4 py-5'}
      ${className}
    `}>
      {children}
    </div>
  );
}
