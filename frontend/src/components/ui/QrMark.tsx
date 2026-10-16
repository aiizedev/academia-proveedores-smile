/* Marca tipo QR para el rótulo del lote (POC). Dibuja una matriz 25 × 25
   determinista a partir del texto, con los tres patrones de posición; el QR
   real se genera en el teléfono en R2. Ninguna información depende de él:
   el código del lote va siempre en texto al lado. */
const N = 25;

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);

export function QrMark({ text, size = 112, label = "Código QR de muestra del lote" }: { text: string; size?: number; label?: string }) {
  const next = hash(text);
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && next() > 0.52) cells.push([x, y]);
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" rx="1.4" />
      <rect x={x + 1} y={y + 1} width="5" height="5" rx="0.9" style={{ fill: "var(--white)" }} />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.6" />
    </g>
  );
  return (
    <svg role="img" aria-label={label} viewBox={`-1 -1 ${N + 2} ${N + 2}`} width={size} height={size} style={{ fill: "var(--ink)" }} shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} style={{ fill: "var(--white)" }} />
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" />
      ))}
    </svg>
  );
}
