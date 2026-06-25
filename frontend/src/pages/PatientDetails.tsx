import { useState, useEffect } from "react";
import { fetchApi } from "../services/api";
import type { Patient } from "../types";
import { useNavigate } from "../lib/router";

interface PatientDetailsProps {
  patientId: string;
}

function PatientDetails({ patientId }: PatientDetailsProps) {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<Patient>(`/patients/${patientId}`)
      .then(setPatient)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

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

  const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value ?? "—"}</span>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button type="button" className="btn btn-primary" onClick={() => navigate(`/clientes/${patientId}/editar`)} style={{ margin: 0 }}>
          Editar Paciente
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate("/clientes")} style={{ margin: 0 }}>
          Voltar
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
          Dados Pessoais
        </div>
        <div className="details-grid">
          <DetailRow label="Nome" value={patient.name} />
          <DetailRow label="Sexo" value={patient.gender === "MASCULINO" ? "Masculino" : patient.gender === "FEMININO" ? "Feminino" : null} />
          <DetailRow label="CPF" value={patient.document} />
          <DetailRow label="Data de Nascimento" value={patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("pt-BR") : null} />
          <DetailRow label="Nacionalidade" value={patient.nationality} />
          {patient.tags.length > 0 && (
            <div className="detail-row" style={{ gridColumn: "1 / -1" }}>
              <span className="detail-label">Etiquetas</span>
              <div className="detail-tags">
                {patient.tags.map((tag, i) => (
                  <span key={i} className="tag" style={{ cursor: "default" }}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
          Contato
        </div>
        <div className="details-grid">
          <DetailRow label="Email" value={patient.email} />
          <DetailRow label="Telefone" value={patient.phone} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
          Informações Adicionais
        </div>
        <div className="details-grid">
          <DetailRow label="Nº Prontuário" value={patient.recordNumber} />
          <DetailRow label="Profissão" value={patient.occupation} />
          <DetailRow label="Plano" value={patient.healthPlan?.name ?? null} />
        </div>
      </div>

      {patient.guardianName && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
            Dados do Responsável
          </div>
          <div className="details-grid">
            <DetailRow label="Nome" value={patient.guardianName} />
            <DetailRow label="Data de Nascimento" value={patient.guardianBirthDate ? new Date(patient.guardianBirthDate).toLocaleDateString("pt-BR") : null} />
            <DetailRow label="CPF" value={patient.guardianDocument} />
            <DetailRow label="Celular" value={patient.guardianPhone} />
          </div>
        </div>
      )}

      {patient.address && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
            Endereço
          </div>
          <p style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>{patient.address}</p>
        </div>
      )}

      {patient.notes && (
        <div className="card">
          <div className="form-divider" style={{ border: "none", paddingTop: 0, marginBottom: "1rem" }}>
            Observação
          </div>
          <p style={{ fontSize: "0.875rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{patient.notes}</p>
        </div>
      )}
    </>
  );
}

export default PatientDetails;
