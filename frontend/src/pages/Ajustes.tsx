import { useState } from "react";
import Settings from "./Settings";
import Permissions from "./Permissions";
import Users from "./Users";
import AnamnesisList from "./AnamnesisList";
import { useAuth } from "../contexts/AuthContext";

type Tab = "clinica" | "permissoes" | "usuarios" | "anamneses";

const TABS: { key: Tab; label: string; adminOnly?: boolean }[] = [
  { key: "clinica", label: "Informações da Clínica" },
  { key: "permissoes", label: "Permissões", adminOnly: true },
  { key: "usuarios", label: "Usuários", adminOnly: true },
  { key: "anamneses", label: "Anamneses", adminOnly: true },
];

function Ajustes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [activeTab, setActiveTab] = useState<Tab>("clinica");

  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="ajustes-page">
      <nav className="ajustes-tabs">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`ajustes-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="ajustes-content">
        {activeTab === "clinica" && <Settings />}
        {activeTab === "permissoes" && <Permissions />}
        {activeTab === "usuarios" && <Users />}
        {activeTab === "anamneses" && <AnamnesisList />}
      </div>
    </div>
  );
}

export default Ajustes;
