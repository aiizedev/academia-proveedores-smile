import { describe, expect, it } from "vitest";
import fixture from "../../../../contracts/fixtures/nit-check-digit.json";
import { checkDigit, normalizeNit, validateNit } from "./nit";
import { EMPTY_PROFILE, isComplete, validateStep, type SupplierProfile } from "./profile";

describe("NIT y dígito de verificación (fixture compartido)", () => {
  it.each(fixture.valid)("$number → DV $dv", ({ number, dv }) => {
    expect(checkDigit(number)).toBe(dv);
    expect(validateNit(number, dv)).toBeNull();
  });

  it.each(fixture.invalid)("$number / $dv → $code", ({ number, dv, code }) => {
    expect(validateNit(number, dv)).toBe(code);
  });

  it.each(fixture.normalize)("normaliza $input", ({ input, number }) => {
    expect(normalizeNit(input)).toBe(number);
  });
});

const complete: SupplierProfile = {
  personType: "natural",
  taxId: fixture.valid[0]!.number,
  taxDv: fixture.valid[0]!.dv,
  legalName: "Finca La Esperanza",
  legalRep: "",
  departmentCode: "25",
  municipalityCode: "25290",
  vereda: "",
  contactChannel: "whatsapp",
  mainCategory: "fruver",
};

describe("ficha de identificación (CU-04)", () => {
  it("una ficha vacía no está completa", () => {
    expect(isComplete(EMPTY_PROFILE)).toBe(false);
    expect(validateStep("identificacion", EMPTY_PROFILE)).toMatchObject({ personType: "required", legalName: "required" });
  });

  it("acepta una ficha completa de persona natural", () => {
    expect(isComplete(complete)).toBe(true);
  });

  it("señala el DV que no coincide", () => {
    expect(validateStep("identificacion", { ...complete, taxDv: fixture.invalid[0]!.dv })).toEqual({ taxDv: "nit_check_digit_mismatch" });
  });

  it("persona jurídica exige representante legal", () => {
    expect(validateStep("identificacion", { ...complete, personType: "juridica" })).toEqual({ legalRep: "legal_rep_required" });
  });

  it("el municipio debe pertenecer al departamento", () => {
    expect(validateStep("ubicacion", { ...complete, municipalityCode: "15001" })).toEqual({ municipalityCode: "invalid_divipola" });
  });
});
