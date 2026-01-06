// src/components/ui/SETLogo.tsx
import { cn } from '@/lib/utils';

interface SETLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const sizeMap = {
  sm: { logo: 32, textSize: 'text-xs' },
  md: { logo: 48, textSize: 'text-sm' },
  lg: { logo: 64, textSize: 'text-base' },
  xl: { logo: 80, textSize: 'text-lg' },
};

export function SETLogo({ className, size = 'md', showText = false }: SETLogoProps) {
  const { logo, textSize } = sizeMap[size];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Toyota-style logo - three ellipses forming the iconic "T" */}
      <svg
        width={logo}
        height={logo}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Southeast Toyota Distributors Logo"
      >
        {/* Outer ellipse - the ring */}
        <ellipse
          cx="50"
          cy="50"
          rx="47"
          ry="32"
          stroke="#EB0A1E"
          strokeWidth="4"
          fill="none"
        />
        {/* Inner horizontal ellipse - top of T */}
        <ellipse
          cx="50"
          cy="35"
          rx="24"
          ry="15"
          stroke="#EB0A1E"
          strokeWidth="4"
          fill="none"
        />
        {/* Inner vertical ellipse - stem of T */}
        <ellipse
          cx="50"
          cy="55"
          rx="10"
          ry="27"
          stroke="#EB0A1E"
          strokeWidth="4"
          fill="none"
        />
      </svg>

      {showText && (
        <div className={cn('mt-2 text-center font-semibold text-slate-700', textSize)}>
          <div>Southeast Toyota</div>
          <div className="text-[0.75em] font-normal text-slate-500">Distributors, LLC</div>
        </div>
      )}
    </div>
  );
}

// Simple icon version without text for smaller use cases
export function SETLogoIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SET Logo"
    >
      {/* Outer ellipse */}
      <ellipse
        cx="50"
        cy="50"
        rx="47"
        ry="32"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      {/* Inner horizontal ellipse */}
      <ellipse
        cx="50"
        cy="35"
        rx="24"
        ry="15"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      {/* Inner vertical ellipse */}
      <ellipse
        cx="50"
        cy="55"
        rx="10"
        ry="27"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}
