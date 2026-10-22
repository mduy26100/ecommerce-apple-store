import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, AUTH_STATUS } from "@features/auth";
import { USER_ROLES } from "@core/constants/role.constants";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { status, accessToken, user } = useAuthStore();

  if (status === AUTH_STATUS.CHECKING_AUTH) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium text-gray-500">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (accessToken && user) {
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
