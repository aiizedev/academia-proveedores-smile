/** URL de la API vista por el navegador (arquitectura.md §7.2). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** URL de la API desde el servidor Next dentro de la red de compose. */
export const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? API_URL;
