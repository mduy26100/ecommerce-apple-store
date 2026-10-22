import React, { useId } from "react";

export interface AppleLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  color?: string;
  useGradient?: boolean;
}

export const AppleLogo = ({
  className = "",
  size = "1em",
  color,
  fill,
  useGradient = true,
  ...props
}: AppleLogoProps) => {
  const gradientId = useId();
  const stitchGradientId = useId();
  const effectiveFill = fill || color;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="45%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={stitchGradientId} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>

      <path
        d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
        fill={effectiveFill ? effectiveFill : useGradient ? `url(#${gradientId})` : "currentColor"}
      />

      <path
        d="M6.8 17.5C8.8 14 11 11 15.5 9.5"
        fill="none"
        stroke={effectiveFill && effectiveFill !== "currentColor" ? effectiveFill : `url(#${stitchGradientId})`}
        strokeWidth="0.85"
        strokeDasharray="1.2 1"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
};

export const UrbanStitchLogo = AppleLogo;
export default AppleLogo;
