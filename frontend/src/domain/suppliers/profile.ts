import { validateNit, type NitError } from "./nit";

/* Ficha de identificación (RF-SUP-001, RF-SUP-003, CU-04). Mismas reglas que
   backend/.../suppliers/domain/supplier.py para que la PWA no encole una ficha
   que el servidor rechazaría al sincronizar. */
export type PersonType = "natural" | "juridica";
export type ContactChannel = "whatsapp" | "llamada" | "correo";

export interface SupplierProfile {
  personType: PersonType | null;
  taxId: string;
  taxDv: string;
  legalName: string;
  legalRep: string;
  departmentCode: string;
  municipalityCode: string;
  vereda: string;
  contactChannel: ContactChannel | null;
  mainCategory: string;
}

export const EMPTY_PROFILE: SupplierProfile = {
  personType: null,
  taxId: "",
  taxDv: "",
  legalName: "",
  legalRep: "",
  departmentCode: "",
  municipalityCode: "",
  vereda: "",
  contactChannel: null,
  mainCategory: "",
};

export type ProfileField = keyof SupplierProfile;
export type ProfileError =
  | "required"
  | NitError
  | "legal_rep_required"
  | "invalid_divipola";

export type ProfileErrors = Partial<Record<ProfileField, ProfileError>>;

/** Pasos de CU-04 en el POC; cada uno con ≤ 4 campos (U-01). */
export const STEPS = {
  identificacion: ["personType", "taxId", "taxDv", "legalName", "legalRep"],
  ubicacion: ["departmentCode", "municipalityCode", "vereda"],
  contacto: ["contactChannel", "mainCategory"],
} as const satisfies Record<string, readonly ProfileField[]>;

export type Step = keyof typeof STEPS;

export function validateStep(step: Step, p: SupplierProfile): ProfileErrors {
  const errors: ProfileErrors = {};
  const need = (field: ProfileField, ok: boolean) => {
    if (!ok) errors[field] = "required";
  };

  if (step === "identificacion") {
    need("personType", p.personType !== null);
    need("taxId", p.taxId.trim() !== "");
    need("taxDv", p.taxDv.trim() !== "");
    need("legalName", p.legalName.trim() !== "");
    if (!errors.taxId && !errors.taxDv) {
      const nit = validateNit(p.taxId, p.taxDv);
      if (nit === "invalid_nit") errors.taxId = nit;
      if (nit === "nit_check_digit_mismatch") errors.taxDv = nit;
    }
    if (p.personType === "juridica" && p.legalRep.trim() === "") errors.legalRep = "legal_rep_required";
  }

  if (step === "ubicacion") {
    need("departmentCode", /^\d{2}$/.test(p.departmentCode));
    need("municipalityCode", /^\d{5}$/.test(p.municipalityCode));
    if (!errors.departmentCode && !errors.municipalityCode && !p.municipalityCode.startsWith(p.departmentCode)) {
      errors.municipalityCode = "invalid_divipola";
    }
  }

  if (step === "contacto") {
    need("contactChannel", p.contactChannel !== null);
    need("mainCategory", p.mainCategory !== "");
  }

  return errors;
}

/** La ficha queda completa cuando ningún paso tiene errores (CU-04 paso 9). */
export function isComplete(p: SupplierProfile): boolean {
  return (Object.keys(STEPS) as Step[]).every((step) => Object.keys(validateStep(step, p)).length === 0);
}
