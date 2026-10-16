/* Biblioteca de gráficas (GUIA_VISUAL §3.6, skill dataviz).
   Envolver cada gráfica en <ChartCard> (aporta tooltip y vista de tabla). */
export { ChartCard, DataTable, Legend, ORDINAL, compact, niceMax, useMeasure, useTooltip, tipAt } from "./core";
export type { TableColumn } from "./core";
export { BarList, ColumnChart, FunnelChart } from "./bars";
export type { BarDatum, Reference, Stage } from "./bars";
export { LineChart, Sparkline, lineTable } from "./line";
export type { Series } from "./line";
export { RiskMatrix, SEGMENT_COLOR } from "./scatter";
export type { Point } from "./scatter";
export { StatTile, ProgressRing } from "./stat";
