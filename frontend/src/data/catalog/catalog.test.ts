import { describe, expect, it } from "vitest";
import contract from "../../../../contracts/fixtures/question-bank.json";
import local from "./question-bank.json";

// El banco viaja en el bundle para responder sin conexión; el build de Docker
// no ve contracts/, así que se versiona una copia que debe ser idéntica.
describe("banco de preguntas embebido", () => {
  it("es idéntico a contracts/fixtures/question-bank.json", () => {
    expect(local).toEqual(contract);
  });
});
