import { useState, useEffect } from "react";
import { listPermissions, getRolePermissions, updateRolePermissions } from "../services/permissions";
import type { Permission } from "../services/permissions";

const ROLES = ["ADMIN", "DENTIST", "RECEP", "FINANCE"];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  DENTIST: "Dentista",
  RECEP: "Recepcionista",
  FINANCE: "Financeiro",
};

const MODULE_LABELS: Record<string, string> = {
  patients: "Pacientes",
  appointments: "Agendamentos",
  users: "Usuários",
  healthplans: "Planos de Saúde",
  enterprise: "Empresa",
  treatments: "Tratamentos",
  financial: "Financeiro",
};

function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePerms, setRolePerms] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const perms = await listPermissions();
      setPermissions(perms);

      const map = new Map<string, Set<string>>();
      for (const role of ROLES) {
        const rps = await getRolePermissions(role);
        map.set(role, new Set(rps.map((rp) => rp.permission.key)));
      }
      setRolePerms(map);
    } catch {
      setError("Erro ao carregar permissões.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (role: string, key: string) => {
    setRolePerms((prev) => {
      const next = new Map(prev);
      const set = new Set(prev.get(role));
      if (set.has(key)) {
        set.delete(key);
      } else {
        set.add(key);
      }
      next.set(role, set);
      return next;
    });
  };

  const isChecked = (role: string, key: string): boolean => {
    return rolePerms.get(role)?.has(key) ?? false;
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      for (const role of ROLES) {
        const keys = Array.from(rolePerms.get(role) ?? []);
        await updateRolePermissions(role, keys);
      }
      setSuccess("Permissões salvas com sucesso!");
    } catch {
      setError("Erro ao salvar permissões.");
    } finally {
      setSaving(false);
    }
  };

  const modules = Array.from(new Set(permissions.map((p) => p.module)));

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
        Carregando...
      </div>
    );
  }

  return (
    <div className="permissions-page">
      <div className="card">
        <div className="permissions-header">
          <h2>Gerenciar Permissões</h2>
          <p className="form-subtitle">Defina as permissões de cada função do sistema</p>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <div className="permissions-table-wrapper">
          <table className="permissions-table">
            <thead>
              <tr>
                <th style={{ minWidth: "200px" }}>Permissão</th>
                {ROLES.map((role) => (
                  <th key={role} style={{ textAlign: "center", minWidth: "120px" }}>
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <>
                  <tr key={mod} className="permissions-module-row">
                    <td colSpan={ROLES.length + 1}>
                      <strong>{MODULE_LABELS[mod] ?? mod}</strong>
                    </td>
                  </tr>
                  {permissions
                    .filter((p) => p.module === mod)
                    .map((perm) => (
                      <tr key={perm.id}>
                        <td>{perm.name}</td>
                        {ROLES.map((role) => (
                          <td key={role} style={{ textAlign: "center" }}>
                            <label className="permissions-checkbox-label">
                              <input
                                type="checkbox"
                                className="permissions-checkbox"
                                checked={isChecked(role, perm.key)}
                                onChange={() => toggle(role, perm.key)}
                                disabled={role === "ADMIN"}
                              />
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="permissions-actions" style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar Permissões"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Permissions;
