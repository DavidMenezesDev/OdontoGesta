import { useState } from "react";
import { postApi } from "../services/api";
import { useAuth, type User } from "../contexts/AuthContext";

interface LoginResponse {
  user: User;
}

interface LoginProps {
  onShowRegister: () => void;
}

function Login({ onShowRegister }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await postApi<LoginResponse>("/auth/login", { email, password });
      login(res.user);
    } catch {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card form-card">
        <h2>Entrar</h2>
        <p className="form-subtitle">Acesse sua conta no OdontoGestão</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={loading}>
            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>

            <div className="form-row">
              <label htmlFor="password">Senha</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </fieldset>
        </form>

        <p className="form-footer">
          Ainda não tem conta?{" "}
          <button type="button" className="link-btn" onClick={onShowRegister}>
            Criar administrador
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
