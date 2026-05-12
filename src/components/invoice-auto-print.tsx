"use client";

import { useEffect } from "react";

type InvoiceAutoPrintProps = {
  enabled: boolean;
};

export function InvoiceAutoPrint({ enabled }: InvoiceAutoPrintProps) {
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => window.print(), 150);
    return () => clearTimeout(timer);
  }, [enabled]);

  return null;
}
