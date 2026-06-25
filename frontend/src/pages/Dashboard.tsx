import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1>OdontoGestão</h1>
          <div className="header-right">
            <span className="user-name">{user?.name}</span>
            <button type="button" className="btn btn-outline" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="greeting">
          <h2>Bem-vindo, {user?.name}</h2>
          <p>Você está logado como {user?.role === "ADMIN" ? "Administrador" : user?.role}</p>
        </div>

        <div className="cards">
          <div className="card">
            <h3>Pacientes</h3>
            <div className="card-value">—</div>
            <div className="card-label">Total cadastrados</div>
          </div>
          <div className="card">
            <h3>Consultas</h3>
            <div className="card-value">—</div>
            <div className="card-label">Hoje</div>
          </div>
          <div className="card">
            <h3>Tratamentos</h3>
            <div className="card-value">—</div>
            <div className="card-label">Ativos</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
