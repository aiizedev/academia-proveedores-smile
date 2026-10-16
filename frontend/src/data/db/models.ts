import { Model } from "@nozbe/watermelondb";
import type { ConsentDecision, ConsentKind, ConsentRecord } from "@/domain/privacy/consent";
import type { ContactChannel, PersonType, SupplierProfile } from "@/domain/suppliers/profile";

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
  get formVersion(): string { return this._getRaw("form_version") as string; }
  get category(): string { return (this._getRaw("category") as string | null) ?? ""; }
  get size(): string { return (this._getRaw("size") as string | null) ?? ""; }
}

export class AssessmentAnswer extends Model {
  static override table = "assessment_answers";
  static override associations = {
    assessments: { type: "belongs_to" as const, key: "assessment_id" },
  };

  get assessmentId(): string { return this._getRaw("assessment_id") as string; }
  get questionId(): string { return this._getRaw("question_id") as string; }
  get answer(): string { return this._getRaw("answer") as string; }
  get detail(): string { return (this._getRaw("detail") as string | null) ?? ""; }
}

export class Declaration extends Model {
  static override table = "declarations";
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

/** Columna local ↔ campo de dominio de la ficha. */
export const PROFILE_COLUMNS = {
  personType: "person_type",
  taxId: "tax_id",
  taxDv: "tax_dv",
  legalName: "legal_name",
  legalRep: "legal_rep",
  departmentCode: "department_code",
  municipalityCode: "municipality_code",
  vereda: "vereda",
  contactChannel: "contact_channel",
  mainCategory: "main_category",
} as const satisfies Record<keyof SupplierProfile, string>;

export class SupplierProfileRecord extends Model {
  static override table = "supplier_profile";

  get completedAt(): number | null { return (this._getRaw("completed_at") as number | null) ?? null; }

  toProfile(): SupplierProfile {
    const text = (column: string) => (this._getRaw(column) as string | null) ?? "";
    return {
      personType: (this._getRaw("person_type") as PersonType | null) ?? null,
      taxId: text("tax_id"),
      taxDv: text("tax_dv"),
      legalName: text("legal_name"),
      legalRep: text("legal_rep"),
      departmentCode: text("department_code"),
      municipalityCode: text("municipality_code"),
      vereda: text("vereda"),
      contactChannel: (this._getRaw("contact_channel") as ContactChannel | null) ?? null,
      mainCategory: text("main_category"),
    };
  }

  /** Escribe la ficha; usar dentro de `record.update()` o `create()`. */
  applyProfile(profile: SupplierProfile, completedAt: number | null): void {
    for (const [field, column] of Object.entries(PROFILE_COLUMNS)) {
      const value = profile[field as keyof SupplierProfile];
      this._setRaw(column, value === "" ? null : value);
    }
    this._setRaw("completed_at", completedAt);
  }
}

export const modelClasses = [Sale, Assessment, AssessmentAnswer, Consent, SupplierProfileRecord, Declaration];
