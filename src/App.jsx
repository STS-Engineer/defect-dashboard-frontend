import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TablePage from "./pages/TablePage";
import FormsPage from "./pages/FormsPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <h2>Zork Qualité</h2>
          <p>Détection de défauts</p>

          <NavLink className="nav-link" to="/">
            Dashboards
          </NavLink>

          <NavLink className="nav-link" to="/table">
            Table principale
          </NavLink>

          <NavLink className="nav-link" to="/forms">
            Formulaires
          </NavLink>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/table" element={<TablePage />} />
            <Route path="/forms" element={<FormsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}