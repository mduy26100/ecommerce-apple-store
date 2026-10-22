import { Outlet, ScrollRestoration } from "react-router-dom";
import StorefrontHeader from "./components/StorefrontHeader";
import StorefrontFooter from "./components/StorefrontFooter";
import ScrollToTopButton from "@shared/components/scroll-to-top/ScrollToTopButton";

export const StorefrontLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <ScrollRestoration />
      <StorefrontHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StorefrontFooter />
      <ScrollToTopButton />
    </div>
  );
};

export default StorefrontLayout;
