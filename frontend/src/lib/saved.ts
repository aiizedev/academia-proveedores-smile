/* Aviso de "guardado en el teléfono" (GUIA_VISUAL §8.10): la base local lo
   emite tras cada escritura confirmada y la barra de estado late con él. */
export const SAVED_EVENT = "smile:saved";

export function announceSaved(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SAVED_EVENT));
}
