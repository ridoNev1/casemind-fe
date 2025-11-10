"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { useAuthStore } from "@/store/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthHydration();

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/");
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading session...</p>
      </div>
    );
  }

  if (token) {
    return null;
  }

  return (
    <div className="bg-linear-to-r from-blue-900 to-gray-900 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
