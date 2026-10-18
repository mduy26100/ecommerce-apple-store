import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

export const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="w-full max-w-md bg-white border border-slate-200/50 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-100/50 flex flex-col gap-6">
      {children}
    </div>
  );
};

export default AuthCard;
