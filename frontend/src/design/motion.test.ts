import { describe, expect, it } from "vitest";
import { DUR, instant, motionPreset, PRESET } from "./motion";

describe("movimiento reducido (HU-DS-04)", () => {
  it("convierte un preset en un cambio instantáneo sin perder el estado final", () => {
    const vars = instant(PRESET.toastIn);
    expect(vars).toMatchObject({ y: 30, opacity: 0, duration: 0, stagger: 0, delay: 0 });
    expect(PRESET.toastIn.duration).toBe(DUR.m);
  });

  it("deja el preset intacto si no hay preferencia", () => {
    expect(motionPreset(PRESET.reveal, false)).toBe(PRESET.reveal);
    expect(motionPreset(PRESET.screenIn(-1), true)).toMatchObject({ xPercent: -14, duration: 0 });
  });
});
