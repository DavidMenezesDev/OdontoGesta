import { useState, useEffect } from "react";
import { fetchApi, postApi, putApi } from "../services/api";
import type { Anamnesis, Question } from "../types";

interface AnamnesisFormProps {
  anamnesisId: string | null;
  onClose: () => void;
}

function AnamnesisForm({ anamnesisId, onClose }: AnamnesisFormProps) {
  const [nome, setNome] = useState("");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newPergunta, setNewPergunta] = useState("");
  const [newTipo, setNewTipo] = useState(1);
  const [newAlerta, setNewAlerta] = useState(1);
  const [newLabel, setNewLabel] = useState("");
  const [newLabelAlerta, setNewLabelAlerta] = useState("");

  const isEditing = !!anamnesisId;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const questions = await fetchApi<Question[]>("/anamnesis/questions");
      setAllQuestions(questions);

      if (anamnesisId) {
        const anamnesis = await fetchApi<Anamnesis>(`/anamnesis/${anamnesisId}`);
        setNome(anamnesis.nome);
        setSelectedIds(new Set(anamnesis.questions.map((q) => q.question.id)));
      }
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [anamnesisId]);

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateQuestion = async () => {
    if (!newPergunta.trim()) return;
    setError("");
    try {
      const created = await postApi<Question>("/anamnesis/questions", {
        pergunta: newPergunta.trim(),
        tipo: newTipo,
        alerta: newAlerta,
        labelPergunta: newLabel.trim() || undefined,
        labelAlerta: newLabelAlerta.trim() || undefined,
      });
      setAllQuestions((prev) => [...prev, created]);
      setSelectedIds((prev) => new Set(prev).add(created.id));
      setNewPergunta("");
      setNewTipo(1);
      setNewAlerta(1);
      setNewLabel("");
      setNewLabelAlerta("");
      setShowNewQuestion(false);
    } catch {
      setError("Erro ao criar pergunta.");
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      setError("O campo nome é obrigatório.");
      return;
    }
    if (selectedIds.size === 0) {
      setError("Selecione pelo menos uma pergunta.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const body = {
      nome: nome.trim(),
      questions: Array.from(selectedIds).map((questionId, i) => ({
        questionId,
        ordem: i,
      })),
    };

    try {
      if (isEditing) {
        await putApi(`/anamnesis/${anamnesisId}`, body);
      } else {
        await postApi("/anamnesis", body);
      }
      setSuccess(isEditing ? "Anamnese atualizada com sucesso!" : "Anamnese criada com sucesso!");
      setTimeout(onClose, 1000);
    } catch {
      setError("Erro ao salvar anamnese.");
    } finally {
      setSaving(false);
    }
  };

  const TIPO_LABELS: Record<number, string> = {
    1: "Sim/Não/Não sei",
    2: "Sim/Não/Não sei + texto",
    3: "Texto livre",
    4: "Esquerda/Direita/Não sei",
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
        Carregando...
      </div>
    );
  }

  return (
    <div className="anamnesis-form-page">
      <div className="card anamnesis-form-card">
        <div className="anamnesis-form-header">
          <h2>{isEditing ? "Editar Modelo" : "Novo Modelo de Anamnese"}</h2>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Voltar
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <fieldset disabled={saving}>
          <div className="form-row">
            <label htmlFor="anamnese-nome">Nome do Modelo</label>
            <input
              id="anamnese-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Anamnese adulta"
            />
          </div>

          <div className="form-divider">Perguntas</div>

          <div className="question-list">
            {allQuestions.length === 0 ? (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                Nenhuma pergunta cadastrada. Crie a primeira abaixo.
              </p>
            ) : (
              allQuestions.map((q) => (
                <label key={q.id} className="question-item">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                  />
                  <div className="question-item-content">
                    <span className="question-item-text">{q.pergunta}</span>
                    <div className="question-item-meta">
                      <span className={`question-tipo question-tipo-${q.tipo}`}>
                        {TIPO_LABELS[q.tipo] ?? `Tipo ${q.tipo}`}
                      </span>
                      {q.labelPergunta && (
                        <span className="question-label">{q.labelPergunta}</span>
                      )}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          {showNewQuestion ? (
            <div className="new-question-form">
              <div className="form-row">
                <label>Pergunta</label>
                <input
                  type="text"
                  value={newPergunta}
                  onChange={(e) => setNewPergunta(e.target.value)}
                  placeholder="Digite a pergunta"
                />
              </div>
              <div className="form-grid">
                <div className="form-row">
                  <label>Tipo</label>
                  <select
                    className="form-select"
                    value={newTipo}
                    onChange={(e) => setNewTipo(Number(e.target.value))}
                  >
                    <option value={1}>Sim/Não/Não sei</option>
                    <option value={2}>Sim/Não/Não sei + texto</option>
                    <option value={3}>Texto livre</option>
                    <option value={4}>Esquerda/Direita/Não sei</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Alerta</label>
                  <select
                    className="form-select"
                    value={newAlerta}
                    onChange={(e) => setNewAlerta(Number(e.target.value))}
                  >
                    <option value={1}>Normal</option>
                    <option value={2}>Atenção</option>
                    <option value={3}>Crítico</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label>Label complementar (opcional)</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Onde dói? Intensidade?"
                />
              </div>
              <div className="form-row">
                <label>Label de alerta (opcional)</label>
                <input
                  type="text"
                  value={newLabelAlerta}
                  onChange={(e) => setNewLabelAlerta(e.target.value)}
                  placeholder='Ex: "Diabético", "Hipertenso"'
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-primary" onClick={handleCreateQuestion}>
                  Adicionar
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewQuestion(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-outline add-question-btn"
              onClick={() => setShowNewQuestion(true)}
            >
              + Nova Pergunta
            </button>
          )}

          <div className="settings-actions">
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              {saving ? "Salvando..." : "Salvar Modelo"}
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

export default AnamnesisForm;
