import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, AUTH_STATUS } from "@features/auth";
import { USER_ROLES } from "@core/constants/role.constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status, accessToken, user } = useAuthStore();
  const location = useLocation();

  if (status === AUTH_STATUS.CHECKING_AUTH) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium text-gray-500">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  if (!accessToken || !user) {
    return <Navigate to="/admin/auth/login" state={{ from: location }} replace />;
  }

  if (user.role !== USER_ROLES.SUPER_ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
