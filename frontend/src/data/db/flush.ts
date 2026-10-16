import type { Database } from "@nozbe/watermelondb";

/* LokiJS guarda en IndexedDB cada 500 ms (autosave de WatermelonDB 0.28). Si la
   página se recarga antes —navegación sin red, cerrar la app— lo último se
   pierde (RNF-OFF-003). flushLocalDb() fuerza ese guardado. Usa la ruta interna
   del adaptador síncrono (useWebWorker: false), fijada a la versión exacta del
   package.json; si cambia, espera un ciclo de autosave en su lugar. */
const AUTOSAVE_INTERVAL_MS = 500;

interface LokiLike {
  saveDatabase(callback: (error?: unknown) => void): void;
}

function findLoki(database: Database): LokiLike | null {
  const adapter = database.adapter as unknown as {
    underlyingAdapter?: { _dispatcher?: { _worker?: { _bridge?: { driver?: { loki?: LokiLike } } } } };
  };
  const loki = adapter.underlyingAdapter?._dispatcher?._worker?._bridge?.driver?.loki;
  return loki && typeof loki.saveDatabase === "function" ? loki : null;
}

export function flushLocalDb(database: Database): Promise<void> {
  const loki = findLoki(database);
  if (!loki) return new Promise((resolve) => setTimeout(resolve, AUTOSAVE_INTERVAL_MS + 100));
  return new Promise((resolve, reject) => loki.saveDatabase((error) => (error ? reject(error) : resolve())));
}
