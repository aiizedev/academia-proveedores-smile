"use client";

import { useEffect, useState } from "react";
import { useLocalDb } from "@/data/db/context";
import { flushLocalDb } from "@/data/db/flush";
import { PROFILE_COLUMNS, type SupplierProfileRecord } from "@/data/db/models";
import { normalizeNit } from "@/domain/suppliers/nit";
import { EMPTY_PROFILE, isComplete, type SupplierProfile } from "@/domain/suppliers/profile";

export type LocalProfile =
  | { status: "loading" }
  | { status: "ready"; profile: SupplierProfile; completedAt: number | null };

/** Ficha guardada en el teléfono (una fila); la UI la observa sin pedir nada a la API. */
export function useLocalProfile(): LocalProfile {
  const db = useLocalDb();
  const [state, setState] = useState<LocalProfile>({ status: "loading" });

  useEffect(() => {
    if (db.status !== "ready") return;
    const subscription = db.database
      .get<SupplierProfileRecord>("supplier_profile")
      .query()
      .observeWithColumns([...Object.values(PROFILE_COLUMNS), "completed_at"])
      .subscribe(([row]) =>
        setState(row ? { status: "ready", profile: row.toProfile(), completedAt: row.completedAt } : { status: "ready", profile: EMPTY_PROFILE, completedAt: null }),
      );
    return () => subscription.unsubscribe();
  }, [db]);

  return state;
}

/**
 * Guarda la ficha (autoguardado por paso, U-07). Si quedó completa marca
 * `completed_at`; la tabla entra a la cola P2 y el servidor emite
 * SupplierProfileCompleted al sincronizar (HU-SYN-02).
 */
export function useSaveProfile() {
  const db = useLocalDb();
  return async (input: SupplierProfile): Promise<{ completed: boolean }> => {
    if (db.status !== "ready") throw new Error("La base local todavía no está lista");
    const profile = { ...input, taxId: normalizeNit(input.taxId), taxDv: input.taxDv.trim() };
    const { database } = db;
    const collection = database.get<SupplierProfileRecord>("supplier_profile");
    const completed = isComplete(profile);
    await database.write(async () => {
      const [row] = await collection.query().fetch();
      const completedAt = completed ? (row?.completedAt ?? Date.now()) : null;
      if (row) await row.update((r) => r.applyProfile(profile, completedAt));
      else await collection.create((r) => r.applyProfile(profile, completedAt));
    });
    await flushLocalDb(database);
    return { completed };
  };
}
