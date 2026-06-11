import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "sidebarCollapsed";

export default function Layout({ children }) {
  const location = useLocation();
  const accessDeniedMessage = location.state?.accessDeniedMessage;
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
  }, [collapsed]);

  // auto-collapse on narrow screens
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 900) setCollapsed(true);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={"app-shell" + (collapsed ? " sidebar-collapsed" : "") }>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(s => !s)} />
      <main className="main-content">
        <div className="page-container">
          {accessDeniedMessage && (
            <div className="access-denied-banner" role="alert">
              {accessDeniedMessage}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
