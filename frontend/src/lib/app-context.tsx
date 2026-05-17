import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role, User } from "./api-types";
import { AuthApi } from "./api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./auth-storage";
import { getInitials, roleLabel, roleTitle } from "./formatters";

interface AppContextType {
  user: (User & { initials: string; title: string }) | null;
  role: Role | null;
  isLoading: boolean;
  setAuth: (token: string, user?: User) => void;
  logout: () => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: AuthApi.me,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (!error) return;
    clearAuthToken();
    setToken(null);
    queryClient.removeQueries({ queryKey: ["me"] });
  }, [error, queryClient]);

  const user = useMemo(() => {
    if (!userData) return null;
    return { ...userData, initials: getInitials(userData.name), title: roleTitle(userData.role) };
  }, [userData]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const stored = localStorage.getItem("ttm-theme") as "light" | "dark" | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ttm-theme", theme);
  }, [theme]);

  return (
      <AppContext.Provider
        value={{
          user,
          role: user?.role ?? null,
          isLoading,
          setAuth: (nextToken, nextUser) => {
            setAuthToken(nextToken);
            setToken(nextToken);
            if (nextUser) {
              queryClient.setQueryData(["me"], nextUser);
            }
          },
          logout: async () => {
            try {
              await AuthApi.logout();
            } catch {
              // ignore logout failures
            } finally {
              clearAuthToken();
              setToken(null);
              queryClient.removeQueries({ queryKey: ["me"] });
            }
          },
          theme,
          toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
        }}
      >
        {children}
      </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
