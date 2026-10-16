import { describe, expect, it } from "vitest";
import { homeFor, parseIdentifier } from "./identifier";

describe("identificador de ingreso (HU-IAM-02)", () => {
  it.each([
    ["3001234567", "3001234567"],
    ["300 123 4567", "3001234567"],
    ["+57 300 123 4567", "3001234567"],
    ["573001234567", "3001234567"],
  ])("normaliza el celular %s", (input, expected) => {
    expect(parseIdentifier(input)).toEqual({ kind: "phone", value: expected });
  });

  it("acepta correo sin importar mayúsculas", () => {
    expect(parseIdentifier(" Proveedor@Smile.test ")).toEqual({ kind: "email", value: "proveedor@smile.test" });
  });

  it.each(["300123456", "6011234567", "correo@", "abc"])("rechaza %s", (input) => {
    expect(parseIdentifier(input)).toBeNull();
  });
});

describe("destino tras ingresar", () => {
  it("lleva al proveedor a /app y al equipo Smile a /smile", () => {
    expect(homeFor("PROVEEDOR")).toBe("/app");
    expect(homeFor("REVIEWER")).toBe("/smile");
    expect(homeFor("ADMIN")).toBe("/smile");
  });

  it("respeta `next` solo dentro de su área", () => {
    expect(homeFor("PROVEEDOR", "/app/ficha")).toBe("/app/ficha");
    expect(homeFor("PROVEEDOR", "/smile/admin")).toBe("/app");
    expect(homeFor("REVIEWER", "//evil.example")).toBe("/smile");
  });
});
