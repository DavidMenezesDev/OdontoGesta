import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import RegisterAdmin from "./pages/RegisterAdmin";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function AppContent() {
  const { isAuthenticated, checkAuth } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth().finally(() => setChecking(false));
  }, [checkAuth]);

  if (checking) return null;

  if (isAuthenticated) return <Dashboard />;

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
