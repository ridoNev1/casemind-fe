"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const hydrated = useAuthHydration();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!token) {
      router.replace("/login");
    }
  }, [token, hydrated, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading session...</p>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
