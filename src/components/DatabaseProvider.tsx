"use client";

import { useEffect, useState } from "react";
import { migrateFromLocalStorage } from "@/lib/db";

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    migrateFromLocalStorage().then(() => {
      setMigrated(true);
    });
  }, []);

  if (!migrated) {
    // Prevent rendering anything until DB is ready/migrated to avoid Hydration bugs or empty states
    return (
      <div className="min-h-screen bg-dots-bg flex items-center justify-center">
        <div className="loading-dots text-ink font-mono font-bold">[ INIT_DB ]</div>
      </div>
    );
  }

  return <>{children}</>;
}
