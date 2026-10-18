import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import StorefrontLayout from "@layouts/StorefrontLayout/StorefrontLayout";
import AdminLayout from "@layouts/AdminLayout/AdminLayout";
import AuthLayout from "@layouts/AuthLayout/AuthLayout";

import HomePage from "@pages/storefront/Home/HomePage";

import DashboardPage from "@pages/admin/Dashboard/DashboardPage";
import ColorsPage from "@pages/admin/Colors/ColorsPage";
import StorageOptionsPage from "@pages/admin/StorageOptions/StorageOptionsPage";
import UsersPage from "@pages/admin/Users/UsersPage";
import RolesPage from "@pages/admin/Roles/RolesPage";
import TenantsPage from "@pages/admin/Tenants/TenantsPage";
import SettingsPage from "@pages/admin/Settings/SettingsPage";
import ProfilePage from "@pages/admin/Profile/ProfilePage";

import LoginPage from "@pages/auth/Login/LoginPage";
import RegisterPage from "@pages/auth/Register/RegisterPage";

import NotFoundPage from "@pages/common/NotFound/NotFoundPage";
import GlobalErrorBoundary from "@pages/common/Error/GlobalErrorBoundary";

import ProtectedRoute from "@app/routes/ProtectedRoute";
import PublicRoute from "@app/routes/PublicRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StorefrontLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        errorElement: <GlobalErrorBoundary inAdminContext={true} />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "colors",
            element: <ColorsPage />,
          },
          {
            path: "storage-options",
            element: <StorageOptionsPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "roles",
            element: <RolesPage />,
          },
          {
            path: "tenants",
            element: <TenantsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "*",
            element: <NotFoundPage inAdminContext={true} />,
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        errorElement: <GlobalErrorBoundary inAuthContext={true} />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
          {
            path: "*",
            element: <NotFoundPage inAuthContext={true} />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
