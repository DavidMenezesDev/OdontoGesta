import { useState, useEffect, useCallback } from "react";
import { fetchApi, postApi, putApi, deleteApi } from "../services/api";
import type { Appointment, Patient, User, AppointmentStatus } from "../types";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "#2563eb",
  CONFIRMED: "#22c55e",
  IN_PROGRESS: "#f59e0b",
  COMPLETED: "#64748b",
  CANCELLED: "#ef4444",
  NO_SHOW: "#94a3b8",
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateISO(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface AppointmentFormData {
  date: string;
  time: string;
  endTime: string;
  patientId: string;
  dentistId: string;
  notes: string;
  enableFollowUp: boolean;
  followUpOption: "1" | "6" | "12" | "custom" | "date";
  followUpCustomMonths: string;
  followUpSpecificDate: string;
}

const emptyForm: AppointmentFormData = {
  date: "",
  time: "09:00",
  endTime: "09:30",
  patientId: "",
  dentistId: "",
  notes: "",
  enableFollowUp: false,
  followUpOption: "1",
  followUpCustomMonths: "",
  followUpSpecificDate: "",
};

function Appointments() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AppointmentFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<User[]>([]);

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpAppointmentId, setFollowUpAppointmentId] = useState<string | null>(null);
  const [followUpOption, setFollowUpOption] = useState<"1" | "6" | "12" | "custom" | "date">("1");
  const [followUpCustomMonths, setFollowUpCustomMonths] = useState("");
  const [followUpSpecificDate, setFollowUpSpecificDate] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const selectedDateStr = formatDateISO(year, month, selectedDay);

  const loadAppointments = useCallback(() => {
    setLoading(true);
    const m = String(month + 1).padStart(2, "0");
    fetchApi<Appointment[]>(`/appointments?year=${year}&month=${m}`)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  useEffect(() => {
    fetchApi<Patient[]>("/patients").then(setPatients).catch(() => {});
    fetchApi<User[]>("/users/dentists").then(setDentists).catch(() => {});
  }, []);

  const dayAppointments = appointments.filter((a) => a.date.startsWith(selectedDateStr));

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else { setMonth(month - 1); }
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else { setMonth(month + 1); }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const hasAppointments = (day: number): boolean => {
    const dateStr = formatDateISO(year, month, day);
    return appointments.some((a) => a.date.startsWith(dateStr));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: selectedDateStr });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (apt: Appointment) => {
    const d = new Date(apt.date);
    const endD = apt.endTime ? new Date(apt.endTime) : null;
    setEditingId(apt.id);
    setForm({
      date: apt.date.slice(0, 10),
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      endTime: endD ? `${String(endD.getHours()).padStart(2, "0")}:${String(endD.getMinutes()).padStart(2, "0")}` : "",
      patientId: apt.patientId,
      dentistId: apt.dentistId,
      notes: apt.notes ?? "",
      enableFollowUp: false,
      followUpOption: "1",
      followUpCustomMonths: "",
      followUpSpecificDate: "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.date || !form.time || !form.patientId || !form.dentistId) {
      setFormError("Data, horário, paciente e dentista são obrigatórios.");
      return;
    }

    setFormLoading(true);
    const datetime = new Date(`${form.date}T${form.time}:00`);
    const endDatetime = form.endTime ? new Date(`${form.date}T${form.endTime}:00`) : null;

    try {
      const body = {
        date: datetime.toISOString(),
        endTime: endDatetime?.toISOString(),
        patientId: form.patientId,
        dentistId: form.dentistId,
        notes: form.notes || undefined,
      };

      if (editingId) {
        await putApi(`/appointments/${editingId}`, body);
      } else {
        const created = await postApi<Appointment>("/appointments", body);

        if (form.enableFollowUp && form.followUpOption) {
          const followUpBody: Record<string, unknown> = {};
          if (form.followUpOption === "1") followUpBody.months = 1;
          else if (form.followUpOption === "6") followUpBody.months = 6;
          else if (form.followUpOption === "12") followUpBody.months = 12;
          else if (form.followUpOption === "custom") {
            const m = parseInt(form.followUpCustomMonths, 10);
            if (m > 0 && Number.isInteger(m)) followUpBody.months = m;
          } else if (form.followUpOption === "date" && form.followUpSpecificDate) {
            followUpBody.specificDate = new Date(form.followUpSpecificDate).toISOString();
          }

          if (followUpBody.months || followUpBody.specificDate) {
            await postApi(`/appointments/${created.id}/follow-up`, followUpBody);
          }
        }
      }

      setShowModal(false);
      loadAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar agendamento.";
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja remover este agendamento?")) return;
    try {
      await deleteApi(`/appointments/${id}`);
      loadAppointments();
    } catch {
      // ignore
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await putApi(`/appointments/${id}`, { status });
      loadAppointments();
    } catch {
      // ignore
    }
  };

  const openFollowUpModal = (appointmentId: string) => {
    setFollowUpAppointmentId(appointmentId);
    setFollowUpOption("1");
    setFollowUpCustomMonths("");
    setFollowUpSpecificDate("");
    setFormError("");
    setShowFollowUpModal(true);
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpAppointmentId) return;

    setFollowUpLoading(true);
    setFormError("");

    try {
      const body: Record<string, unknown> = {};

      if (followUpOption === "1") body.months = 1;
      else if (followUpOption === "6") body.months = 6;
      else if (followUpOption === "12") body.months = 12;
      else if (followUpOption === "custom") {
        const m = parseInt(followUpCustomMonths, 10);
        if (!m || m <= 0 || !Number.isInteger(m)) {
          setFormError("Informe um número inteiro de meses válido.");
          setFollowUpLoading(false);
          return;
        }
        body.months = m;
      } else if (followUpOption === "date") {
        if (!followUpSpecificDate) {
          setFormError("Selecione uma data.");
          setFollowUpLoading(false);
          return;
        }
        body.specificDate = new Date(followUpSpecificDate).toISOString();
      }

      await postApi(`/appointments/${followUpAppointmentId}/follow-up`, body);
      setShowFollowUpModal(false);
      loadAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao agendar retorno.";
      setFormError(message);
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <div className="appointments-page">
      <div className="appointments-layout">
        <div className="calendar-card card">
          <div className="calendar-header">
            <button type="button" className="btn-action" onClick={prevMonth}>&#8249;</button>
            <span className="calendar-title">{MONTH_NAMES[month]} {year}</span>
            <button type="button" className="btn-action" onClick={nextMonth}>&#8250;</button>
          </div>

          <div className="calendar-grid">
            {DAY_NAMES.map((d) => (
              <div key={d} className="calendar-day-name">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const hasApt = hasAppointments(day);
              return (
                <button
                  key={day}
                  type="button"
                  className={`calendar-day${isSelected ? " selected" : ""}${isToday ? " today" : ""}${hasApt ? " has-appointments" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="appointments-list-card card">
          <div className="appointments-list-header">
            <h3>{selectedDay} de {MONTH_NAMES[month]}</h3>
            <button type="button" className="btn btn-primary" onClick={openCreateModal}>
              + Novo Agendamento
            </button>
          </div>

          {loading ? (
            <div className="appointments-empty">Carregando...</div>
          ) : dayAppointments.length === 0 ? (
            <div className="appointments-empty">Nenhum agendamento para este dia.</div>
          ) : (
            <div className="appointments-list">
              {dayAppointments.map((apt) => (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-time">
                    <span className="appointment-time-start">{formatTime(apt.date)}</span>
                    {apt.endTime && (
                      <span className="appointment-time-end"> - {formatTime(apt.endTime)}</span>
                    )}
                  </div>
                  <div className="appointment-info">
                    <div className="appointment-patient">
                      {apt.patient.name}
                      {apt.tag && <span className="appointment-tag">{apt.tag}</span>}
                    </div>
                    <div className="appointment-dentist">Dr(a). {apt.dentist.name}</div>
                    {apt.notes && <div className="appointment-notes">{apt.notes}</div>}
                  </div>
                  <div className="appointment-actions">
                    <select
                      className="form-select appointment-status-select"
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                      style={{ borderColor: STATUS_COLORS[apt.status] }}
                    >
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <div className="table-actions">
                      <button type="button" className="btn-action" onClick={() => openEditModal(apt)}>
                        Editar
                      </button>
                      <button type="button" className="btn-action" onClick={() => openFollowUpModal(apt.id)}>
                        Retorno
                      </button>
                      <button type="button" className="btn-action" onClick={() => handleDelete(apt.id)}>
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</h3>

            {formError && <div className="form-error">{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={formLoading} style={{ border: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-row">
                  <label htmlFor="apt-date">Data *</label>
                  <input id="apt-date" name="date" type="date" value={form.date} onChange={handleFormChange} required />
                </div>

                <div className="form-grid">
                  <div className="form-row">
                    <label htmlFor="apt-time">Horário início *</label>
                    <input id="apt-time" name="time" type="time" value={form.time} onChange={handleFormChange} required />
                  </div>
                  <div className="form-row">
                    <label htmlFor="apt-end-time">Horário término</label>
                    <input id="apt-end-time" name="endTime" type="time" value={form.endTime} onChange={handleFormChange} />
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="apt-patient">Paciente *</label>
                  <select id="apt-patient" name="patientId" value={form.patientId} onChange={handleFormChange} className="form-select" required>
                    <option value="">Selecione um paciente</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="apt-dentist">Dentista *</label>
                  <select id="apt-dentist" name="dentistId" value={form.dentistId} onChange={handleFormChange} className="form-select" required>
                    <option value="">Selecione um dentista</option>
                    {dentists.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="apt-notes">Observações</label>
                  <textarea
                    id="apt-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="Observações sobre o agendamento"
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                {!editingId && (
                  <div className="card" style={{ padding: "1rem", background: "var(--color-bg)" }}>
                    <label className="follow-up-option" style={{ border: "none", padding: 0, marginBottom: "0.75rem" }}>
                      <input
                        type="checkbox"
                        checked={form.enableFollowUp}
                        onChange={(e) => setForm((prev) => ({ ...prev, enableFollowUp: e.target.checked }))}
                      />
                      <span style={{ fontWeight: 600 }}>Retorno</span>
                    </label>

                    {form.enableFollowUp && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label className="follow-up-option">
                          <input type="radio" name="formFollowUp" value="1" checked={form.followUpOption === "1"} onChange={() => setForm((prev) => ({ ...prev, followUpOption: "1" }))} />
                          <span>1 mês</span>
                        </label>
                        <label className="follow-up-option">
                          <input type="radio" name="formFollowUp" value="6" checked={form.followUpOption === "6"} onChange={() => setForm((prev) => ({ ...prev, followUpOption: "6" }))} />
                          <span>6 meses</span>
                        </label>
                        <label className="follow-up-option">
                          <input type="radio" name="formFollowUp" value="12" checked={form.followUpOption === "12"} onChange={() => setForm((prev) => ({ ...prev, followUpOption: "12" }))} />
                          <span>12 meses</span>
                        </label>
                        <label className="follow-up-option">
                          <input type="radio" name="formFollowUp" value="custom" checked={form.followUpOption === "custom"} onChange={() => setForm((prev) => ({ ...prev, followUpOption: "custom" }))} />
                          <span>Outro (meses personalizado)</span>
                        </label>
                        {form.followUpOption === "custom" && (
                          <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Número de meses"
                            value={form.followUpCustomMonths}
                            onChange={(e) => setForm((prev) => ({ ...prev, followUpCustomMonths: e.target.value }))}
                            style={{ marginLeft: "1.5rem" }}
                          />
                        )}
                        <label className="follow-up-option">
                          <input type="radio" name="formFollowUp" value="date" checked={form.followUpOption === "date"} onChange={() => setForm((prev) => ({ ...prev, followUpOption: "date" }))} />
                          <span>Data específica</span>
                        </label>
                        {form.followUpOption === "date" && (
                          <input
                            type="date"
                            value={form.followUpSpecificDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, followUpSpecificDate: e.target.value }))}
                            style={{ marginLeft: "1.5rem" }}
                          />
                        )}
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                          Se a data cair em fim de semana, será movida para o próximo dia útil.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ flex: 1 }}>
                    {formLoading ? "Salvando..." : editingId ? "Salvar" : "Agendar"}
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      {showFollowUpModal && (
        <div className="modal-overlay" onClick={() => setShowFollowUpModal(false)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
            <h3>Agendar Retorno</h3>

            {formError && <div className="form-error">{formError}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Quando?</label>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="follow-up-option">
                  <input type="radio" name="followUp" value="1" checked={followUpOption === "1"} onChange={() => setFollowUpOption("1")} />
                  <span>1 mês</span>
                </label>
                <label className="follow-up-option">
                  <input type="radio" name="followUp" value="6" checked={followUpOption === "6"} onChange={() => setFollowUpOption("6")} />
                  <span>6 meses</span>
                </label>
                <label className="follow-up-option">
                  <input type="radio" name="followUp" value="12" checked={followUpOption === "12"} onChange={() => setFollowUpOption("12")} />
                  <span>12 meses</span>
                </label>
                <label className="follow-up-option">
                  <input type="radio" name="followUp" value="custom" checked={followUpOption === "custom"} onChange={() => setFollowUpOption("custom")} />
                  <span>Outro (meses personalizado)</span>
                </label>
                {followUpOption === "custom" && (
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Número de meses"
                    value={followUpCustomMonths}
                    onChange={(e) => setFollowUpCustomMonths(e.target.value)}
                    style={{ marginLeft: "1.5rem" }}
                  />
                )}
                <label className="follow-up-option">
                  <input type="radio" name="followUp" value="date" checked={followUpOption === "date"} onChange={() => setFollowUpOption("date")} />
                  <span>Data específica</span>
                </label>
                {followUpOption === "date" && (
                  <input
                    type="date"
                    value={followUpSpecificDate}
                    onChange={(e) => setFollowUpSpecificDate(e.target.value)}
                    style={{ marginLeft: "1.5rem" }}
                  />
                )}
              </div>

              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                Se a data cair em fim de semana, será movida para o próximo dia útil.
              </p>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowFollowUpModal(false)} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleFollowUpSubmit} disabled={followUpLoading} style={{ flex: 1 }}>
                  {followUpLoading ? "Agendando..." : "Agendar Retorno"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
