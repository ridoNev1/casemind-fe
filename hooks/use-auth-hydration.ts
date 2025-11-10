"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/store/auth-store";

export function useAuthHydration() {
  const persist = useAuthStore.persist;
  const initialReady = useMemo(
    () => (persist ? persist.hasHydrated() : true),
    [persist],
  );
  const [ready, setReady] = useState(initialReady);

  useEffect(() => {
    if (!persist || initialReady) {
      return;
    }

    const unsub = persist.onFinishHydration(() => {
      setReady(true);
    });

    persist.rehydrate();

    return () => {
      unsub();
    };
  }, [persist, initialReady]);

  return ready;
}
