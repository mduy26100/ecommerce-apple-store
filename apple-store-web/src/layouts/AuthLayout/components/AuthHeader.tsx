interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <div className="flex flex-col items-center text-center select-none">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-lg">
        <span className="font-black text-2xl"></span>
      </div>

      <div className="mt-4 flex flex-col gap-1">
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
