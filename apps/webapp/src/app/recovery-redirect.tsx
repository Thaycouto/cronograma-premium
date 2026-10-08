"use client";

import { useEffect } from "react";

export function RecoveryRedirect() {
  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));

    if (fragment.get("type") === "recovery" || fragment.has("error_code")) {
      window.location.replace(`/redefinir-senha${window.location.search}${window.location.hash}`);
    }
  }, []);

  return null;
}
