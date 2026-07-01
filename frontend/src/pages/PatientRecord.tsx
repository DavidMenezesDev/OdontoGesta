import { useState, useEffect, useCallback, useRef } from "react";
import { fetchApi, postApi, putApi, deleteApi } from "../services/api";
import { useNavigate } from "../lib/router";
import { exportAnamnesisPdf, type PdfAnswer } from "../services/pdf";
import type {
  Patient,
  Anamnesis,
  PatientAnamnesisResult,
  Enterprise,
  User,
  HealthPlan,
  Treatment,
  PatientTreatment,
} from "../types";

interface PatientRecordProps {
  patientId: string;
}

type Tab = "anamnesis" | "treatment" | "odontogram";

const TABS: { key: Tab; label: string }[] = [
  { key: "anamnesis", label: "Anamnese" },
  { key: "treatment", label: "Tratamento" },
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
        {activeTab === "treatment" && (
          <TreatmentTab patientId={patientId} />
        )}
        {activeTab === "odontogram" && (
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

const PERMANENT_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
];

const DECIDUOUS_TEETH = [
  55, 54, 53, 52, 51,
  61, 62, 63, 64, 65,
  71, 72, 73, 74, 75,
  85, 84, 83, 82, 81,
];

const PERMANENT_SUPERIOR = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const PERMANENT_INFERIOR = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const DECIDUOUS_SUPERIOR = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const DECIDUOUS_INFERIOR = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const FACES_OPTIONS = [
  { value: "M", label: "M (Mesial)" },
  { value: "O/I", label: "O/I (Oclusal/Incisal)" },
  { value: "D", label: "D (Distal)" },
  { value: "V", label: "V (Vestibular)" },
  { value: "L/P", label: "L/P (Lingual/Palatino)" },
  { value: "T", label: "T (Tecido)" },
];

interface TreatmentTabProps {
  patientId: string;
}

function TreatmentTab({ patientId }: TreatmentTabProps) {
  const [treatments, setTreatments] = useState<PatientTreatment[]>([]);
  const [dentists, setDentists] = useState<User[]>([]);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [catalog, setCatalog] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [dentistId, setDentistId] = useState("");
  const [healthPlanId, setHealthPlanId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [treatmentId, setTreatmentId] = useState("");
  const [value, setValue] = useState("");
  const [teeth, setTeeth] = useState<number[]>([]);
  const [teethOpen, setTeethOpen] = useState(false);
  const [treatmentOpen, setTreatmentOpen] = useState(false);
  const [faces, setFaces] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [dentitionType, setDentitionType] = useState<"permanente" | "deciduo">("permanente");
  const [formDentition, setFormDentition] = useState<"permanente" | "deciduo">("permanente");
  const svgRef = useRef<HTMLObjectElement>(null);

  const updateToothColors = useCallback(() => {
    const obj = svgRef.current;
    if (!obj?.contentDocument) return;
    const doc = obj.contentDocument;

    const toothColor: Record<number, string> = {};
    const toothPrio: Record<number, number> = {};
    const priority: Record<string, number> = { COMPLETED: 3, IN_PROGRESS: 2, PLANNED: 1 };
    const colorMap: Record<string, string> = { COMPLETED: "#3b82f6", IN_PROGRESS: "#e97c2e", PLANNED: "#e97c2e" };

    for (const t of treatments) {
      if (t.status === "CANCELLED") continue;
      const prio = priority[t.status] ?? 0;
      for (const toothNum of t.teeth) {
        if (prio > (toothPrio[toothNum] ?? 0)) {
          toothPrio[toothNum] = prio;
          toothColor[toothNum] = colorMap[t.status];
        }
      }
    }

    const selected = new Set(Object.keys(toothColor).map(Number));
    for (const el of doc.querySelectorAll("[id^='tooth-']")) {
      const num = Number(el.id.replace("tooth-", ""));
      const color = selected.has(num) ? (toothColor[num] ?? "#FFFFFF") : "#FFFFFF";
      for (const path of el.querySelectorAll("path")) {
        const f = path.getAttribute("fill");
        if (f === "#FFFFFF" || f === "white" || f === "#3b82f6" || f === "#f97316") {
          path.setAttribute("fill", color);
        }
      }
      for (const circle of el.querySelectorAll("circle")) {
        const f = circle.getAttribute("fill");
        if (f === "#FFFFFF" || f === "white" || f === "#3b82f6" || f === "#f97316") {
          circle.setAttribute("fill", color);
        }
      }
    }
  }, [treatments]);

  useEffect(() => {
    if (svgRef.current?.contentDocument) updateToothColors();
  }, [updateToothColors]);

  useEffect(() => {
    if (!teethOpen && !treatmentOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (teethOpen && !target.closest(".teeth-dropdown")) setTeethOpen(false);
      if (treatmentOpen && !target.closest(".treatment-dropdown")) setTreatmentOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [teethOpen, treatmentOpen]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [treatmentsData, dentistsData, plansData, catalogData] =
        await Promise.all([
          fetchApi<PatientTreatment[]>(`/patients/${patientId}/treatments`),
          fetchApi<User[]>("/users/dentists"),
          fetchApi<HealthPlan[]>("/health-plans"),
          fetchApi<Treatment[]>("/treatments"),
        ]);
      setTreatments(treatmentsData);
      setDentists(dentistsData);
      setHealthPlans(plansData);
      setCatalog(catalogData);
      if (dentistsData.length > 0) setDentistId(dentistsData[0]!.id);
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!treatmentId) return;
    const selected = catalog.find((t) => t.id === treatmentId);
    if (selected) setValue(String(selected.value));
  }, [treatmentId, catalog]);

  const filteredCatalog = catalog.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleTooth = (tooth: number) => {
    setTeeth((prev) =>
      prev.includes(tooth)
        ? prev.filter((t) => t !== tooth)
        : [...prev, tooth],
    );
  };

  const toggleFace = (face: string) => {
    setFaces((prev) =>
      prev.includes(face)
        ? prev.filter((f) => f !== face)
        : [...prev, face],
    );
  };

  const superiorTeeth = formDentition === "permanente" ? PERMANENT_SUPERIOR : DECIDUOUS_SUPERIOR;
  const inferiorTeeth = formDentition === "permanente" ? PERMANENT_INFERIOR : DECIDUOUS_INFERIOR;
  const currentTeeth = formDentition === "permanente" ? PERMANENT_TEETH : DECIDUOUS_TEETH;

  const toggleArcadaSuperior = () => {
    setTeeth((prev) => {
      const allSelected = superiorTeeth.every((t) => prev.includes(t));
      if (allSelected) return prev.filter((t) => !superiorTeeth.includes(t));
      return [...new Set([...prev, ...superiorTeeth])];
    });
  };

  const toggleArcadaInferior = () => {
    setTeeth((prev) => {
      const allSelected = inferiorTeeth.every((t) => prev.includes(t));
      if (allSelected) return prev.filter((t) => !inferiorTeeth.includes(t));
      return [...new Set([...prev, ...inferiorTeeth])];
    });
  };

  const resetForm = () => {
    setDentistId(dentists.length > 0 ? dentists[0]!.id : "");
    setHealthPlanId("");
    setDate(new Date().toISOString().slice(0, 10));
    setTreatmentId("");
    setValue("");
    setTeeth([]);
    setFaces([]);
    setNotes("");
    setSearch("");
    setFormDentition("permanente");
  };

  const handleSave = async () => {
    if (!dentistId || !treatmentId || !date || !value) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await postApi<PatientTreatment>(
        `/patients/${patientId}/treatments`,
        {
          dentistId,
          treatmentId,
          healthPlanId: healthPlanId || undefined,
          date,
          value: Number(value),
          teeth: teeth.length > 0 ? teeth : undefined,
          faces: faces.length > 0 ? faces : undefined,
          notes: notes || undefined,
        },
      );
      setTreatments((prev) => [result, ...prev]);
      setDentitionType(formDentition);
      resetForm();
      setShowModal(false);
      setError("");
    } catch {
      setError("Erro ao salvar tratamento.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApi(`/patients/${patientId}/treatments/${id}`);
      setTreatments((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Erro ao remover tratamento.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
        Carregando...
      </div>
    );
  }

  return (
    <div className="treatment-tab">
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div className="dentition-toggle">
            <button
              type="button"
              className={`dentition-toggle-btn${dentitionType === "permanente" ? " active" : ""}`}
              onClick={() => setDentitionType("permanente")}
            >
              Permanente
            </button>
            <button
              type="button"
              className={`dentition-toggle-btn${dentitionType === "deciduo" ? " active" : ""}`}
              onClick={() => setDentitionType("deciduo")}
            >
              Decíduo
            </button>
          </div>
          <object
            key={dentitionType}
            ref={svgRef}
            data={dentitionType === "permanente" ? "/odontograma_completo.svg" : "/odontograma_deciduos.svg"}
            type="image/svg+xml"
            aria-label="Odontograma"
            onLoad={updateToothColors}
            style={{ maxWidth: "100%", height: "auto", maxHeight: "280px", pointerEvents: "auto" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
            Tratamentos Registrados
          </h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ margin: 0 }}
          >
            + Adicionar Tratamento
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {treatments.length === 0 ? (
          <p style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: "2rem" }}>
            Nenhum tratamento registrado.
          </p>
        ) : (
          <div className="treatment-list">
            {treatments.map((pt) => (
              <TreatmentCard
                key={pt.id}
                treatment={pt}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <h3 style={{ marginBottom: "1.5rem" }}>Adicionar Tratamento</h3>

            <div className="treatment-form-grid">
              <div className="form-row">
                <label>Profissional *</label>
                <select
                  className="form-select"
                  value={dentistId}
                  onChange={(e) => setDentistId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {dentists.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Plano</label>
                <select
                  className="form-select"
                  value={healthPlanId}
                  onChange={(e) => setHealthPlanId(e.target.value)}
                >
                  <option value="">Sem plano</option>
                  {healthPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Data *</label>
                <input
                  type="date"
                  className="form-select"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-row" style={{ gridColumn: "1 / -1" }}>
                <label>Tratamento *</label>
                <div className="treatment-dropdown">
                  <input
                    type="text"
                    className="form-select"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setTreatmentOpen(true);
                    }}
                    onFocus={() => setTreatmentOpen(true)}
                    placeholder="Digite para pesquisar tratamento..."
                  />
                  {treatmentOpen && (
                    <div className="treatment-dropdown-menu">
                      {filteredCatalog.length === 0 ? (
                        <div className="treatment-dropdown-empty">Nenhum tratamento encontrado</div>
                      ) : (
                        filteredCatalog.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className={`treatment-dropdown-item${treatmentId === t.id ? " selected" : ""}`}
                            onClick={() => {
                              setTreatmentId(t.id);
                              setSearch(t.description);
                              setTreatmentOpen(false);
                            }}
                          >
                            <span className="treatment-dropdown-desc">{t.description}</span>
                            <span className="treatment-dropdown-value">R$ {Number(t.value).toFixed(2)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <label>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-select"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Autopreenchido"
                />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: "1rem" }}>
              <label>Dentes</label>
              <div className="dentition-toggle" style={{ marginBottom: "0.5rem" }}>
                <button
                  type="button"
                  className={`dentition-toggle-btn${formDentition === "permanente" ? " active" : ""}`}
                  onClick={() => setFormDentition("permanente")}
                >
                  Permanente
                </button>
                <button
                  type="button"
                  className={`dentition-toggle-btn${formDentition === "deciduo" ? " active" : ""}`}
                  onClick={() => setFormDentition("deciduo")}
                >
                  Decíduo
                </button>
              </div>
              <div className="teeth-dropdown">
                <button
                  type="button"
                  className="teeth-dropdown-toggle"
                  onClick={() => setTeethOpen((prev) => !prev)}
                >
                  <span className="teeth-dropdown-text">
                    {teeth.length > 0
                      ? `${teeth.length} dente${teeth.length > 1 ? "s" : ""} selecionado${teeth.length > 1 ? "s" : ""}`
                      : "Selecione os dentes..."}
                  </span>
                  <span className="teeth-dropdown-arrow">▼</span>
                </button>
                {teethOpen && (
                  <div className="teeth-dropdown-menu">
                    <div className="arch-selectors">
                      <button
                        type="button"
                        className={`arch-btn${superiorTeeth.every((t) => teeth.includes(t)) ? " selected" : ""}`}
                        onClick={toggleArcadaSuperior}
                      >
                        Arcada Superior
                      </button>
                      <button
                        type="button"
                        className={`arch-btn${inferiorTeeth.every((t) => teeth.includes(t)) ? " selected" : ""}`}
                        onClick={toggleArcadaInferior}
                      >
                        Arcada Inferior
                      </button>
                    </div>
                    <div className="teeth-dropdown-grid">
                      {currentTeeth.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`tooth-item${teeth.includes(t) ? " selected" : ""}`}
                          onClick={() => toggleTooth(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row" style={{ marginTop: "1rem" }}>
              <label>Faces</label>
              <div className="faces-row">
                {FACES_OPTIONS.map((face) => (
                  <label key={face.value} className="face-check-label">
                    <input
                      type="checkbox"
                      checked={faces.includes(face.value)}
                      onChange={() => toggleFace(face.value)}
                    />
                    {face.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row" style={{ marginTop: "1rem" }}>
              <label>Observações</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações do tratamento..."
                rows={3}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
                style={{ margin: 0 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ margin: 0 }}
              >
                {saving ? "Salvando..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planejado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_ICON: Record<string, string> = {
  PLANNED: "",
  IN_PROGRESS: "",
  COMPLETED: "✓",
  CANCELLED: "✕",
};

interface TreatmentCardProps {
  treatment: PatientTreatment;
  onDelete: (id: string) => void;
}

function TreatmentCard({ treatment: pt, onDelete }: TreatmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".treatment-card-menu")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const teethText = pt.teeth.length > 0
    ? pt.teeth.slice(0, 5).join(", ") + (pt.teeth.length > 5 ? ` +${pt.teeth.length - 5}` : "")
    : "";
  const facesText = pt.faces.length > 0 ? pt.faces.join(", ") : "";

  return (
    <div className="treatment-card">
      <div className="treatment-card-left">
        <span className="treatment-card-date">
          {new Date(pt.date).toLocaleDateString("pt-BR")}
        </span>
        <span className="treatment-card-value-mobile">
          R$ {pt.value.toFixed(2)}
        </span>
        {teethText && (
          <span className="treatment-card-teeth-mobile">{teethText}</span>
        )}
      </div>

      <div className="treatment-card-center">
        <div className="treatment-card-name">{pt.treatment.description}</div>
        <div className="treatment-card-meta">
          {pt.healthPlan && (
            <span className="treatment-card-plan">{pt.healthPlan.name}</span>
          )}
          <span className="treatment-card-value">
            R$ {pt.value.toFixed(2)}
          </span>
          <span className="treatment-card-dentist">{pt.dentist.name}</span>
          {facesText && (
            <span className="treatment-card-faces">Faces: {facesText}</span>
          )}
        </div>
      </div>

      <div className="treatment-card-info-desktop">
        {teethText && (
          <span className="treatment-card-teeth">{teethText}</span>
        )}
        <span className="treatment-card-value-desktop">R$ {pt.value.toFixed(2)}</span>
      </div>

      <div className="treatment-card-status">
        <span className={`treatment-status treatment-status--${pt.status.toLowerCase()}`}>
          {STATUS_ICON[pt.status] && (
            <span className="treatment-status-icon">{STATUS_ICON[pt.status]}</span>
          )}
          {STATUS_LABEL[pt.status] ?? pt.status}
        </span>
      </div>

      <div className="treatment-card-menu">
        <button
          type="button"
          className="treatment-card-menu-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 10.833a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667ZM10 5a.833.833 0 1 0 0-1.667A.833.833 0 0 0 10 5ZM10 16.666A.833.833 0 1 0 10 15a.833.833 0 0 0 0 1.666Z" />
          </svg>
        </button>
        {menuOpen && (
          <div className="treatment-card-menu-dropdown">
            <button
              type="button"
              className="treatment-card-menu-item treatment-card-menu-item--danger"
              onClick={() => {
                onDelete(pt.id);
                setMenuOpen(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" />
              </svg>
              Remover
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientRecord;
