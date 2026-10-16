export const dynamic = "force-static";

/** Healthcheck del contenedor (arquitectura.md §7.1). */
export function GET() {
  return Response.json({ status: "ok" });
}
