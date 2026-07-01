import { useState, useEffect } from "react";
import { fetchApi, putApi } from "../services/api";
import type { Treatment, TreatmentClass } from "../types";

const CLASS_LABELS: Record<TreatmentClass, string> = {
  NONE: "Sem classificação",
  DIAGNOST: "Diagnóstico",
  ODONTO_CIRUR: "Cirurgia",
  ODONTO_PREVENTIVA: "Preventiva",
  ODONTO_REST: "Restauradora",
  ODONTO_PEDIAT: "Pediátrica",
  ORTOD_ORTOP: "Ortodontia/Ortopedia",
  PAC_ESPEC: "Pacientes Especiais",
};

function TreatmentSettings() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [filtered, setFiltered] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Treatment>>({});
  const [filterClass, setFilterClass] = useState<TreatmentClass | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchApi<Treatment[]>("/treatments");
      setTreatments(data);
    } catch {
      setError("Erro ao carregar tratamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let list = treatments;
    if (filterClass !== "ALL") {
      list = list.filter((t) => t.class === filterClass);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.description.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [treatments, filterClass, search]);

  const startEdit = (treatment: Treatment) => {
    setEditingId(treatment.id);
    setEditForm({
      class: treatment.class,
      value: treatment.value,
      cost: treatment.cost,
      notes: treatment.notes,
    });
    setSuccess("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await putApi<Treatment>(`/treatments/${id}`, editForm);
      setTreatments((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      setEditForm({});
      setSuccess("Tratamento atualizado com sucesso.");
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const totalCount = treatments.length;
  const filteredCount = filtered.length;

  return (
    <div className="treatment-settings">
      <div className="card">
        <div className="treatment-header">
          <div>
            <h2>Configuração de Tratamentos</h2>
            <p className="form-subtitle">
              {totalCount} tratamentos cadastrados
            </p>
          </div>
          <div className="treatment-filters">
            <input
              type="text"
              className="treatment-search"
              placeholder="Pesquisar procedimento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value as TreatmentClass | "ALL")}
              style={{ width: "auto", minWidth: "180px" }}
            >
              <option value="ALL">Todas as classes</option>
              {Object.entries(CLASS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({treatments.filter((t) => t.class === key).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        {loading ? (
          <div className="treatment-empty">Carregando...</div>
        ) : filteredCount === 0 ? (
          <div className="treatment-empty">
            {filterClass === "ALL"
              ? "Nenhum tratamento cadastrado."
              : "Nenhum tratamento nesta classe."}
          </div>
        ) : (
          <div className="patients-table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Procedimento</th>
                  <th style={{ width: "100px" }}>Valor (R$)</th>
                  <th style={{ width: "100px" }}>Custo (R$)</th>
                  <th>Observações</th>
                  <th style={{ width: "100px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((treatment) => {
                  const isEditing = editingId === treatment.id;
                  return (
                    <tr key={treatment.id}>
                      <td>
                        {isEditing ? (
                          <select
                            className="form-select"
                            value={editForm.class ?? treatment.class}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                class: e.target.value as TreatmentClass,
                              }))
                            }
                            style={{ fontSize: "0.875rem", padding: "0.375rem 0.5rem" }}
                          >
                            {Object.entries(CLASS_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`treatment-class-badge treatment-class-badge--${treatment.class.toLowerCase()}`}>
                            {CLASS_LABELS[treatment.class]}
                          </span>
                        )}
                      </td>
                      <td className="treatment-desc">{treatment.description}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="treatment-input"
                            value={editForm.value ?? treatment.value}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                value: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        ) : (
                          treatment.value.toFixed(2)
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="treatment-input"
                            value={editForm.cost ?? treatment.cost}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                cost: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        ) : (
                          treatment.cost.toFixed(2)
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="treatment-input"
                            value={editForm.notes ?? treatment.notes ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                notes: e.target.value || null,
                              }))
                            }
                            placeholder="Observações"
                          />
                        ) : (
                          <span className="treatment-notes">{treatment.notes ?? "-"}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", margin: 0 }}
                              disabled={saving}
                              onClick={() => handleSave(treatment.id)}
                            >
                              {saving ? "..." : "Salvar"}
                            </button>
                            <button
                              type="button"
                              className="btn-action"
                              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                              onClick={cancelEdit}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-action"
                            onClick={() => startEdit(treatment)}
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TreatmentSettings;
