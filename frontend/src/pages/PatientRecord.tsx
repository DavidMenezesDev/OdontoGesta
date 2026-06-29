import { useState, useEffect, useCallback } from "react";
import { fetchApi, postApi, putApi } from "../services/api";
import { useNavigate } from "../lib/router";
import { exportAnamnesisPdf, type PdfAnswer } from "../services/pdf";
import type {
  Patient,
  Anamnesis,
  PatientAnamnesisResult,
  Enterprise,
} from "../types";

interface PatientRecordProps {
  patientId: string;
}

type Tab = "anamnesis" | "clinical" | "odontogram";

const TABS: { key: Tab; label: string }[] = [
  { key: "anamnesis", label: "Anamnese" },
  { key: "clinical", label: "Exame Clínico" },
  { key: "odontogram", label: "Odontograma" },
];

function PatientRecord({ patientId }: PatientRecordProps) {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("anamnesis");
  const [loading, setLoading] = useState(true);

  const [templates, setTemplates] = useState<Anamnesis[]>([]);
  const [patientAnamneses, setPatientAnamneses] = useState<PatientAnamnesisResult[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [saving, setSaving] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const currentPatientAnamnesis = patientAnamneses.find(
    (pa) => pa.anamnesisId === selectedTemplateId,
  );
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  useEffect(() => {
    Promise.all([
      fetchApi<Patient>(`/patients/${patientId}`),
      fetchApi<Anamnesis[]>("/anamnesis"),
      fetchApi<PatientAnamnesisResult[]>(`/patients/${patientId}/anamnesis`),
      fetchApi<Enterprise>("/enterprise"),
    ])
      .then(([patientData, templatesData, patientAnamnesesData, enterpriseData]) => {
        setPatient(patientData);
        setTemplates(templatesData);
        setPatientAnamneses(patientAnamnesesData);
        setEnterprise(enterpriseData);

        if (templatesData.length > 0) {
          setSelectedTemplateId(templatesData[0]!.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    if (currentPatientAnamnesis) {
      const answerMap: Record<string, string> = {};
      for (const a of currentPatientAnamnesis.answers) {
        answerMap[a.questionId] = a.resposta ?? "";
      }
      setAnswers(answerMap);
    } else if (selectedTemplate) {
      const emptyAnswers: Record<string, string> = {};
      for (const q of selectedTemplate.questions) {
        emptyAnswers[q.question.id] = "";
      }
      setAnswers(emptyAnswers);
    }
  }, [selectedTemplateId, currentPatientAnamnesis, selectedTemplate]);

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleExportPdf = useCallback(() => {
    if (!patient || !selectedTemplate) return;
    setExportingPdf(true);
    try {
      const pdfAnswers: PdfAnswer[] = selectedTemplate.questions
        .map((aq) => ({
          pergunta: aq.question.pergunta,
          resposta: answers[aq.question.id] ?? "",
        }))
        .filter((a) => a.resposta.trim() !== "");
      exportAnamnesisPdf(
        enterprise,
        patient,
        selectedTemplate.nome,
        pdfAnswers,
        currentPatientAnamnesis?.createdAt ?? "",
      );
    } finally {
      setExportingPdf(false);
    }
  }, [patient, enterprise, selectedTemplate, answers, currentPatientAnamnesis]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");

    try {
      const answersPayload = Object.entries(answers).map(([questionId, resposta]) => ({
        questionId,
        resposta,
      }));

      if (currentPatientAnamnesis) {
        await putApi(`/patients/${patientId}/anamnesis/${currentPatientAnamnesis.id}`, {
          answers: answersPayload,
        });
        setSaveMessage("Anamnese atualizada com sucesso!");
      } else {
        const result = await postApi<PatientAnamnesisResult>(
          `/patients/${patientId}/anamnesis`,
          { anamnesisId: selectedTemplateId, answers: answersPayload },
        );
        setPatientAnamneses((prev) => [result, ...prev]);
        setSaveMessage("Anamnese salva com sucesso!");
      }
    } catch {
      setSaveMessage("Erro ao salvar anamnese.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
        Carregando...
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
        Paciente não encontrado.
      </div>
    );
  }

  return (
    <div className="anamnesis-page">
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate(`/clientes/${patientId}`)}
          style={{ margin: 0 }}
        >
          Voltar
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>
            {patient.name}
          </h3>
          {patient.document && (
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
              CPF: {patient.document}
            </span>
          )}
          {patient.healthPlan?.name && (
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
              Plano: {patient.healthPlan.name}
            </span>
          )}
        </div>
      </div>

      <div className="ajustes-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`ajustes-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ajustes-content">
        {activeTab === "anamnesis" && (
          <AnamnesisTab
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
            selectedTemplate={selectedTemplate}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSave={handleSave}
            saving={saving}
            saveMessage={saveMessage}
            isEditing={!!currentPatientAnamnesis}
            onExportPdf={handleExportPdf}
            exportingPdf={exportingPdf}
            hasSavedAnamnesis={!!selectedTemplate}
          />
        )}
        {activeTab !== "anamnesis" && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Em desenvolvimento...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AnamnesisTabProps {
  templates: Anamnesis[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  selectedTemplate: Anamnesis | undefined;
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  saveMessage: string;
  isEditing: boolean;
  onExportPdf: () => void;
  exportingPdf: boolean;
  hasSavedAnamnesis: boolean;
}

function AnamnesisTab({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  selectedTemplate,
  answers,
  onAnswerChange,
  onSave,
  saving,
  saveMessage,
  isEditing,
  onExportPdf,
  exportingPdf,
  hasSavedAnamnesis,
}: AnamnesisTabProps) {
  return (
    <div className="card anamnesis-form-card">
      <div className="anamnesis-form-header">
        <div style={{ flex: 1 }}>
          <h2>Anamnese</h2>
        </div>
        {hasSavedAnamnesis && selectedTemplate && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onExportPdf}
            disabled={exportingPdf}
            style={{ margin: 0, whiteSpace: "nowrap" }}
          >
            {exportingPdf ? "Exportando..." : "Exportar PDF"}
          </button>
        )}
      </div>

      <div className="form-row" style={{ marginBottom: "1.5rem" }}>
        <label>Modelo de Anamnese</label>
        <select
          className="form-select"
          value={selectedTemplateId}
          onChange={(e) => onSelectTemplate(e.target.value)}
        >
          {templates.length === 0 && <option value="">Nenhum template disponível</option>}
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {isEditing && (
        <div
          style={{
            background: "#dbeafe",
            color: "#1e40af",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius)",
            fontSize: "0.8125rem",
            marginBottom: "1rem",
          }}
        >
          Anamnese já preenchida. Edite as respostas abaixo e salve para atualizar.
        </div>
      )}

      {selectedTemplate && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {selectedTemplate.questions.map((aq) => {
              const question = aq.question;
              const value = answers[question.id] ?? "";

              return (
                <div
                  key={aq.id}
                  style={{
                    padding: "0.75rem 1rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div style={{ marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {question.pergunta}
                    </span>
                    {aq.obrigatorio && (
                      <span style={{ color: "#dc2626", marginLeft: "0.25rem" }}>*</span>
                    )}
                  </div>

                  {question.labelPergunta && (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem", fontStyle: "italic" }}>
                      {question.labelPergunta}
                    </div>
                  )}

                  {question.alerta > 1 && question.labelAlerta && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: question.alerta === 2 ? "#92400e" : "#991b1b",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                      }}
                    >
                      ⚠ {question.labelAlerta}
                    </div>
                  )}

                  {question.tipo === 1 ? (
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name={question.id}
                          value="Sim"
                          checked={value === "Sim"}
                          onChange={() => onAnswerChange(question.id, "Sim")}
                        />
                        Sim
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name={question.id}
                          value="Não"
                          checked={value === "Não"}
                          onChange={() => onAnswerChange(question.id, "Não")}
                        />
                        Não
                      </label>
                    </div>
                  ) : question.tipo === 2 ? (
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.75rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius)",
                        fontSize: "0.875rem",
                        background: "var(--color-bg)",
                        color: "var(--color-text)",
                        boxSizing: "border-box",
                      }}
                      value={value}
                      onChange={(e) => onAnswerChange(question.id, e.target.value)}
                      placeholder="Digite sua resposta..."
                    />
                  ) : (
                    <textarea
                      className="form-textarea"
                      value={value}
                      onChange={(e) => onAnswerChange(question.id, e.target.value)}
                      placeholder="Digite sua resposta..."
                      rows={3}
                      style={{ width: "100%" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {saveMessage && (
            <div
              className={saveMessage.includes("sucesso") ? "form-success" : "form-error"}
              style={{ marginBottom: "1rem" }}
            >
              {saveMessage}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
              disabled={saving}
              style={{ margin: 0 }}
            >
              {saving ? "Salvando..." : isEditing ? "Atualizar Anamnese" : "Salvar Anamnese"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PatientRecord;
