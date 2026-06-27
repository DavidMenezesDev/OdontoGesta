import { fetchApi, putApi } from "./api";

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  module: string;
  active: boolean;
}

export interface RolePermission {
  id: string;
  role: string;
  permissionId: string;
  permission: Permission;
}

export interface UserPermission {
  permission: Permission;
  granted: boolean;
}

export async function listPermissions(): Promise<Permission[]> {
  return fetchApi<Permission[]>("/permissions");
}

export async function getRolePermissions(role: string): Promise<RolePermission[]> {
  return fetchApi<RolePermission[]>(`/permissions/roles/${role}`);
}

export async function updateRolePermissions(
  role: string,
  permissions: string[],
): Promise<void> {
  await putApi(`/permissions/roles/${role}`, { permissions });
}

export async function getMyPermissions(): Promise<string[]> {
  const data = await fetchApi<{ permissions: string[] }>("/permissions/me");
  return data.permissions;
}

export async function getUserPermissions(userId: string): Promise<UserPermission[]> {
  return fetchApi<UserPermission[]>(`/permissions/users/${userId}`);
}

export async function updateUserPermissions(
  userId: string,
  role: string,
  grantedKeys: string[],
  revokedKeys: string[],
): Promise<void> {
  await putApi(`/permissions/users/${userId}`, { role, grantedKeys, revokedKeys });
}
