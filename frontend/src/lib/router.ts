import { useState, useEffect, useCallback } from "react";

type Params = Record<string, string>;

export function matchPath(pattern: string, path: string): Params | null {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return null;

  const params: Params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i]!;
    const pv = pathParts[i]!;
    if (pp.startsWith(":")) {
      params[pp.slice(1)] = pv;
    } else if (pp !== pv) {
      return null;
    }
  }

  return params;
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    window.addEventListener("pushstate", updatePath);
    return () => {
      window.removeEventListener("popstate", updatePath);
      window.removeEventListener("pushstate", updatePath);
    };
  }, []);

  return path;
}

export function useNavigate() {
  return useCallback((to: string) => {
    if (window.location.pathname === to) return;
    window.history.pushState({}, "", to);
    window.dispatchEvent(new Event("pushstate"));
  }, []);
}
