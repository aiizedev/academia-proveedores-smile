import { describe, expect, it } from "vitest";
import contract from "../../../../contracts/fixtures/question-bank.json";
import local from "./question-bank.json";
import guidesContract from "../../../../contracts/fixtures/guides.json";
import localGuides from "./guides.json";

// El banco viaja en el bundle para responder sin conexión; el build de Docker
// no ve contracts/, así que se versiona una copia que debe ser idéntica.
describe("contenido embebido", () => {
  it("es idéntico a contracts/fixtures/question-bank.json", () => {
    expect(local).toEqual(contract);
  });
  it("las guías son idénticas a contracts/fixtures/guides.json", () => {
    expect(localGuides).toEqual(guidesContract);
  });
});
