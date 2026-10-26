import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import StorefrontLayout from "@layouts/StorefrontLayout/StorefrontLayout";
import AdminLayout from "@layouts/AdminLayout/AdminLayout";
import AuthLayout from "@layouts/AuthLayout/AuthLayout";

import { AuthCard } from "@layouts/AuthLayout/components/AuthCard";

import HomePage from "@pages/storefront/Home/HomePage";
import StorefrontProfilePage from "@pages/storefront/Profile/StorefrontProfilePage";
import CatalogProductsPage from "@pages/storefront/Products/CatalogProductsPage";
import ProductDetailPage from "@pages/storefront/ProductDetail/ProductDetailPage";
import CartPage from "@pages/storefront/Cart/CartPage";

import DashboardPage from "@pages/admin/Dashboard/DashboardPage";
import ColorsPage from "@pages/admin/Colors/ColorsPage";
import StorageOptionsPage from "@pages/admin/StorageOptions/StorageOptionsPage";
import CategoriesPage from "@pages/admin/Categories/CategoriesPage";
import ProductsPage from "@pages/admin/Products/ProductsPage";
import OrdersPage from "@pages/admin/Orders/OrdersPage";
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
      {
        path: "products",
        element: <CatalogProductsPage />,
      },
      {
        path: "products/:slug",
        element: <ProductDetailPage />,
      },
      {
        path: "product/:slug",
        element: <ProductDetailPage />,
      },
      {
        path: "profile",
        element: <StorefrontProfilePage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <div className="py-12 md:py-16 px-4 flex justify-center items-center">
              <AuthCard>
                <LoginPage isAdmin={false} />
              </AuthCard>
            </div>
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <div className="py-12 md:py-16 px-4 flex justify-center items-center">
              <AuthCard>
                <RegisterPage />
              </AuthCard>
            </div>
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: "/auth/login",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/auth/register",
    element: <Navigate to="/register" replace />,
  },
  {
    path: "/admin/auth/login",
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: <LoginPage isAdmin={true} />,
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
            path: "categories",
            element: <CategoriesPage />,
          },
          {
            path: "products",
            element: <ProductsPage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
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
    path: "*",
    element: <NotFoundPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
