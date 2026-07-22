import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePath, useNavigate } from "../lib/router";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: "home" },
  { href: "/clientes", label: "Pacientes", icon: "users" },
  { href: "/Agendamentos", label: "Agendamentos", icon: "calendar" },
  { href: "/tratamentos", label: "Tratamentos", icon: "medical" },
  { href: "/planos", label: "Planos", icon: "shield" },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    home: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    users: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    calendar: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    medical: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    shield: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    settings: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    logout: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  };
  return icons[name] ?? null;
}

function getActiveHref(path: string): string {
  if (path === "/") return "/";
  if (path.startsWith("/clientes")) return "/clientes";
  if (path.startsWith("/Agendamentos")) return "/Agendamentos";
  if (path.startsWith("/tratamentos")) return "/tratamentos";
  if (path.startsWith("/planos")) return "/planos";
  if (path.startsWith("/ajustes")) return "/ajustes";
  return "/";
}

function getTitle(path: string): string {
  if (path === "/") return "Dashboard";
  if (path.startsWith("/clientes") && path.endsWith("/ficha")) return "Ficha do Paciente";
  if (path.startsWith("/clientes/novo")) return "Cadastro de Paciente";
  if (path.startsWith("/clientes") && path.endsWith("/editar")) return "Editar Paciente";
  if (path.startsWith("/clientes") && path !== "/clientes") return "Detalhes do Paciente";
  if (path.startsWith("/clientes")) return "Pacientes";
  if (path.startsWith("/Agendamentos")) return "Agendamentos";
  if (path.startsWith("/tratamentos")) return "Tratamentos";
  if (path.startsWith("/planos")) return "Planos";
  if (path.startsWith("/ajustes")) return "Ajustes";
  return "Dashboard";
}

function getSubtitle(path: string): string {
  if (path === "/") return "Visão geral do sistema";
  if (path.startsWith("/clientes") && path.endsWith("/ficha")) return "Prontuário completo do paciente";
  if (path.startsWith("/clientes/novo")) return "Preencha os dados do paciente";
  if (path.startsWith("/clientes") && path.endsWith("/editar")) return "Altere os dados do paciente";
  if (path.startsWith("/clientes") && path !== "/clientes") return "Informações completas do paciente";
  if (path.startsWith("/clientes")) return "Gerencie seus pacientes";
  if (path.startsWith("/Agendamentos")) return "Gerencie seus agendamentos";
  if (path.startsWith("/tratamentos")) return "Gerencie seus tratamentos";
  if (path.startsWith("/planos")) return "Gerencie seus planos";
  if (path.startsWith("/ajustes")) return "Configurações do sistema";
  return "Visão geral do sistema";
}

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const path = usePath();
  const navigate = useNavigate();
  const activeHref = getActiveHref(path);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>OdontoGestão</h1>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item${activeHref === item.href ? " active" : ""}`}
              onClick={(e) => handleNavClick(e, item.href)}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-user">
          <span className="sidebar-user-name">{user?.name}</span>
          <div className="sidebar-user-actions">
            <button
              type="button"
              className="sidebar-config-btn"
              onClick={() => navigate("/ajustes")}
            >
              <NavIcon name="settings" />
              Ajustes
            </button>
            <button type="button" className="btn btn-outline sidebar-logout" onClick={logout}>
              <NavIcon name="logout" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="sidebar-content">
        <header className="sidebar-header">
          <div>
            <h2>{getTitle(path)}</h2>
            <p>{getSubtitle(path)}</p>
          </div>
        </header>

        <main className="sidebar-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
