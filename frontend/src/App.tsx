import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import RegisterAdmin from "./pages/RegisterAdmin";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientRegister from "./pages/PatientRegister";
import PatientDetails from "./pages/PatientDetails";
import Layout from "./components/Layout";
import { usePath, matchPath } from "./lib/router";
import "./App.css";

function AppContent() {
  const { isAuthenticated, checkAuth } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [checking, setChecking] = useState(true);
  const path = usePath();

  useEffect(() => {
    checkAuth().finally(() => setChecking(false));
  }, [checkAuth]);

  if (checking) return null;

  if (isAuthenticated) {
    const patientView = matchPath("/clientes/:id", path);
    const patientEdit = matchPath("/clientes/:id/editar", path);

    if (path === "/") {
      return (
        <Layout>
          <Dashboard />
        </Layout>
      );
    }

    if (path === "/clientes") {
      return (
        <Layout>
          <Patients />
        </Layout>
      );
    }

    if (path === "/clientes/novo") {
      return (
        <Layout>
          <PatientRegister />
        </Layout>
      );
    }

    if (patientView && !patientEdit) {
      return (
        <Layout>
          <PatientDetails patientId={patientView["id"]!} />
        </Layout>
      );
    }

    if (patientEdit) {
      return (
        <Layout>
          <PatientRegister patientId={patientEdit["id"]!} />
        </Layout>
      );
    }

    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  if (showRegister) return <RegisterAdmin onBackToLogin={() => setShowRegister(false)} />;

  return <Login onShowRegister={() => setShowRegister(true)} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
