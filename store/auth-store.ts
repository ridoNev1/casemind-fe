"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  full_name?: string | null;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

type AuthState = {
  token: string | null;
  expiresAt: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  logout: () => void;
};

const isBrowser = typeof window !== "undefined";

const memory = new Map<string, string>();

const memoryStorage: StateStorage = {
  getItem: (name) => memory.get(name) ?? null,
  setItem: (name, value) => {
    memory.set(name, value);
  },
  removeItem: (name) => {
    memory.delete(name);
  },
};

const storage = createJSONStorage(() =>
  isBrowser ? localStorage : memoryStorage,
);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      expiresAt: null,
      user: null,
      setSession: ({ token, expiresAt, user }) =>
        set({ token, expiresAt, user }),
      logout: () => set({ token: null, expiresAt: null, user: null }),
    }),
    {
      name: "casemind-auth",
      storage,
    },
  ),
);
