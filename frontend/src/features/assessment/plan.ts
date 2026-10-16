"use client";

import { Q } from "@nozbe/watermelondb";
import { useEffect, useMemo, useState } from "react";
import guidesJson from "@/data/catalog/guides.json";
import { useLocalDb } from "@/data/db/context";
import { flushLocalDb } from "@/data/db/flush";
import type { GoalCheck } from "@/data/db/models";
import { diagnose, type Diagnosis } from "@/domain/assessment/diagnosis";
import { buildGoals, type Goal, type Guide } from "@/domain/improvement/plan";
import { BANK, useAssessment } from "./hooks";

/* Plan local de 3 metas (CU-07): se arma en el teléfono desde la
   autoevaluación enviada; el plan oficial lo reemplaza al sincronizar. */
export const GUIDES = guidesJson.guides as Guide[];
const AXIS_NAMES = Object.fromEntries(BANK.axes.map((a) => [a.code, a.name]));

export type PlanState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; goals: Goal[]; diagnosis: Diagnosis; cycleId: string; goalKey: (axis: string) => string; checked: Record<string, Set<string>> };

export function useLocalPlan(): PlanState {
  const db = useLocalDb();
  const assessmentState = useAssessment();
  const [checks, setChecks] = useState<GoalCheck[] | null>(null);

  const ready = assessmentState.status === "ready" && assessmentState.assessment?.status === "submitted" ? assessmentState : null;
  const assessmentId = ready?.assessment?.id;

  const computed = useMemo(() => {
    if (!ready) return null;
    const answers = Object.fromEntries(Object.entries(ready.answers).map(([id, s]) => [id, s.answer]));
    const diagnosis = diagnose(BANK, ready.profile, answers);
    return { diagnosis, cycleId: ready.cycleId, goals: buildGoals(diagnosis.plan, diagnosis.axes, AXIS_NAMES, GUIDES, ready.cycleId) };
  }, [ready]);

  useEffect(() => {
    if (db.status !== "ready" || !assessmentId) return;
    const sub = db.database
      .get<GoalCheck>("goal_checks")
      .query(Q.where("goal_key", Q.like(`${assessmentId}:%`)))
      .observeWithColumns(["checked"])
      .subscribe(setChecks);
    return () => sub.unsubscribe();
  }, [db, assessmentId]);

  if (assessmentState.status === "loading") return { status: "loading" };
  if (!computed || !assessmentId) return { status: "empty" };
  if (checks === null) return { status: "loading" };

  const checked: Record<string, Set<string>> = {};
  for (const c of checks) {
    if (!c.checked) continue;
    (checked[c.goalKey] ??= new Set()).add(c.itemId);
  }
  return { status: "ready", ...computed, goalKey: (axis) => `${assessmentId}:${axis}`, checked };
}

/** Marca o desmarca un ítem del checklist (entra a la cola P2 por su tabla). */
export function useToggleCheck() {
  const db = useLocalDb();
  return async (goalKey: string, itemId: string, checked: boolean): Promise<void> => {
    if (db.status !== "ready") throw new Error("La base local todavía no está lista");
    const { database } = db;
    await database.write(async () => {
      const table = database.get<GoalCheck>("goal_checks");
      const [existing] = await table.query(Q.where("goal_key", goalKey), Q.where("item_id", itemId)).fetch();
      const apply = (r: GoalCheck) => {
        r._setRaw("checked", checked);
        r._setRaw("checked_at", Date.now());
      };
      if (existing) await existing.update(apply);
      else
        await table.create((r) => {
          r._setRaw("goal_key", goalKey);
          r._setRaw("item_id", itemId);
          apply(r);
        });
    });
    await flushLocalDb(database);
  };
}
