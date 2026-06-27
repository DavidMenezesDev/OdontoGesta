import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMyPermissions } from "../services/permissions";

const cache = new Map<string, Set<string>>();

export function usePermission(permissionKey: string): boolean {
  const { user } = useAuth();
  const [granted, setGranted] = useState(() => {
    if (!user) return false;
    const cached = cache.get(user.id);
    if (cached) return cached.has(permissionKey);
    return false;
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const cached = cache.get(user.id);
    if (cached) {
      setGranted(cached.has(permissionKey));
      return;
    }

    getMyPermissions()
      .then((keys) => {
        const set = new Set(keys);
        cache.set(user.id, set);
        setGranted(set.has(permissionKey));
      })
      .catch(() => setGranted(false));
  }, [user, permissionKey]);

  return granted;
}
