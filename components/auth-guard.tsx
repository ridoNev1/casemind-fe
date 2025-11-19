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
  const shouldRedirect = hydrated && !token;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/login");
    }
  }, [shouldRedirect, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading session...</p>
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-sm">
          Mengalihkan ke halaman login...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
