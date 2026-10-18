import { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { AdminFooter } from "./components/AdminFooter";
import ScrollToTopButton from "@shared/components/scroll-to-top/ScrollToTopButton";

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <Layout className="min-h-screen bg-slate-50 flex flex-row overflow-hidden font-sans">
      <AdminSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Layout className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-slate-50">
        <AdminHeader
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed(!collapsed)}
          onMobileToggle={() => setMobileOpen(!mobileOpen)}
        />

        <main
          id="main-content-scroll"
          className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50 flex flex-col justify-between"
        >
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col mb-8">
            <Outlet />
          </div>
          <AdminFooter />
          <ScrollToTopButton />
        </main>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
