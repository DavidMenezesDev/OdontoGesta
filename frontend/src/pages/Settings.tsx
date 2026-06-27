import { useState, useEffect, type FormEvent } from "react";
import { fetchApi, putApi } from "../services/api";
import type { Enterprise } from "../types";

function Settings() {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    phone: "",
    email: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    logo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchApi<Enterprise>("/enterprise")
      .then((data) => {
        setForm({
          nome: data.nome ?? "",
          cnpj: data.cnpj ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          street: data.street ?? "",
          number: data.number ?? "",
          complement: data.complement ?? "",
          neighborhood: data.neighborhood ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zipCode: data.zipCode ?? "",
          logo: data.logo ?? "",
        });
      })
      .catch(() => setError("Erro ao carregar dados da clínica."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await putApi("/enterprise", form);
      setSuccess(true);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="settings-page">
      <div className="card settings-card">
        <h2>Informações da Clínica</h2>
        <p className="form-subtitle">Altere os dados cadastrais da sua clínica</p>

        {error && <div className="form-error">{error}</div>}
        {success && (
          <div className="form-success">Dados salvos com sucesso!</div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={saving}>
            <div className="form-grid">
              <div className="form-row form-row-full">
                <label htmlFor="nome">Nome da Clínica</label>
                <input
                  id="nome"
                  type="text"
                  value={form.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  placeholder="Nome da clínica"
                />
              </div>

              <div className="form-row">
                <label htmlFor="cnpj">CNPJ</label>
                <input
                  id="cnpj"
                  type="text"
                  value={form.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="form-row">
                <label htmlFor="phone">Telefone</label>
                <input
                  id="phone"
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div className="form-row">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="clinica@exemplo.com"
                />
              </div>

              <div className="form-row form-row-full">
                <label htmlFor="logo">URL da Logo</label>
                <input
                  id="logo"
                  type="text"
                  value={form.logo}
                  onChange={(e) => handleChange("logo", e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <div className="form-divider form-row-full">Endereço</div>

              <div className="form-row form-row-full">
                <label htmlFor="street">Logradouro</label>
                <input
                  id="street"
                  type="text"
                  value={form.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  placeholder="Rua, Avenida..."
                />
              </div>

              <div className="form-row">
                <label htmlFor="number">Número</label>
                <input
                  id="number"
                  type="text"
                  value={form.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  placeholder="Nº"
                />
              </div>

              <div className="form-row">
                <label htmlFor="complement">Complemento</label>
                <input
                  id="complement"
                  type="text"
                  value={form.complement}
                  onChange={(e) => handleChange("complement", e.target.value)}
                  placeholder="Sala, Andar..."
                />
              </div>

              <div className="form-row form-row-full">
                <label htmlFor="neighborhood">Bairro</label>
                <input
                  id="neighborhood"
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) => handleChange("neighborhood", e.target.value)}
                  placeholder="Bairro"
                />
              </div>

              <div className="form-row">
                <label htmlFor="city">Cidade</label>
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Cidade"
                />
              </div>

              <div className="form-row">
                <label htmlFor="state">Estado</label>
                <input
                  id="state"
                  type="text"
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <div className="form-row">
                <label htmlFor="zipCode">CEP</label>
                <input
                  id="zipCode"
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default Settings;
