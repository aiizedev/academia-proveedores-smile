import type { Database } from "@nozbe/watermelondb";

/* Base local del proveedor. Solo existe en el navegador: este módulo se importa
   de forma dinámica desde componentes cliente (nunca en SSR) para que
   LokiJS/IndexedDB no entren al bundle del servidor ni rompan `next build`. */
let instance: Promise<Database> | null = null;

export function getDatabase(): Promise<Database> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("WatermelonDB solo está disponible en el navegador"));
  }
  instance ??= (async () => {
    const [{ Database }, { default: LokiJSAdapter }, { schema }, { modelClasses }] = await Promise.all([
      import("@nozbe/watermelondb"),
      import("@nozbe/watermelondb/adapters/lokijs"),
      import("./schema"),
      import("./models"),
    ]);
    const adapter = new LokiJSAdapter({
      schema,
      dbName: "smile-proveedor",
      useWebWorker: false,
      useIncrementalIndexedDB: true,
      onQuotaExceededError: (error) => console.error("[db] sin espacio en el dispositivo", error),
      onSetUpError: (error) => console.error("[db] no se pudo abrir la base local", error),
    });
    // RNF-OFF-002: pedir almacenamiento persistente para que el navegador no lo borre.
    void navigator.storage?.persist?.();
    return new Database({ adapter, modelClasses });
  })();
  return instance;
}
