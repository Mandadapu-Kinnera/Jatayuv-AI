// Frontend-only mock auth. Persists a single local account in localStorage.
// No backend, no network calls.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type User = {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  travelStyle?: string;
  joinedAt: string;
  /** Stored locally only — this is a frontend demo, never a real credential store. */
  password: string;
};

type AuthState = {
  user: User | null;
  ready: boolean;
  signUp: (d: { name: string; email: string; password: string }) => { ok: boolean; error?: string };
  signIn: (d: { email: string; password: string }) => { ok: boolean; error?: string };
  signOut: () => void;
  updateProfile: (patch: Partial<Omit<User, "password">>) => void;
  changePassword: (current: string, next: string) => { ok: boolean; error?: string };
};

const KEY = "jatayuv.user";

const AuthContext = createContext<AuthState | null>(null);

function read(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function write(u: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (u) window.localStorage.setItem(KEY, JSON.stringify(u));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Read after hydration so SSR and first client render match.
  useEffect(() => {
    setUser(read());
    setReady(true);
  }, []);

  const persist = useCallback((u: User | null) => {
    write(u);
    setUser(u);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      signUp: ({ name, email, password }) => {
        if (!name.trim()) return { ok: false, error: "Please enter your name." };
        if (!email.trim()) return { ok: false, error: "Please enter your email." };
        if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
        persist({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          joinedAt: new Date().toISOString(),
        });
        return { ok: true };
      },
      signIn: ({ email, password }) => {
        const existing = read();
        if (existing && existing.email === email.trim().toLowerCase()) {
          if (existing.password !== password) return { ok: false, error: "Incorrect password." };
          persist(existing);
          return { ok: true };
        }
        // Demo mode: any valid-looking credentials create a local session.
        if (!email.trim()) return { ok: false, error: "Please enter your email." };
        if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
        persist({
          name: email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email.trim().toLowerCase(),
          password,
          joinedAt: new Date().toISOString(),
        });
        return { ok: true };
      },
      signOut: () => persist(null),
      updateProfile: (patch) => {
        const cur = read();
        if (!cur) return;
        persist({ ...cur, ...patch });
      },
      changePassword: (current, next) => {
        const cur = read();
        if (!cur) return { ok: false, error: "You are not signed in." };
        if (cur.password !== current) return { ok: false, error: "Current password is incorrect." };
        if (next.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
        persist({ ...cur, password: next });
        return { ok: true };
      },
    }),
    [user, ready, persist]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
