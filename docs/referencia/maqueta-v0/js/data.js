/* ==========================================================
   Datos del piloto Fruver
   ----------------------------------------------------------
   PLACEHOLDER: las ponderaciones, rangos y reglas los define
   el equipo de Ingeniería Industrial (matriz de diagnóstico).
   La estructura está pensada para reemplazarse por un JSON
   descargado y cacheado offline sin tocar el motor.
   ========================================================== */
window.SMILE_DATA = {
  version: "0.1.0-maqueta",
  category: "fruver",

  categories: [
    { id: "fruver", name: "Fruver", desc: "Frutas y verduras", icon: "fruver", active: true },
    { id: "lacteos", name: "Lácteos", desc: "Leche y derivados", icon: "lacteos", active: false },
    { id: "carnes", name: "Carnes", desc: "Res, cerdo y aves", icon: "carnes", active: false },
    { id: "pescados", name: "Pescados", desc: "Pesca y acuicultura", icon: "pescados", active: false },
    { id: "mariscos", name: "Mariscos", desc: "Camarón, pulpo y más", icon: "mariscos", active: false },
  ],

  axes: [
    { id: "bpa", name: "Buenas Prácticas Agrícolas", short: "Buenas prácticas", icon: "bpa" },
    { id: "residuos", name: "Manejo de residuos", short: "Residuos", icon: "residuos" },
    { id: "carbono", name: "Huella de carbono", short: "Huella de carbono", icon: "carbono" },
    { id: "infantil", name: "Prevención del trabajo infantil", short: "Trabajo infantil", icon: "infantil" },
    { id: "ddhh", name: "Derechos Humanos", short: "Derechos humanos", icon: "ddhh" },
  ],

  // Valor de cada respuesta (0 a 1)
  answers: [
    { id: "si", label: "Sí", icon: "si", value: 1 },
    { id: "aveces", label: "A veces", icon: "aveces", value: 0.5 },
    { id: "no", label: "No", icon: "no", value: 0 },
  ],

  questions: [
    {
      id: "q1", axis: "bpa", weight: 3,
      text: "¿Usas solo agroquímicos con registro ICA y esperas los días indicados antes de cosechar?",
      help: "Esos días se llaman periodo de carencia y están escritos en la etiqueta del producto.",
      critical: { when: "no", message: "Usar productos sin registro ICA o cosechar antes del periodo de carencia pone en riesgo tu salud y la de quien consume." },
    },
    {
      id: "q2", axis: "bpa", weight: 2,
      text: "¿Anotas cada aplicación: producto, dosis, fecha y lote?",
      help: "Un cuaderno sencillo sirve. Es la base de la certificación BPA.",
    },
    {
      id: "q3", axis: "residuos", weight: 2,
      text: "¿Separas la basura de la finca en orgánicos, plásticos y envases?",
      help: "Verde para orgánicos, blanco para lo que se puede reciclar y negro para lo que no.",
    },
    {
      id: "q4", axis: "residuos", weight: 3,
      text: "¿Lavas tres veces los envases de agroquímicos y los entregas en un punto de recolección?",
      help: "Esto se llama triple lavado. Nunca se queman ni se reutilizan.",
    },
    {
      id: "q5", axis: "carbono", weight: 2,
      text: "¿Llevas la cuenta del combustible y el abono que usas cada mes?",
      help: "Con esos dos números ya puedes estimar tu huella de carbono.",
    },
    {
      id: "q6", axis: "carbono", weight: 2,
      text: "¿Tienes árboles, cercas vivas o coberturas de suelo en tu finca?",
      help: "Las plantas guardan carbono y protegen el suelo de la erosión.",
    },
    {
      id: "q7", axis: "infantil", weight: 3,
      text: "Si hay jóvenes en la finca, ¿todos tienen 15 años o más, permiso del inspector de trabajo y lejos de tareas peligrosas?",
      help: "Si no trabaja ningún menor de edad, responde Sí. Aprender el oficio en familia está bien cuando no quita tiempo de escuela ni pone en riesgo.",
      critical: { when: ["no", "aveces"], message: "Conviene revisar cómo participan los jóvenes en la finca. La guía de prevención te muestra cómo hacerlo bien y sin riesgos." },
    },
    {
      id: "q8", axis: "infantil", weight: 2,
      text: "¿Los niños y niñas de las familias de la finca van a la escuela?",
      help: "Ayudar en casa nunca debe reemplazar el estudio.",
    },
    {
      id: "q9", axis: "ddhh", weight: 3,
      text: "¿Pagas a tiempo y al menos el salario mínimo por cada día trabajado?",
      help: "Guarda un registro o recibo de cada pago.",
    },
    {
      id: "q10", axis: "ddhh", weight: 2,
      text: "¿Quienes trabajan contigo tienen agua potable, baño y elementos de protección?",
      help: "Guantes, botas y tapabocas deben entregarse sin costo.",
    },
  ],

  // Rangos de madurez (porcentaje del eje)
  levels: [
    { id: "inicial", name: "Inicial", min: 0, priority: "alta" },
    { id: "desarrollo", name: "En desarrollo", min: 40, priority: "media" },
    { id: "avanzado", name: "Avanzado", min: 75, priority: "mantener" },
  ],

  priorities: {
    critica: { label: "Urgente", order: 0 },
    alta: { label: "Prioridad alta", order: 1 },
    media: { label: "Prioridad media", order: 2 },
    mantener: { label: "Mantener", order: 3 },
  },

  guides: [
    {
      id: "g-agro", axis: "bpa", minutes: 8,
      title: "Agroquímicos bajo control",
      intro: "Usar bien los agroquímicos protege tu salud, tu tierra y la confianza de quien compra tu cosecha.",
      steps: [
        { t: "Compra solo lo registrado", d: "Busca el número de registro ICA en la etiqueta. Si no lo tiene, no lo uses." },
        { t: "Mira la banda de color", d: "Roja y amarilla son las más tóxicas. Pide al agrónomo opciones de banda azul o verde." },
        { t: "Protégete siempre", d: "Guantes, tapabocas con filtro, gafas, botas y manga larga. Lava esa ropa aparte." },
        { t: "Respeta el periodo de carencia", d: "Son los días entre la última aplicación y la cosecha. Están en la etiqueta." },
        { t: "Anota cada aplicación", d: "Fecha, lote, producto, dosis y quién aplicó. Es la base de la certificación BPA." },
      ],
      checklist: [
        "Bodega de agroquímicos con llave, lejos de la casa y del agua",
        "Cuaderno de aplicaciones al día",
        "Equipo de protección completo para cada persona",
        "Bomba de fumigar calibrada esta temporada",
      ],
      tip: "Pregunta por la certificación en Buenas Prácticas Agrícolas del ICA: abre puertas con compradores grandes.",
      source: "Referencia: Resolución ICA 30021 de 2017 (BPA en producción primaria de vegetales).",
    },
    {
      id: "g-organico", axis: "bpa", minutes: 10, bonus: true,
      title: "Camino a la producción orgánica",
      intro: "No tienes que cambiar todo de una vez. Empieza con un lote pequeño y aprende en el camino.",
      steps: [
        { t: "Conoce tu suelo", d: "Haz un análisis de suelo para saber qué le falta y dejar de abonar a ciegas." },
        { t: "Prepara tu abono", d: "Compost o bocashi con residuos de cosecha, estiércol y hojas secas." },
        { t: "Manejo integrado de plagas", d: "Trampas amarillas, plantas repelentes y controladores biológicos antes que químicos." },
        { t: "Un lote de prueba", d: "Elige un lote y manéjalo sin químicos sintéticos. Compara rendimiento y costos." },
        { t: "Transición y sello", d: "La conversión suele tomar de 2 a 3 años. Al final puedes buscar el Sello de Alimento Ecológico." },
      ],
      checklist: [
        "Análisis de suelo hecho en el último año",
        "Compostera o bocashi funcionando",
        "Trampas o controladores biológicos instalados",
        "Lote de prueba definido",
      ],
      tip: "El producto en transición ya puede tener mejor precio en restaurantes que valoran lo limpio.",
      source: "Referencia: Resolución MinAgricultura 199 de 2016 (producción ecológica).",
    },
    {
      id: "g-residuos", axis: "residuos", minutes: 7,
      title: "Finca limpia, menos pérdidas",
      intro: "Lo que hoy es basura puede ser abono, y lo que hoy se pierde en la cosecha es dinero.",
      steps: [
        { t: "Separa en tres", d: "Verde: orgánicos. Blanco: plástico y cartón limpios. Negro: lo que no se aprovecha." },
        { t: "Triple lavado", d: "Enjuaga el envase tres veces, echa esa agua en la bomba y perfora el envase." },
        { t: "Entrega los envases", d: "Llévalos a un punto de recolección posconsumo. Pregunta en tu almacén agrícola." },
        { t: "Haz compost", d: "Capas de residuos de cosecha, estiércol y hojas. Voltea cada 15 días." },
        { t: "Cuida la cosecha", d: "Cosecha en horas frescas, usa canastillas limpias y deja el producto a la sombra." },
      ],
      checklist: [
        "Tres canecas o puntos de separación señalizados",
        "Envases vacíos con triple lavado y perforados",
        "Compostera activa",
        "Canastillas en lugar de costales",
      ],
      tip: "Menos merma significa más kilos vendidos con el mismo trabajo.",
      source: "Referencia: Resolución 2184 de 2019 (código de colores para separación).",
    },
    {
      id: "g-carbono", axis: "carbono", minutes: 6, calculator: true,
      title: "Tu huella en tres números",
      intro: "Medir es el primer paso. Con lo que ya compras cada mes puedes estimar tu huella de carbono.",
      steps: [
        { t: "Combustible", d: "Anota los litros de ACPM o gasolina del mes: bomba, guadaña, transporte." },
        { t: "Abono nitrogenado", d: "Anota los kilos de urea u otros abonos con nitrógeno. Suelen ser la mayor fuente de emisiones." },
        { t: "Electricidad", d: "Mira los kWh de tu recibo de luz." },
        { t: "Abona justo", d: "Con el análisis de suelo pones solo lo necesario: ahorras dinero y emisiones." },
        { t: "Siembra y comparte", d: "Árboles y cercas vivas guardan carbono. Comparte transporte con vecinos al centro de acopio." },
      ],
      checklist: [
        "Registro mensual de combustible",
        "Registro de abonos aplicados",
        "Plan de siembra de árboles o cercas vivas",
        "Transporte compartido al menos una vez al mes",
      ],
      tip: "Usa la calculadora de abajo cada mes y compara: lo que baja la huella casi siempre baja el costo.",
      source: "Factores aproximados con fines educativos: ACPM ≈ 2,7 kg CO₂e/litro · gasolina ≈ 2,3 · urea ≈ 4,7 kg CO₂e/kg (emisiones en campo, IPCC 2019, clima húmedo) · red eléctrica ≈ 0,13 kg CO₂e/kWh.",
    },
    {
      id: "g-infantil", axis: "infantil", minutes: 6,
      title: "Infancia protegida",
      intro: "El lugar de los niños y niñas es la escuela y el juego. Protegerlos también protege tu negocio.",
      steps: [
        { t: "Conoce la regla", d: "Menores de 15 años no pueden trabajar. De 15 a 17 solo con permiso del inspector de trabajo." },
        { t: "Tareas prohibidas", d: "Ningún menor aplica agroquímicos, carga pesos, usa machete o maquinaria." },
        { t: "Registra a tu equipo", d: "Nombre, documento, edad y fecha de ingreso de cada persona que trabaja contigo." },
        { t: "Escuela primero", d: "Acuerda horarios que no choquen con la escuela. Apoya útiles y transporte si puedes." },
        { t: "Ruta de ayuda", d: "Si conoces un caso de riesgo, llama gratis a la Línea 141 del ICBF." },
      ],
      checklist: [
        "Registro de trabajadores con documento y edad",
        "Ningún menor en tareas peligrosas",
        "Niños y niñas de la finca estudiando",
        "Línea 141 del ICBF visible en la finca",
      ],
      tip: "Los compradores grandes revisan este eje primero. Tenerlo en orden abre puertas.",
      source: "Referencia: Código de Infancia y Adolescencia y Resolución 1796 de 2018 (actividades peligrosas).",
    },
    {
      id: "g-ddhh", axis: "ddhh", minutes: 7,
      title: "Trabajo digno en la finca",
      intro: "Un equipo bien tratado trabaja mejor, se queda más tiempo y cuida tu cosecha.",
      steps: [
        { t: "Pago justo y a tiempo", d: "Al menos el salario mínimo proporcional al jornal. Deja registro de cada pago." },
        { t: "Seguridad social", d: "Salud, pensión y riesgos laborales. Si pagas por días, pregunta por el Piso de Protección Social." },
        { t: "Lo básico", d: "Agua potable, baño, sombra y descansos. Protección sin costo para el trabajador." },
        { t: "Trato respetuoso", d: "Sin discriminación ni acoso. Nunca retengas documentos ni pagos." },
        { t: "Canal de quejas", d: "Un buzón o una persona de confianza para hablar sin miedo." },
      ],
      checklist: [
        "Registro o recibo de cada pago",
        "Afiliación a seguridad social de tu equipo",
        "Agua potable y baño disponibles",
        "Canal de quejas conocido por todos",
      ],
      tip: "Estas prácticas son las que piden los sellos de comercio justo.",
      source: "Referencia: Convenios fundamentales de la OIT y Principios Rectores de la ONU sobre Empresas y DDHH.",
    },
  ],

  incentives: [
    { id: "diag", icon: "chart", title: "Diagnóstico personalizado", req: "Completa tu autoevaluación" },
    { id: "compras", icon: "cart", title: "Prioridad en compras", req: "Completa 2 guías" },
    { id: "sello", icon: "seal", title: "Sello Proveedor Sostenible", req: "Completa una guía de cada eje" },
    { id: "mercados", icon: "globe", title: "Nuevos mercados", req: "Llega a nivel Avanzado en los 5 ejes" },
  ],
};
