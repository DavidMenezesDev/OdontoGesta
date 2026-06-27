import { prisma } from "../../lib/prisma.js";

export interface PermissionResult {
  id: string;
  key: string;
  name: string;
  description: string | null;
  module: string;
  active: boolean;
}

export interface RolePermissionResult {
  id: string;
  role: string;
  permissionId: string;
  permission: PermissionResult;
}

export async function listPermissions(): Promise<PermissionResult[]> {
  return prisma.permission.findMany({
    orderBy: { module: "asc" },
  });
}

export async function getRolePermissions(role: string): Promise<RolePermissionResult[]> {
  return prisma.rolePermission.findMany({
    where: { role },
    include: { permission: true },
  });
}

export async function updateRolePermissions(
  role: string,
  permissionKeys: string[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const permissions = await tx.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    const validIds = new Set(permissions.map((p) => p.id));

    await tx.rolePermission.deleteMany({ where: { role } });

    if (validIds.size > 0) {
      await tx.rolePermission.createMany({
        data: Array.from(validIds).map((permissionId) => ({
          role,
          permissionId,
        })),
      });
    }
  });
}

export async function checkPermission(
  role: string,
  userId?: string,
  permissionKey?: string,
): Promise<boolean> {
  if (userId && permissionKey) {
    const userPerm = await prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId: (
            await prisma.permission.findUnique({ where: { key: permissionKey } })
          )?.id ?? "",
        },
      },
    });

    if (userPerm) return userPerm.granted;
  }

  const count = await prisma.rolePermission.count({
    where: {
      role,
      ...(permissionKey ? { permission: { key: permissionKey } } : {}),
    },
  });
  return count > 0;
}

export async function getEffectivePermissions(
  userId: string,
  role: string,
): Promise<string[]> {
  const rolePerms = await prisma.rolePermission.findMany({
    where: { role },
    include: { permission: true },
  });

  const userPerms = await prisma.userPermission.findMany({
    where: { userId },
    include: { permission: true },
  });

  const roleKeys = new Set(rolePerms.map((rp) => rp.permission.key));
  const userOverrides = new Map(
    userPerms.map((up) => [up.permission.key, up.granted]),
  );

  for (const [key, granted] of userOverrides) {
    if (granted) {
      roleKeys.add(key);
    } else {
      roleKeys.delete(key);
    }
  }

  return Array.from(roleKeys);
}

export async function getUserPermissions(
  userId: string,
): Promise<{ permission: PermissionResult; granted: boolean }[]> {
  const perms = await prisma.userPermission.findMany({
    where: { userId },
    include: { permission: true },
  });
  return perms.map((up) => ({ permission: up.permission, granted: up.granted }));
}

export async function updateUserPermissions(
  userId: string,
  permissionKeys: string[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const permissions = await tx.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    const validIds = new Set(permissions.map((p) => p.id));

    await tx.userPermission.deleteMany({ where: { userId } });

    if (validIds.size > 0) {
      await tx.userPermission.createMany({
        data: Array.from(validIds).map((permissionId) => ({
          userId,
          permissionId,
          granted: true,
        })),
      });
    }
  });
}

export async function revokeUserPermissions(
  userId: string,
  permissionKeys: string[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const permissions = await tx.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    const validIds = new Set(permissions.map((p) => p.id));

    await tx.userPermission.deleteMany({
      where: { userId, permissionId: { in: Array.from(validIds) } },
    });

    if (validIds.size > 0) {
      await tx.userPermission.createMany({
        data: Array.from(validIds).map((permissionId) => ({
          userId,
          permissionId,
          granted: false,
        })),
      });
    }
  });
}

export async function saveUserPermissions(
  userId: string,
  role: string,
  grantedKeys: string[],
  revokedKeys: string[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const allPermissions = await tx.permission.findMany();
    const keyToId = new Map(allPermissions.map((p) => [p.key, p.id]));

    const grantIds = grantedKeys
      .map((k) => keyToId.get(k))
      .filter(Boolean) as string[];
    const revokeIds = revokedKeys
      .map((k) => keyToId.get(k))
      .filter(Boolean) as string[];

    await tx.userPermission.deleteMany({
      where: { userId, permissionId: { in: [...grantIds, ...revokeIds] } },
    });

    const creates: { userId: string; permissionId: string; granted: boolean }[] = [];

    for (const id of grantIds) {
      creates.push({ userId, permissionId: id, granted: true });
    }
    for (const id of revokeIds) {
      creates.push({ userId, permissionId: id, granted: false });
    }

    if (creates.length > 0) {
      await tx.userPermission.createMany({ data: creates });
    }
  });
}
