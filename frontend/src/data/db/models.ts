import { Model } from "@nozbe/watermelondb";
import type { ConsentDecision, ConsentKind, ConsentRecord } from "@/domain/privacy/consent";

/* Modelos SIN decoradores (ADR-0005): el compilador SWC de Next no aplica los
   decoradores "legacy" que espera WatermelonDB, así que los campos se exponen
   con getters sobre `_getRaw`. Escribir siempre dentro de `record.update()`
   usando `_setRaw` o los setters de abajo. */

export class Sale extends Model {
  static override table = "erp_sales";

  get soldOn(): string { return this._getRaw("sold_on") as string; }
  get customerKind(): "smile" | "otro" { return this._getRaw("customer_kind") as "smile" | "otro"; }
  get productId(): string { return this._getRaw("product_id") as string; }
  get quantity(): number { return this._getRaw("quantity") as number; }
  get unit(): string { return this._getRaw("unit") as string; }
  get amountCop(): number { return this._getRaw("amount_cop") as number; }
}

export class Assessment extends Model {
  static override table = "assessments";
  static override associations = {
    assessment_answers: { type: "has_many" as const, foreignKey: "assessment_id" },
  };

  get cycleId(): string { return this._getRaw("cycle_id") as string; }
  get status(): "draft" | "submitted" { return this._getRaw("status") as "draft" | "submitted"; }
  get currentIndex(): number { return this._getRaw("current_index") as number; }
}

export class AssessmentAnswer extends Model {
  static override table = "assessment_answers";
  static override associations = {
    assessments: { type: "belongs_to" as const, key: "assessment_id" },
  };

  get assessmentId(): string { return this._getRaw("assessment_id") as string; }
  get questionId(): string { return this._getRaw("question_id") as string; }
  get answer(): string { return this._getRaw("answer") as string; }
}

export class Consent extends Model {
  static override table = "consents";

  get kind(): ConsentKind { return this._getRaw("kind") as ConsentKind; }
  get decision(): ConsentDecision { return this._getRaw("decision") as ConsentDecision; }
  get textSha256(): string { return this._getRaw("text_sha256") as string; }
  get deviceAt(): number { return this._getRaw("device_at") as number; }

  toRecord(): ConsentRecord {
    return { kind: this.kind, decision: this.decision, textSha256: this.textSha256, deviceAt: this.deviceAt };
  }
}

export const modelClasses = [Sale, Assessment, AssessmentAnswer, Consent];
