"use client";

import { Q } from "@nozbe/watermelondb";
import { useEffect, useMemo, useState } from "react";
import bankJson from "@/data/catalog/question-bank.json";
import { useLocalDb } from "@/data/db/context";
import { flushLocalDb } from "@/data/db/flush";
import type { Assessment, AssessmentAnswer, Declaration, SupplierProfileRecord } from "@/data/db/models";
import { bankCategory, cycleFor, DECLARATION, DEFAULT_SIZE } from "@/domain/assessment/cycle";
import type { FormAnswer, Profile, QuestionBank, Size } from "@/domain/assessment/form";

/* Datos de la autoevaluación en WatermelonDB (RF-SYN-001): la UI observa y
   escribe en local; assessments, assessment_answers y declarations van en P2. */
export const BANK = bankJson as unknown as QuestionBank;

export interface StoredAnswer {
  answer: FormAnswer;
  detail: string;
}

export type AssessmentState =
  | { status: "loading" }
  | { status: "no-profile" }
  | { status: "ready"; profile: Profile; cycleId: string; assessment: Assessment | null; answers: Record<string, StoredAnswer> };

const encode = (answer: FormAnswer) => (Array.isArray(answer) ? JSON.stringify(answer) : answer);
const decode = (raw: string): FormAnswer => (raw.startsWith("[") ? (JSON.parse(raw) as string[]) : (raw as FormAnswer));

export function useAssessment(): AssessmentState {
  const db = useLocalDb();
  const cycleId = useMemo(() => cycleFor(new Date()), []);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [assessment, setAssessment] = useState<Assessment | null | undefined>(undefined);
  const [answers, setAnswers] = useState<{ for: string; byQuestion: Record<string, StoredAnswer> } | null>(null);

  useEffect(() => {
    if (db.status !== "ready") return;
    const profileSub = db.database
      .get<SupplierProfileRecord>("supplier_profile")
      .query()
      .observeWithColumns(["main_category", "completed_at"])
      .subscribe(([row]) => {
        const category = row?.completedAt ? bankCategory(row.toProfile().mainCategory) : null;
        setProfile(category ? { category, size: DEFAULT_SIZE as Size } : null);
      });
    const assessmentSub = db.database
      .get<Assessment>("assessments")
      .query(Q.where("cycle_id", cycleId))
      .observeWithColumns(["status", "current_index"])
      .subscribe(([row]) => setAssessment(row ?? null));
    return () => {
      profileSub.unsubscribe();
      assessmentSub.unsubscribe();
    };
  }, [db, cycleId]);

  const assessmentId = assessment?.id;
  useEffect(() => {
    if (db.status !== "ready" || !assessmentId) return;
    const sub = db.database
      .get<AssessmentAnswer>("assessment_answers")
      .query(Q.where("assessment_id", assessmentId))
      .observeWithColumns(["answer", "detail"])
      .subscribe((rows) =>
        setAnswers({ for: assessmentId, byQuestion: Object.fromEntries(rows.map((r) => [r.questionId, { answer: decode(r.answer), detail: r.detail }])) }),
      );
    return () => sub.unsubscribe();
  }, [db, assessmentId]);

  if (db.status !== "ready" || profile === undefined || assessment === undefined) return { status: "loading" };
  if (profile === null) return { status: "no-profile" };
  if (!assessmentId) return { status: "ready", profile, cycleId, assessment, answers: {} };
  // Reanudar exige las respuestas de esta evaluación ya leídas, no un estado intermedio vacío.
  if (answers?.for !== assessmentId) return { status: "loading" };
  return { status: "ready", profile, cycleId, assessment, answers: answers.byQuestion };
}

export function useAssessmentActions() {
  const db = useLocalDb();
  const database = db.status === "ready" ? db.database : null;
  const need = () => {
    if (!database) throw new Error("La base local todavía no está lista");
    return database;
  };

  return {
    async start(cycleId: string, profile: Profile, prefilled: Record<string, FormAnswer>): Promise<void> {
      const d = need();
      await d.write(async () => {
        const assessment = await d.get<Assessment>("assessments").create((a) => {
          a._setRaw("cycle_id", cycleId);
          a._setRaw("form_version", BANK.version);
          a._setRaw("category", profile.category);
          a._setRaw("size", profile.size);
          a._setRaw("status", "draft");
          a._setRaw("current_index", 0);
        });
        for (const [questionId, answer] of Object.entries(prefilled)) {
          await d.get<AssessmentAnswer>("assessment_answers").create((r) => {
            r._setRaw("assessment_id", assessment.id);
            r._setRaw("question_id", questionId);
            r._setRaw("answer", encode(answer));
            r._setRaw("answered_at", Date.now());
          });
        }
      });
      await flushLocalDb(d);
    },

    /** Autoguardado por respuesta (U-07). */
    async saveAnswer(assessment: Assessment, questionId: string, answer: FormAnswer, detail: string, index: number): Promise<void> {
      const d = need();
      await d.write(async () => {
        const answersTable = d.get<AssessmentAnswer>("assessment_answers");
        const [existing] = await answersTable.query(Q.where("assessment_id", assessment.id), Q.where("question_id", questionId)).fetch();
        const apply = (r: AssessmentAnswer) => {
          r._setRaw("answer", encode(answer));
          r._setRaw("detail", detail.trim() || null);
          r._setRaw("answered_at", Date.now());
        };
        if (existing) await existing.update(apply);
        else
          await answersTable.create((r) => {
            r._setRaw("assessment_id", assessment.id);
            r._setRaw("question_id", questionId);
            apply(r);
          });
        await assessment.update((a) => a._setRaw("current_index", index));
      });
      await flushLocalDb(d);
    },

    /** Envío: queda bloqueada para edición y entra a la cola P2 con su declaración. */
    async submit(assessment: Assessment, signerName: string): Promise<void> {
      const d = need();
      await d.write(async () => {
        await assessment.update((a) => {
          a._setRaw("status", "submitted");
          a._setRaw("submitted_at", Date.now());
        });
        await d.get<Declaration>("declarations").create((r) => {
          r._setRaw("assessment_id", assessment.id);
          r._setRaw("text_version", DECLARATION.version);
          r._setRaw("signer_name", signerName.trim());
          r._setRaw("method", "nombre");
          r._setRaw("device_at", Date.now());
        });
      });
      await flushLocalDb(d);
    },
  };
}
