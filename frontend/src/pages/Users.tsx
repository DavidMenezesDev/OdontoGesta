import { useState, useEffect, useCallback, type FormEvent } from "react";
import { fetchApi, postApi } from "../services/api";
import type { User } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { usePermission } from "../hooks/usePermission";
import {
  listPermissions,
  getRolePermissions,
  getUserPermissions,
  updateUserPermissions,
  type Permission,
} from "../services/permissions";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  DENTIST: "Dentista",
  RECEP: "Recepcionista",
  FINANCE: "Financeiro",
};

function Users() {
  useAuth();
  const canCreate = usePermission("user:create");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DENTIST");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [permModalUserId, setPermModalUserId] = useState<string | null>(null);
  const [permModalUserName, setPermModalUserName] = useState("");
  const [permModalRole, setPermModalRole] = useState("");
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermKeys, setRolePermKeys] = useState<Set<string>>(new Set());
  const [userGrantedKeys, setUserGrantedKeys] = useState<Set<string>>(new Set());
  const [userRevokedKeys, setUserRevokedKeys] = useState<Set<string>>(new Set());
  const [permSaving, setPermSaving] = useState(false);
  const [permError, setPermError] = useState("");

  const loadUsers = useCallback(() => {
    setLoading(true);
    fetchApi<User[]>("/users")
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("DENTIST");
    setPhone("");
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Nome, email e senha são obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setSaving(true);
    try {
      await postApi("/users", { name, email, password, role, phone: phone || undefined });
      resetForm();
      setShowForm(false);
      loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar usuário.";
      setError(message.includes("409") ? "Este email já está cadastrado." : message);
    } finally {
      setSaving(false);
    }
  };

  const openPermModal = async (targetUser: User) => {
    setPermModalUserId(targetUser.id);
    setPermModalUserName(targetUser.name);
    setPermModalRole(targetUser.role);
    setPermError("");

    try {
      const [perms, rolePerms, userPerms] = await Promise.all([
        listPermissions(),
        getRolePermissions(targetUser.role),
        getUserPermissions(targetUser.id),
      ]);

      setAllPermissions(perms);
      setRolePermKeys(new Set(rolePerms.map((rp) => rp.permission.key)));

      const granted = new Set<string>();
      const revoked = new Set<string>();
      for (const up of userPerms) {
        if (up.granted) {
          granted.add(up.permission.key);
        } else {
          revoked.add(up.permission.key);
        }
      }
      setUserGrantedKeys(granted);
      setUserRevokedKeys(revoked);
    } catch {
      setPermError("Erro ao carregar permissões.");
    }
  };

  const closePermModal = () => {
    setPermModalUserId(null);
    setPermModalUserName("");
    setPermModalRole("");
    setAllPermissions([]);
    setRolePermKeys(new Set());
    setUserGrantedKeys(new Set());
    setUserRevokedKeys(new Set());
    setPermError("");
  };

  const toggleUserPerm = (key: string) => {
    const roleHas = rolePermKeys.has(key);
    const userGrants = userGrantedKeys.has(key);
    const userRevokes = userRevokedKeys.has(key);

    if (roleHas) {
      if (userRevokes) {
        setUserRevokedKeys((prev) => { const next = new Set(prev); next.delete(key); return next; });
      } else {
        setUserRevokedKeys((prev) => new Set(prev).add(key));
      }
    } else {
      if (userGrants) {
        setUserGrantedKeys((prev) => { const next = new Set(prev); next.delete(key); return next; });
      } else {
        setUserGrantedKeys((prev) => new Set(prev).add(key));
      }
    }
  };

  const saveUserPerms = async () => {
    if (!permModalUserId) return;
    setPermSaving(true);
    setPermError("");
    try {
      await updateUserPermissions(
        permModalUserId,
        permModalRole,
        Array.from(userGrantedKeys),
        Array.from(userRevokedKeys),
      );
      closePermModal();
    } catch {
      setPermError("Erro ao salvar permissões.");
    } finally {
      setPermSaving(false);
    }
  };

  const modules = Array.from(new Set(allPermissions.map((p) => p.module)));

  return (
    <div className="users-page">
      <div className="card users-card">
        <div className="patients-toolbar">
          <div style={{ flex: 1 }} />
          {canCreate && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ margin: 0 }}
              onClick={() => { resetForm(); setShowForm(!showForm); }}
            >
              {showForm ? "Cancelar" : "+ Novo Usuário"}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              <div className="form-row" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="user-name">Nome</label>
                <input id="user-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="form-row">
                <label htmlFor="user-email">Email</label>
                <input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="form-row">
                <label htmlFor="user-password">Senha</label>
                <input id="user-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="form-row">
                <label htmlFor="user-role">Função</label>
                <select id="user-role" value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
                  <option value="DENTIST">Dentista</option>
                  <option value="RECEP">Recepcionista</option>
                  <option value="FINANCE">Financeiro</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="user-phone">Telefone</label>
                <input id="user-phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div style={{ marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Salvando..." : "Cadastrar Usuário"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
            Carregando...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
            Nenhum usuário cadastrado.
          </div>
        ) : (
          <div className="patients-table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                    <td>{u.phone ?? "—"}</td>
                    <td>{u.active ? "Ativo" : "Inativo"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-action"
                        onClick={() => openPermModal(u)}
                      >
                        Permissões
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {permModalUserId && (
        <div className="modal-overlay" onClick={closePermModal}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <h3>Permissões de {permModalUserName}</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
              Função: <strong>{ROLE_LABELS[permModalRole] ?? permModalRole}</strong>
              &nbsp;— permissões em <em>itálico</em> vêm da função, em <strong>negrito</strong> são overrides manuais.
            </p>

            {permError && <div className="form-error">{permError}</div>}

            <div className="perm-modal-grid">
              {allPermissions.length === 0 ? (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Carregando permissões...
                </div>
              ) : (
                modules.map((mod) => (
                  <div key={mod} className="perm-modal-module">
                    <h4 className="perm-modal-module-title">{mod}</h4>
                    {allPermissions
                      .filter((p) => p.module === mod)
                      .map((p) => {
                        const roleHas = rolePermKeys.has(p.key);
                        const userGrants = userGrantedKeys.has(p.key);
                        const userRevokes = userRevokedKeys.has(p.key);
                        const overridden = userGrants || userRevokes;
                        const isChecked = userGrants || (roleHas && !userRevokes);

                        let className = "perm-modal-check-row";
                        if (overridden) {
                          className += userGrants ? " perm-override-granted" : " perm-override-revoked";
                        }

                        return (
                          <label key={p.id} className={className}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleUserPerm(p.key)}
                            />
                            <span>
                              {p.name}
                              {overridden && (
                                <span className="perm-override-badge">
                                  {userGrants ? "+" : "—"}
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline" onClick={closePermModal}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={saveUserPerms} disabled={permSaving}>
                {permSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
