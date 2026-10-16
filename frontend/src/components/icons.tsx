/* Íconos de línea portados de maqueta/js/icons.js (GUIA_VISUAL §7):
 * grilla 24×24, trazo 1.6, currentColor, round caps/joins, aria-hidden. */
import type { SVGProps } from "react";

const PATHS = {
  chart: `<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>`,
  book: `<path d="M4 5.5A2 2 0 0 1 6 3.5h13.5V18H6a2 2 0 0 0-2 2Z"/><path d="M4 20a2 2 0 0 0 2 1.5h13.5V18"/><path d="M8.5 8h7M8.5 11.5h5"/>`,
  route: `<circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="5.5" r="2"/><path d="M8 18.5h8.5a3 3 0 0 0 0-6h-9a3 3 0 0 1 0-6H16"/>`,
  doc: `<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/><path d="M14 3.5v5h5"/><path d="M9 13h6M9 16.5h4"/>`,
  home: `<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5.5h4V20"/>`,
  cloudOk: `<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.2 18Z"/><path d="m9.5 13.3 1.8 1.8 3.4-3.4"/>`,
  wifiOff: `<path d="M3 3l18 18"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M5 12.9a10 10 0 0 1 4.3-2.4M14.7 10.5A10 10 0 0 1 19 12.9"/><path d="M2 9.2a15 15 0 0 1 5.2-3M12 5.5c3.8 0 7.3 1.4 10 3.7"/><circle cx="12" cy="19.5" r=".7" fill="currentColor"/>`,
  check: `<path d="m5 12.5 4.5 4.5L19 7.5"/>`,
  arrow: `<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`,
  back: `<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>`,
  bpa: `<path d="M12 21v-8"/><path d="M12 13c0-4 3-7 8-7 0 4-3 7-8 7Z"/><path d="M12 15c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5Z"/><path d="M6 21h12"/>`,
  residuos: `<path d="M7.5 7.5 10 3.6a1.2 1.2 0 0 1 2 0l1.6 2.6"/><path d="m15.2 4.9.4 2.6-2.6.4"/><path d="M19.3 11.5 21 14.4a1.2 1.2 0 0 1-1 1.8h-3.2"/><path d="m18.6 18.2-1.8-2 1.8-2"/><path d="M8.2 16.2H4a1.2 1.2 0 0 1-1-1.8l1.6-2.8"/><path d="m2.9 10.9 2.5-.9.8 2.5"/>`,
  carbono: `<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.2 18Z"/><path d="M10.5 14.5a1.8 1.8 0 1 1 0-3"/><path d="M14.5 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>`,
  infantil: `<circle cx="12" cy="6" r="2.4"/><path d="M8.5 21v-5.5L7 12.5a2 2 0 0 1 1.8-2.9h6.4a2 2 0 0 1 1.8 2.9l-1.5 3V21"/><path d="M12 14v7"/><path d="M4 8.5c1.2-.9 2.4-.9 3.5 0M16.5 8.5c1.1-.9 2.3-.9 3.5 0"/>`,
  ddhh: `<path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z"/><path d="m9.2 11.3 2 2 3.8-3.8"/>`,
  alert: `<path d="M12 4 21 19.5H3Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>`,
  lock: `<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>`,
  chat: `<path d="M4.5 19.5 5.6 16A7.5 7.5 0 1 1 8 18.4Z"/><path d="M9 10.5h6M9 13.5h4"/>`,
  phone: `<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>`,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, ...rest }: { name: IconName; size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
      {...rest}
    />
  );
}
