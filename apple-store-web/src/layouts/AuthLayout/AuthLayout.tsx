import { Outlet } from "react-router-dom";
import { AuthCard } from "./components/AuthCard";
import { AuthFooter } from "./components/AuthFooter";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100/50 flex flex-col justify-center items-center p-4 font-sans select-none">
      <AuthCard>
        <Outlet />
      </AuthCard>
      <AuthFooter />
    </div>
  );
};

export default AuthLayout;
