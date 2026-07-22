import { useState, useEffect } from "react";
import { fetchApi } from "../services/api";
import type { Patient } from "../types";
import { useNavigate } from "../lib/router";

function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchApi<Patient[]>("/patients")
      .then(setPatients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.document && p.document.includes(q)) ||
      p.phone.includes(q)
    );
  });

  return (
    <div className="patients-page">
      <div className="card patients-card">
        <div className="patients-toolbar">
          <div className="form-row" style={{ margin: 0, flex: "1 1 320px", maxWidth: "400px" }}>
            <input
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/clientes/novo")} style={{ margin: 0 }}>
            + Adicionar Paciente
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
            {search ? "Nenhum paciente encontrado." : "Nenhum paciente cadastrado."}
          </div>
        ) : (
          <div className="patients-table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Plano</th>
                  <th style={{ width: "180px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((patient) => (
                  <tr key={patient.id}>
                    <td><strong>{patient.name}</strong></td>
                    <td>{patient.document ?? "—"}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.healthPlan?.name ?? "—"}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => navigate(`/clientes/${patient.id}`)}
                          title="Visualizar"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => navigate(`/clientes/${patient.id}/ficha`)}
                          title="Ficha do Paciente"
                        >
                          Ficha
                        </button>
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => navigate(`/clientes/${patient.id}/editar`)}
                          title="Editar"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Patients;
