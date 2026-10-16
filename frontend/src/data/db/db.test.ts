import { describe, expect, it } from "vitest";
import { createDatabase } from "./index";
import { Assessment } from "./models";
import { SCHEMA_VERSION } from "./schema";

// En Node, LokiJS usa memoria: mismas tablas, modelos y migraciones que el navegador.
const memoryDb = () => createDatabase({ useIncrementalIndexedDB: false, dbName: `test-${Math.random()}` });

describe("base local (HU-SYN-01)", () => {
  it("abre con el esquema vigente y guarda un registro de inmediato", async () => {
    const db = await memoryDb();
    expect(db.schema.version).toBe(SCHEMA_VERSION);

    const started = performance.now();
    await db.write(() =>
      db.get<Assessment>("assessments").create((a) => {
        a._setRaw("cycle_id", "2026-C3");
        a._setRaw("form_version", "1");
        a._setRaw("status", "draft");
        a._setRaw("current_index", 0);
      }),
    );
    expect(performance.now() - started).toBeLessThan(300);

    const [saved] = await db.get<Assessment>("assessments").query().fetch();
    expect(saved?.cycleId).toBe("2026-C3");
    expect(saved?.status).toBe("draft");
  });
});
