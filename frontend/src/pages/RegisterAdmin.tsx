import { useState } from "react";
import { postApi } from "../services/api";

interface RegisterAdminProps {
  onBackToLogin?: () => void;
}

interface CreateAdminResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    active: boolean;
    createdAt: string;
  };
  enterprise: {
    id: string;
    nome: string | null;
    cnpj: string | null;
    phone: string | null;
    active: boolean;
  };
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName: string;
  cnpj: string;
}

function RegisterAdmin({ onBackToLogin }: RegisterAdminProps) {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    cnpj: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateAdminResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await postApi<CreateAdminResponse>("/users/admin", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        companyName: form.companyName || undefined,
        cnpj: form.cnpj || undefined,
      });
      setResult(res);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.includes("409")
            ? "Este email já está cadastrado."
            : err.message
          : "Erro ao cadastrar. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="page-center">
        <div className="card success-card">
          <h2>Conta criada com sucesso!</h2>
          <div className="success-details">
            <div className="detail-group">
              <h4>Administrador</h4>
              <p><strong>Nome:</strong> {result.user.name}</p>
              <p><strong>Email:</strong> {result.user.email}</p>
            </div>
            <div className="detail-group">
              <h4>Empresa</h4>
              <p><strong>Nome:</strong> {result.enterprise.nome ?? "—"}</p>
              <p><strong>CNPJ:</strong> {result.enterprise.cnpj ?? "—"}</p>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={onBackToLogin} style={{ marginTop: "1.5rem" }}>
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="card form-card">
        <h2>Criar conta de administrador</h2>
        <p className="form-subtitle">
          Crie sua conta de administrador. Uma nova empresa será registrada automaticamente.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={loading}>
            <div className="form-row">
              <label htmlFor="name">Nome completo *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Seu nome" required />
            </div>

            <div className="form-row">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@email.com" required />
            </div>

            <div className="form-row">
              <label htmlFor="password">Senha *</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required />
            </div>

            <div className="form-row">
              <label htmlFor="confirmPassword">Confirmar senha *</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repita a senha" required />
            </div>

            <div className="form-row">
              <label htmlFor="phone">Telefone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="(11) 99999-8888" />
            </div>

            <div className="form-divider">Dados da empresa</div>

            <div className="form-row">
              <label htmlFor="companyName">Nome da empresa</label>
              <input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Clínica OdontoGesta Ltda" />
            </div>

            <div className="form-row">
              <label htmlFor="cnpj">CNPJ</label>
              <input id="cnpj" name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="12.345.678/0001-90" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Cadastrando..." : "Criar conta"}
            </button>
          </fieldset>
        </form>

        {onBackToLogin && (
          <p className="form-footer" style={{ marginTop: "1rem" }}>
            Já tem conta?{" "}
            <button type="button" className="link-btn" onClick={onBackToLogin}>
              Fazer login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default RegisterAdmin;
