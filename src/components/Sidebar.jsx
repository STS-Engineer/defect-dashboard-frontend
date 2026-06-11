import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Table2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COMMON_TABLE_LINKS = [
  { to: "/tables/detection-defauts", label: "Détection de défauts" },
  { to: "/tables/cf", label: "CF" },
  { to: "/tables/csl1", label: "CSL1" },
  { to: "/tables/quantite", label: "Quantité" },
  { to: "/tables/type-defauts", label: "Type de défauts" },
  { to: "/tables/copie-detection", label: "Copie de détection" },
];

const ROLE_TABLE_LINKS = {
  Superviseur: [{ to: "/tables/traitement-csl", label: "Traitement CSL" }],
  "Responsable Production": [
    { to: "/validation/production", label: "Validation Production" },
  ],
  "Responsable Qualite": [
    { to: "/validation/qualite", label: "Validation Qualité" },
  ],
};

function SidebarIcon({ children }) {
  return <span className="nav-icon">{children}</span>;
}

export default function Sidebar({ collapsed, onToggle }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const tableLinks = [
    ...COMMON_TABLE_LINKS,
    ...(ROLE_TABLE_LINKS[currentUser?.role] || []),
  ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className={"sidebar" + (collapsed ? " collapsed" : "")} aria-hidden={false}>
      <div className="sidebar-top">
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink end to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <SidebarIcon>
            <LayoutDashboard size={18} />
          </SidebarIcon>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <div className="nav-section">
          <div className="nav-section-title">Tables</div>
          {tableLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => "board-link" + (isActive ? " active" : "")}
              title={collapsed ? link.label : undefined}
            >
              <SidebarIcon>
                <Table2 size={18} />
              </SidebarIcon>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {(currentUser?.display_name || currentUser?.username || "U").slice(0, 1)}
          </div>
          <div className="sidebar-user-text">
            <strong>{currentUser?.display_name || currentUser?.username}</strong>
            <span>{currentUser?.role}</span>
          </div>
        </div>

        <button className="logout-button" type="button" onClick={handleLogout} title="Déconnexion">
          <LogOut size={16} />
          <span className="nav-label">Déconnexion</span>
        </button>

        <button className="collapse-hint" type="button" onClick={onToggle}>
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          <span className="nav-label">{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>
    </aside>
  );
}
