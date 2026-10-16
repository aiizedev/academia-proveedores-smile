import type { Database } from "@nozbe/watermelondb";
import type { LokiAdapterOptions } from "@nozbe/watermelondb/adapters/lokijs";

/* Base local del proveedor (HU-SYN-01, ADR-0005). Solo existe en el navegador:
   este módulo se importa de forma dinámica desde componentes cliente (nunca en
   SSR) para que LokiJS/IndexedDB no entren al bundle del servidor. */

export const DB_NAME = "smile-proveedor";

type AdapterOverrides = Partial<Pick<LokiAdapterOptions, "useWebWorker" | "useIncrementalIndexedDB" | "dbName">>;

/**
 * Crea la base y espera a que el adaptador termine de abrirla. Si IndexedDB
 * falla (modo privado, cuota, archivo dañado) la promesa se rechaza para que
 * la UI muestre la pantalla de recuperación en vez de quedarse en blanco.
 */
export async function createDatabase(overrides: AdapterOverrides = {}): Promise<Database> {
  const [{ Database }, { default: LokiJSAdapter }, { schema }, { migrations }, { modelClasses }] = await Promise.all([
    import("@nozbe/watermelondb"),
    import("@nozbe/watermelondb/adapters/lokijs"),
    import("./schema"),
    import("./migrations"),
    import("./models"),
  ]);

  let failSetup: (error: Error) => void = () => {};
  const setupFailed = new Promise<never>((_, reject) => {
    failSetup = reject;
  });

  const adapter = new LokiJSAdapter({
    schema,
    migrations,
    dbName: DB_NAME,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    onQuotaExceededError: (error) => console.error("[db] sin espacio en el dispositivo", error),
    onSetUpError: (error) => failSetup(error),
    ...overrides,
  });
  const database = new Database({ adapter, modelClasses });

  // Una lectura mínima obliga al adaptador a terminar de abrir la base.
  await Promise.race([database.get("assessments").query().fetchCount(), setupFailed]);
  return database;
}

let instance: Promise<Database> | null = null;

export function getDatabase(): Promise<Database> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("WatermelonDB solo está disponible en el navegador"));
  }
  instance ??= createDatabase().then(
    (database) => {
      // RNF-OFF-002: pedir almacenamiento persistente para que el navegador no lo borre.
      void navigator.storage?.persist?.();
      return database;
    },
    (error: unknown) => {
      instance = null; // permitir reintentar desde la pantalla de recuperación
      throw error;
    },
  );
  return instance;
}
