import { AppleLogo } from "@shared/components/icons";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <div className="flex flex-col items-center text-center select-none">
      <div className="flex items-center justify-center text-slate-900 mb-2">
        <AppleLogo size={48} className="text-slate-900 hover:opacity-80 transition-opacity" />
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-400 font-medium px-4">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default AuthHeader;
