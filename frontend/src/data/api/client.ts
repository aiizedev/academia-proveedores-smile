import createClient from "openapi-fetch";
import { API_URL } from "@/lib/env";
import type { paths } from "./schema";

/* Cliente HTTP tipado desde contracts/openapi.json (HU-PLAT-05, RNF-MNT-004).
   En /app solo lo usan data/sync y la autenticación: la UI lee y escribe en
   WatermelonDB (ADR-0005). /smile lo consume con TanStack Query. */
export const api = createClient<paths>({ baseUrl: API_URL });

export type { paths };
