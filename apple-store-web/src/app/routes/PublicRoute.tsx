import React from "react";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  return <>{children}</>;
};

export default PublicRoute;
