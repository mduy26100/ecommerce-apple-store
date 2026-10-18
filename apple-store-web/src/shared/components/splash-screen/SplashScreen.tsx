import type { ReactNode } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface SplashScreenProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  isFullScreen?: boolean;
}

export const SplashScreen = ({
  title = 'Kryzo Admin',
  subtitle = 'Processing request...',
  icon,
  isFullScreen = true,
}: SplashScreenProps) => {
  const antIcon = (
    <LoadingOutlined
      style={{ fontSize: 48, color: '#3b82f6' }} // Tailwind blue-500
      spin
    />
  );

  // Default security shield icon if no custom icon is provided
  const defaultIcon = (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  // Determine outer container classes based on full screen flag
  const containerClasses = isFullScreen
    ? 'fixed inset-0 min-h-screen w-screen z-50'
    : 'absolute inset-0 w-full h-full z-10';

  return (
    <div className={`${containerClasses} flex flex-col justify-center items-center bg-radial from-slate-900 via-slate-950 to-black select-none overflow-hidden`}>
      {/* Glow background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Glass container */}
      <div className="flex flex-col items-center p-8 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl max-w-sm w-full mx-4 transition-all duration-300 transform scale-100 hover:scale-[1.02]">

        {/* Brand logo/badge */}
        <div className="h-16 w-16 mb-6 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-bounce">
          {icon || defaultIcon}
        </div>

        {/* Text */}
        <h1 className="text-xl font-bold text-white tracking-wide font-sans mb-1 text-center">
          {title}
        </h1>
        <p className="text-xs text-slate-400 font-medium font-sans mb-6 text-center">
          {subtitle}
        </p>

        {/* Spinner */}
        <div className="flex justify-center items-center h-16">
          <Spin indicator={antIcon} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
