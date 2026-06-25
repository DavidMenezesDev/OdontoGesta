import { useState, useEffect, useCallback } from "react";
import { postApi, putApi, fetchApi } from "../services/api";
import type { HealthPlan, Patient } from "../types";
import { useNavigate } from "../lib/router";

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
}

function unformatPhone(value: string): string {
  return value.replace(/\D/g, "");
}

interface FormData {
  name: string;
  gender: string;
  document: string;
  birthDate: string;
  nationality: string;
  tags: string;
  email: string;
  phone: string;
  recordNumber: string;
  occupation: string;
  healthPlanId: string;
  address: string;
  notes: string;
  guardianName: string;
  guardianBirthDate: string;
  guardianDocument: string;
  guardianPhone: string;
}

const initialForm: FormData = {
  name: "",
  gender: "",
  document: "",
  birthDate: "",
  nationality: "",
  tags: "",
  email: "",
  phone: "",
  recordNumber: "",
  occupation: "",
  healthPlanId: "",
  address: "",
  notes: "",
  guardianName: "",
  guardianBirthDate: "",
  guardianDocument: "",
  guardianPhone: "",
};

interface PatientRegisterProps {
  patientId?: string;
}

function PatientRegister({ patientId }: PatientRegisterProps) {
  const navigate = useNavigate();
  const isEditing = !!patientId;
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [success, setSuccess] = useState(false);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [showGuardian, setShowGuardian] = useState(false);
  const [savedName, setSavedName] = useState("");

  useEffect(() => {
    fetchApi<HealthPlan[]>("/health-plans")
      .then(setHealthPlans)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!patientId) return;
    setLoadingData(true);
    fetchApi<Patient>(`/patients/${patientId}`)
      .then((p) => {
        setForm({
          name: p.name,
          gender: p.gender ?? "",
          document: p.document ?? "",
          birthDate: p.birthDate ? p.birthDate.slice(0, 10) : "",
          nationality: p.nationality ?? "",
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
          email: p.email ?? "",
          phone: p.phone,
          recordNumber: p.recordNumber ?? "",
          occupation: p.occupation ?? "",
          healthPlanId: p.healthPlanId ?? "",
          address: p.address ?? "",
          notes: p.notes ?? "",
          guardianName: p.guardianName ?? "",
          guardianBirthDate: p.guardianBirthDate ? p.guardianBirthDate.slice(0, 10) : "",
          guardianDocument: p.guardianDocument ?? "",
          guardianPhone: p.guardianPhone ?? "",
        });
        setSavedName(p.name);
        if (p.birthDate) {
          const age = calculateAge(p.birthDate.slice(0, 10));
          setShowGuardian(age < 18);
        }
      })
      .catch(() => setError("Erro ao carregar dados do paciente."))
      .finally(() => setLoadingData(false));
  }, [patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let formatted = value;
    if (name === "document") formatted = formatCPF(value);
    if (name === "phone" || name === "guardianPhone") formatted = formatPhone(value);

    setForm((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleBirthDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, birthDate: value }));

    if (value) {
      try {
        const age = calculateAge(value);
        setShowGuardian(age < 18);
      } catch {
        setShowGuardian(false);
      }
    } else {
      setShowGuardian(false);
    }
  }, []);

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      if (value && !form.tags.split(",").map((t) => t.trim()).includes(value)) {
        setForm((prev) => ({
          ...prev,
          tags: prev.tags ? `${prev.tags}, ${value}` : value,
        }));
      }
      input.value = "";
    }
  };

  const removeTag = (tag: string) => {
    const tags = form.tags.split(",").map((t) => t.trim()).filter((t) => t && t !== tag);
    setForm((prev) => ({ ...prev, tags: tags.join(", ") }));
  };

  const buildBody = () => {
    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      name: form.name,
      gender: form.gender || undefined,
      document: form.document ? form.document.replace(/\D/g, "") : undefined,
      nationality: form.nationality || undefined,
      email: form.email || undefined,
      phone: form.phone.replace(/\D/g, ""),
      recordNumber: form.recordNumber || undefined,
      occupation: form.occupation || undefined,
      birthDate: form.birthDate || undefined,
      address: form.address || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      guardianName: showGuardian ? form.guardianName || undefined : undefined,
      guardianBirthDate: showGuardian ? form.guardianBirthDate || undefined : undefined,
      guardianDocument: showGuardian ? form.guardianDocument?.replace(/\D/g, "") || undefined : undefined,
      guardianPhone: showGuardian ? unformatPhone(form.guardianPhone) || undefined : undefined,
      healthPlanId: form.healthPlanId || undefined,
      notes: form.notes || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name) {
      setError("O campo Nome é obrigatório.");
      return;
    }

    setLoading(true);
    setSavedName(form.name);

    try {
      const body = buildBody();

      if (isEditing) {
        await putApi(`/patients/${patientId}`, body);
      } else {
        await postApi("/patients", body);
      }

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error
        ? err.message.includes("409")
          ? "Já existe um paciente com este CPF ou email."
          : err.message
        : "Erro ao salvar paciente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
        Carregando dados do paciente...
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-center" style={{ minHeight: "initial", padding: "2rem 0" }}>
        <div className="card success-card">
          <h2 style={{ color: "var(--color-success)" }}>
            {isEditing ? "Paciente atualizado com sucesso!" : "Paciente cadastrado com sucesso!"}
          </h2>
          <p style={{ margin: "1rem 0", color: "var(--color-text-secondary)" }}>
            {savedName} {isEditing ? "foi atualizado" : "foi adicionado ao sistema"}.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            {isEditing ? (
              <button type="button" className="btn btn-primary" onClick={() => navigate(`/clientes/${patientId}`)}>
                Ver paciente
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { setSuccess(false); setForm(initialForm); setShowGuardian(false); }}
              >
                Novo cadastro
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={loading} style={{ border: "none", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="card">
            <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
              Dados Pessoais
            </div>
            <div className="form-grid">
              <div className="form-row" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="name">Nome *</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Nome completo do paciente" required />
              </div>

              <div className="form-row">
                <label htmlFor="gender">Sexo</label>
                <select id="gender" name="gender" value={form.gender} onChange={handleChange} className="form-select">
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="document">CPF</label>
                <input id="document" name="document" value={form.document} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
              </div>

              <div className="form-row">
                <label htmlFor="birthDate">Data de Nascimento</label>
                <input id="birthDate" name="birthDate" type="date" value={form.birthDate} onChange={handleBirthDateChange} />
              </div>

              <div className="form-row">
                <label htmlFor="nationality">Nacionalidade</label>
                <input id="nationality" name="nationality" value={form.nationality} onChange={handleChange} placeholder="Brasileiro(a)" />
              </div>

              <div className="form-row" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="tagsInput">Etiquetas</label>
                <input
                  id="tagsInput"
                  placeholder="Digite uma etiqueta e pressione Enter"
                  onKeyDown={handleTagsKeyDown}
                />
                {form.tags && (
                  <div className="tags-list" style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.5rem" }}>
                    {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="tag" onClick={() => removeTag(tag)}>
                        {tag} &times;
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
              Contato
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="paciente@email.com" />
              </div>
              <div className="form-row">
                <label htmlFor="phone">Telefone *</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="(11) 99999-8888" required maxLength={15} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
              Informações Adicionais
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label htmlFor="recordNumber">Nº Prontuário</label>
                <input id="recordNumber" name="recordNumber" value={form.recordNumber} onChange={handleChange} placeholder="0001" />
              </div>
              <div className="form-row">
                <label htmlFor="occupation">Profissão</label>
                <input id="occupation" name="occupation" value={form.occupation} onChange={handleChange} placeholder="Profissão do paciente" />
              </div>
              <div className="form-row">
                <label htmlFor="healthPlanId">Plano</label>
                <select id="healthPlanId" name="healthPlanId" value={form.healthPlanId} onChange={handleChange} className="form-select">
                  <option value="">Sem plano</option>
                  {healthPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {showGuardian && (
            <div className="card">
              <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
                Dados do Responsável
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                Paciente menor de 18 anos. Informe os dados do responsável.
              </p>
              <div className="form-grid">
                <div className="form-row" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="guardianName">Nome do Responsável</label>
                  <input id="guardianName" name="guardianName" value={form.guardianName} onChange={handleChange} placeholder="Nome completo" />
                </div>
                <div className="form-row">
                  <label htmlFor="guardianBirthDate">Data de Nascimento</label>
                  <input id="guardianBirthDate" name="guardianBirthDate" type="date" value={form.guardianBirthDate} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <label htmlFor="guardianDocument">CPF do Responsável</label>
                  <input id="guardianDocument" name="guardianDocument" value={form.guardianDocument} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
                </div>
                <div className="form-row">
                  <label htmlFor="guardianPhone">Celular</label>
                  <input id="guardianPhone" name="guardianPhone" value={form.guardianPhone} onChange={handleChange} placeholder="(11) 99999-8888" maxLength={15} />
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
              Endereço
            </div>
            <div className="form-row">
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro, cidade, UF, CEP"
                rows={3}
                className="form-textarea"
              />
            </div>
          </div>

          <div className="card">
            <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
              Observação
            </div>
            <div className="form-row">
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Observações sobre o paciente"
                rows={3}
                className="form-textarea"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Paciente"}
            </button>
          </div>
        </fieldset>
      </form>
    </>
  );
}

export default PatientRegister;
