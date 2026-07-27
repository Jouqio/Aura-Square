import React from 'react';

interface AvatarProps {
  src?:         string | null;
  name?:        string | null;
  size?:        number;
  className?:   string;
}

export function Avatar({
  src, name, size = 36, className = '',
}: AvatarProps): React.JSX.Element {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'User avatar'}
        width={size} height={size}
        className={`rounded-full object-cover bg-surface-300 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full flex items-center justify-center
        bg-aura-700 text-white font-bold select-none
        ${className}
      `}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={name ?? 'User'}
    >
      {initials}
    </div>
  );
}
