import { Icon } from "@/components/icons";

/* Fallback del service worker cuando una ruta no está en caché y no hay red. */
export const metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <section className="flex flex-col items-start gap-4 pt-8">
      <span className="grid size-14 place-items-center rounded-full bg-rose-100 text-rose-700">
        <Icon name="wifiOff" size="1.6rem" />
      </span>
      <h1 className="a-title">
        Sin <em>conexión</em>
      </h1>
      <p className="text-ink-soft">
        Esta pantalla aún no está guardada en su teléfono. Lo que ya registró sigue guardado y se enviará cuando vuelva la señal.
      </p>
    </section>
  );
}
