"use client";

import { useEffect, useState } from "react";
import type { EIP6963ProviderDetail } from "./Eip6963Types";

/**
 * Hook to discover EIP-6963 compatible wallet providers
 */
export function useEip6963() {
  const [providers, setProviders] = useState<Map<string, EIP6963ProviderDetail>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAnnouncement = (event: any) => {
      const detail = event.detail as EIP6963ProviderDetail;
      setProviders((prev) => new Map(prev).set(detail.info.uuid, detail));
    };

    window.addEventListener("eip6963:announceProvider", handleAnnouncement);

    // Request providers to announce themselves
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnouncement);
    };
  }, []);

  return Array.from(providers.values());
}

