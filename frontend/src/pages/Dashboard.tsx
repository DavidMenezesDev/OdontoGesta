import { useNavigate } from "../lib/router";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="cards">
      <div className="card card-action" onClick={() => navigate("/clientes")}>
        <h3>Pacientes</h3>
        <div className="card-value">+</div>
        <div className="card-label">Cadastrar novo paciente</div>
      </div>
      <div className="card">
        <h3>Agendamentos</h3>
        <div className="card-value">—</div>
        <div className="card-label">Hoje</div>
      </div>
      <div className="card">
        <h3>Tratamentos</h3>
        <div className="card-value">—</div>
        <div className="card-label">Ativos</div>
      </div>
    </div>
  );
}

export default Dashboard;
