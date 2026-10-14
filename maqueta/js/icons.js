/* Set de iconos de línea (24x24, stroke = currentColor).
   Compartido por la landing y la demo. Sin dependencias. */
(function () {
  const wrap = (body) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  const ICONS = {
    // Ejes
    bpa: wrap('<path d="M12 21v-8"/><path d="M12 13c0-4 3-7 8-7 0 4-3 7-8 7Z"/><path d="M12 15c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5Z"/><path d="M6 21h12"/>'),
    residuos: wrap('<path d="M7.5 7.5 10 3.6a1.2 1.2 0 0 1 2 0l1.6 2.6"/><path d="m15.2 4.9.4 2.6-2.6.4"/><path d="M19.3 11.5 21 14.4a1.2 1.2 0 0 1-1 1.8h-3.2"/><path d="m18.6 18.2-1.8-2 1.8-2"/><path d="M8.2 16.2H4a1.2 1.2 0 0 1-1-1.8l1.6-2.8"/><path d="m2.9 10.9 2.5-.9.8 2.5"/>'),
    carbono: wrap('<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.2 18Z"/><path d="M10.5 14.5a1.8 1.8 0 1 1 0-3"/><path d="M14.5 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>'),
    infantil: wrap('<circle cx="12" cy="6" r="2.4"/><path d="M8.5 21v-5.5L7 12.5a2 2 0 0 1 1.8-2.9h6.4a2 2 0 0 1 1.8 2.9l-1.5 3V21"/><path d="M12 14v7"/><path d="M4 8.5c1.2-.9 2.4-.9 3.5 0M16.5 8.5c1.1-.9 2.3-.9 3.5 0"/>'),
    ddhh: wrap('<path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z"/><path d="m9.2 11.3 2 2 3.8-3.8"/>'),

    // Categorías
    fruver: wrap('<path d="M12 7.5c-1.6-1.3-5.5-1.2-6.6 2.4-1.1 3.6 1.2 9.6 4.6 9.6 1 0 1.3-.5 2-.5s1 .5 2 .5c3.4 0 5.7-6 4.6-9.6C17.5 6.3 13.6 6.2 12 7.5Z"/><path d="M12 7.5c0-2 .8-3.6 2.6-4.5"/><path d="M12 6c-1.5-.2-2.8-1.2-3.2-2.8 1.6-.2 2.9.7 3.2 2.8Z"/>'),
    lacteos: wrap('<path d="M9 2.5h6"/><path d="M9.5 2.5v3L7 9v11.2a1.3 1.3 0 0 0 1.3 1.3h7.4a1.3 1.3 0 0 0 1.3-1.3V9l-2.5-3.5v-3"/><path d="M7 13.5c1.7-1 3.3-1 5 0s3.3 1 5 0"/>'),
    carnes: wrap('<path d="M14.6 3.6c3.5.8 6.1 4 5.6 7.7-.6 4.4-5.6 7.3-10.1 6.1l-3.4 3.4a1.8 1.8 0 0 1-2.6-2.6l.4-.4-.4-.4a1.8 1.8 0 0 1 2.6-2.6l.3.3C5.6 11.7 8.7 2.3 14.6 3.6Z"/><circle cx="14" cy="10" r="2"/>'),
    pescados: wrap('<path d="M2.5 12c2.6-4 6.3-6 10-6 3.6 0 6.3 2.3 7.6 6-1.3 3.7-4 6-7.6 6-3.7 0-7.4-2-10-6Z"/><path d="M20.1 12 22 9v6Z"/><circle cx="15.5" cy="10.8" r=".6" fill="currentColor"/><path d="M9 9.2c.9 1.8.9 3.8 0 5.6"/>'),
    mariscos: wrap('<path d="M18 7.5c-1.4-2.4-4.3-3.6-7.2-2.8C7.2 5.7 5 9.2 5.6 12.8"/><path d="M5.6 12.8c.4 2.3 2 4.2 4.2 5"/><path d="M9.8 17.8 8 21M12.6 18.3 12 21.5M15.2 17.3l1 3"/><path d="M18 7.5c1 1.8 1 4-.1 5.8-1.2 2-3.4 3.3-5.8 3.3"/><path d="M18 7.5 21.5 5M17 5.8 19 2.5"/><circle cx="15.8" cy="8.6" r=".6" fill="currentColor"/>'),

    // Respuestas
    si: wrap('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    aveces: wrap('<path d="M4.5 13c2-3.5 4.5-3.5 7.5 0s5.5 3.5 7.5 0"/>'),
    no: wrap('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),

    // UI
    arrow: wrap('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
    back: wrap('<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>'),
    check: wrap('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    lock: wrap('<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    download: wrap('<path d="M12 3.5v11"/><path d="m7 10 5 5 5-5"/><path d="M4.5 19.5h15"/>'),
    print: wrap('<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7Z"/>'),
    wifiOff: wrap('<path d="M3 3l18 18"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M5 12.9a10 10 0 0 1 4.3-2.4M14.7 10.5A10 10 0 0 1 19 12.9"/><path d="M2 9.2a15 15 0 0 1 5.2-3M12 5.5c3.8 0 7.3 1.4 10 3.7"/><circle cx="12" cy="19.5" r=".7" fill="currentColor"/>'),
    cloudOk: wrap('<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.2 18Z"/><path d="m9.5 13.3 1.8 1.8 3.4-3.4"/>'),
    star: wrap('<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>'),
    truck: wrap('<path d="M2.5 6.5h11v9h-11Z"/><path d="M13.5 9.5h4l3 3.3v2.7h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    seal: wrap('<circle cx="12" cy="9.5" r="5.8"/><path d="m9.6 9.6 1.6 1.6 3.2-3.2"/><path d="m8.2 14 -1.7 6.5 5.5-2.6 5.5 2.6-1.7-6.5"/>'),
    globe: wrap('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    cart: wrap('<path d="M3 4h2.2l2.2 11h10.4l2-7.5H6.3"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'),
    book: wrap('<path d="M4 5.5A2 2 0 0 1 6 3.5h13.5V18H6a2 2 0 0 0-2 2Z"/><path d="M4 20a2 2 0 0 0 2 1.5h13.5V18"/><path d="M8.5 8h7M8.5 11.5h5"/>'),
    chart: wrap('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    route: wrap('<circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="5.5" r="2"/><path d="M8 18.5h8.5a3 3 0 0 0 0-6h-9a3 3 0 0 1 0-6H16"/>'),
    doc: wrap('<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/><path d="M14 3.5v5h5"/><path d="M9 13h6M9 16.5h4"/>'),
    home: wrap('<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5.5h4V20"/>'),
    clock: wrap('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    sparkle: wrap('<path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5Z"/><path d="M19 16.5c.2 1.4.8 2 2.2 2.2-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.2Z"/>'),
    alert: wrap('<path d="M12 4 21 19.5H3Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>'),
    chat: wrap('<path d="M4.5 19.5 5.6 16A7.5 7.5 0 1 1 8 18.4Z"/><path d="M9 10.5h6M9 13.5h4"/>'),
    phone: wrap('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>'),
    signal: wrap('<path d="M4 20v-3M9 20v-6M14 20v-9M19 20V5"/>'),
    plus: wrap('<path d="M12 5v14M5 12h14"/>'),
  };

  window.ICONS = ICONS;
  window.icon = (name, cls = "ico") => `<span class="${cls}">${ICONS[name] || ""}</span>`;
})();
