import { useState, useEffect } from "react";
import { fetchApi, deleteApi } from "../services/api";
import AnamnesisForm from "./AnamnesisForm";
import type { Anamnesis } from "../types";

function AnamnesisList() {
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchApi<Anamnesis[]>("/anamnesis");
      setAnamneses(data);
    } catch {
      setError("Erro ao carregar anamneses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta anamnese?")) return;
    try {
      await deleteApi(`/anamnesis/${id}`);
      setAnamneses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Erro ao excluir anamnese.");
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    load();
  };

  if (showForm) {
    return <AnamnesisForm anamnesisId={editingId} onClose={handleFormClose} />;
  }

  return (
    <div className="anamnesis-page">
      <div className="card">
        <div className="anamnesis-header">
          <div>
            <h2>Modelos de Anamnese</h2>
            <p className="form-subtitle">Gerencie os modelos de anamnese da clínica</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Novo Modelo
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
            Carregando...
          </div>
        ) : anamneses.length === 0 ? (
          <div className="anamnesis-empty">
            Nenhum modelo de anamnese cadastrado. Clique em "Novo Modelo" para criar.
          </div>
        ) : (
          <div className="anamnesis-list">
            {anamneses.map((anamnesis) => (
              <div
                key={anamnesis.id}
                className="anamnesis-item"
                onClick={() => handleEdit(anamnesis.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") handleEdit(anamnesis.id); }}
              >
                <div className="anamnesis-item-info">
                  <strong className="anamnesis-item-name">{anamnesis.nome}</strong>
                  <span className="anamnesis-item-count">
                    {anamnesis.questions.length} pergunta(s)
                  </span>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <button
                    type="button"
                    className="btn-action btn-action-danger"
                    onClick={(e) => { e.stopPropagation(); handleDelete(anamnesis.id); }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnamnesisList;
