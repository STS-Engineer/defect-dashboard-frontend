import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import TablePage from "./pages/TablePage";
import CfTablePage from "./pages/tables/CfTablePage";
import CopieDetectionPage from "./pages/tables/CopieDetectionPage";
import Csl1TablePage from "./pages/tables/Csl1TablePage";
import DetectionDefautsPage from "./pages/tables/DetectionDefautsPage";
import QuantiteTablePage from "./pages/tables/QuantiteTablePage";
import TraitementCslPage from "./pages/tables/TraitementCslPage";
import TypeDefautsPage from "./pages/tables/TypeDefautsPage";
import ValidationProductionPage from "./pages/tables/ValidationProductionPage";
import ValidationQualitePage from "./pages/tables/ValidationQualitePage";

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/tables" element={<Navigate to="/tables/detection-defauts" replace />} />
        <Route path="/tables/detection-defauts" element={<DetectionDefautsPage />} />
        <Route path="/tables/cf" element={<CfTablePage />} />
        <Route path="/tables/quantite" element={<QuantiteTablePage />} />
        <Route path="/tables/type-defauts" element={<TypeDefautsPage />} />
        <Route path="/tables/csl1" element={<Csl1TablePage />} />
        <Route path="/tables/traitement-csl" element={
          <ProtectedRoute allowedRoles={["Superviseur"]}>
            <TraitementCslPage />
          </ProtectedRoute>
        } />
        <Route path="/traitement-csl" element={
          <ProtectedRoute allowedRoles={["Superviseur"]}>
            <TraitementCslPage />
          </ProtectedRoute>
        } />
        <Route path="/validation/production" element={
          <ProtectedRoute
            allowedRoles={["Responsable Production"]}
            deniedMessage="Accès refusé - Réservé au Responsable Production"
          >
            <ValidationProductionPage />
          </ProtectedRoute>
        } />
        <Route path="/validation-production" element={
          <ProtectedRoute
            allowedRoles={["Responsable Production"]}
            deniedMessage="Accès refusé - Réservé au Responsable Production"
          >
            <ValidationProductionPage />
          </ProtectedRoute>
        } />
        <Route path="/validation/qualite" element={
          <ProtectedRoute
            allowedRoles={["Responsable Qualite"]}
            deniedMessage="Accès refusé - Réservé au Responsable Qualité"
          >
            <ValidationQualitePage />
          </ProtectedRoute>
        } />
        <Route path="/validation-qualite" element={
          <ProtectedRoute
            allowedRoles={["Responsable Qualite"]}
            deniedMessage="Accès refusé - Réservé au Responsable Qualité"
          >
            <ValidationQualitePage />
          </ProtectedRoute>
        } />
        <Route path="/tables/copie-detection" element={<CopieDetectionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          {/* ← CHANGE PASSWORD outside Layout */}
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}