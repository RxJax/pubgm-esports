"use client";

import React, { useEffect } from "react";
import DatabaseErrorCard from "@/app/components/DatabaseErrorCard";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error securely to server console
    console.error("Client boundary caught rendering error:", error);
  }, [error]);

  return (
    <main className="min-h-[85vh] bg-gaming-black flex flex-col items-center justify-center">
      <DatabaseErrorCard />
    </main>
  );
}
