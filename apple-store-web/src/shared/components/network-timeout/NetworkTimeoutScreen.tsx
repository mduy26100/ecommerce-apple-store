import { Button } from 'antd';
import { ReloadOutlined, DisconnectOutlined } from '@ant-design/icons';

interface NetworkTimeoutScreenProps {
  title?: string;
  subtitle?: string;
  isFullScreen?: boolean;
}

export const NetworkTimeoutScreen = ({
  title = 'Connection Interrupted',
  subtitle = 'Server connection was interrupted. Please reload the page.',
  isFullScreen = true,
}: NetworkTimeoutScreenProps) => {
  const handleReload = () => {
    window.location.reload();
  };

  const disconnectIcon = (
    <DisconnectOutlined style={{ fontSize: 32, color: '#white' }} />
  );

  const containerClasses = isFullScreen
    ? 'fixed inset-0 min-h-screen w-screen z-50'
    : 'absolute inset-0 w-full h-full z-10';

  return (
    <div className={`${containerClasses} flex flex-col justify-center items-center bg-radial from-slate-900 via-slate-950 to-black select-none overflow-hidden`}>
      {/* Glow background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Glass container */}
      <div className="flex flex-col items-center p-8 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl max-w-sm w-full mx-4 transition-all duration-300 transform scale-100 hover:scale-[1.02]">
        
        {/* Disconnect logo/badge */}
        <div className="h-16 w-16 mb-6 rounded-2xl bg-linear-to-tr from-rose-600 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse text-white">
          {disconnectIcon}
        </div>

        {/* Text */}
        <h1 className="text-xl font-bold text-white tracking-wide font-sans mb-2 text-center">
          {title}
        </h1>
        <p className="text-xs text-slate-400 font-medium font-sans mb-6 text-center leading-relaxed">
          {subtitle}
        </p>

        {/* Action Button */}
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleReload}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none h-11 rounded-xl text-white font-semibold font-sans tracking-wide shadow-lg shadow-blue-500/25 transition-all duration-200"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
};

export default NetworkTimeoutScreen;
