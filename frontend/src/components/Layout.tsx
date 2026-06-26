import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePath, useNavigate } from "../lib/router";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/clientes", label: "Pacientes" },
  { href: "/Agendamentos", label: "Agendamentos" },
  { href: "/tratamentos", label: "Tratamentos" },
  { href: "/planos", label: "Planos" },
  { href: "/usuarios", label: "Usuários" },
];

function getActiveHref(path: string): string {
  if (path === "/") return "/";
  if (path.startsWith("/clientes")) return "/clientes";
  if (path.startsWith("/Agendamentos")) return "/Agendamentos";
  if (path.startsWith("/tratamentos")) return "/tratamentos";
  if (path.startsWith("/planos")) return "/planos";
  if (path.startsWith("/usuarios")) return "/usuarios";
  return "/";
}

function getTitle(path: string): string {
  if (path === "/") return "Dashboard";
  if (path.startsWith("/clientes/novo")) return "Cadastro de Paciente";
  if (path.startsWith("/clientes") && path.endsWith("/editar")) return "Editar Paciente";
  if (path.startsWith("/clientes") && path !== "/clientes") return "Detalhes do Paciente";
  if (path.startsWith("/clientes")) return "Pacientes";
  if (path.startsWith("/Agendamentos")) return "Agendamentos";
  if (path.startsWith("/tratamentos")) return "Tratamentos";
  if (path.startsWith("/planos")) return "Planos";
  if (path.startsWith("/usuarios")) return "Usuários";
  return "Dashboard";
}

function getSubtitle(path: string): string {
  if (path === "/") return "Visão geral do sistema";
  if (path.startsWith("/clientes/novo")) return "Preencha os dados do paciente";
  if (path.startsWith("/clientes") && path.endsWith("/editar")) return "Altere os dados do paciente";
  if (path.startsWith("/clientes") && path !== "/clientes") return "Informações completas do paciente";
  if (path.startsWith("/clientes")) return "Gerencie seus pacientes";
  if (path.startsWith("/Agendamentos")) return "Gerencie suas Agendamentos";
  if (path.startsWith("/tratamentos")) return "Gerencie seus tratamentos";
  if (path.startsWith("/planos")) return "Gerencie seus planos";
  if (path.startsWith("/usuarios")) return "Gerencie os usuários do sistema";
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
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-user">
          <span className="sidebar-user-name">{user?.name}</span>
          <button type="button" className="btn btn-outline sidebar-logout" onClick={logout}>
            Sair
          </button>
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
