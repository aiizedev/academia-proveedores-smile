// POC: DIVIPOLA provisional; quitar cuando /api/v1/catalog/bundle la publique.
/* Catálogo local mínimo para la ficha (CU-04), disponible sin conexión.
   Lista provisional hasta que /api/v1/catalog/bundle publique DIVIPOLA y
   llegue por pull (HU-SYN-02). Departamentos completos (DANE); municipios solo
   los del seed de demo (Cundinamarca y Boyacá, backend/.../suppliers/seed.py). */
export interface Department { code: string; name: string }
export interface Municipality { code: string; name: string; departmentCode: string }
export interface Category { code: string; name: string; status: "ACTIVA" | "PROXIMAMENTE" }

export const DEPARTMENTS: readonly Department[] = [
  { code: "91", name: "Amazonas" }, { code: "05", name: "Antioquia" }, { code: "81", name: "Arauca" },
  { code: "08", name: "Atlántico" }, { code: "11", name: "Bogotá D.C." }, { code: "13", name: "Bolívar" },
  { code: "15", name: "Boyacá" }, { code: "17", name: "Caldas" }, { code: "18", name: "Caquetá" },
  { code: "85", name: "Casanare" }, { code: "19", name: "Cauca" }, { code: "20", name: "Cesar" },
  { code: "27", name: "Chocó" }, { code: "23", name: "Córdoba" }, { code: "25", name: "Cundinamarca" },
  { code: "94", name: "Guainía" }, { code: "95", name: "Guaviare" }, { code: "41", name: "Huila" },
  { code: "44", name: "La Guajira" }, { code: "47", name: "Magdalena" }, { code: "50", name: "Meta" },
  { code: "52", name: "Nariño" }, { code: "54", name: "Norte de Santander" }, { code: "86", name: "Putumayo" },
  { code: "63", name: "Quindío" }, { code: "66", name: "Risaralda" }, { code: "88", name: "San Andrés y Providencia" },
  { code: "68", name: "Santander" }, { code: "70", name: "Sucre" }, { code: "73", name: "Tolima" },
  { code: "76", name: "Valle del Cauca" }, { code: "97", name: "Vaupés" }, { code: "99", name: "Vichada" },
];

export const MUNICIPALITIES: readonly Municipality[] = [
  { code: "25040", name: "Anolaima", departmentCode: "25" },
  { code: "25279", name: "Fómeque", departmentCode: "25" },
  { code: "25290", name: "Fusagasugá", departmentCode: "25" },
  { code: "25386", name: "La Mesa", departmentCode: "25" },
  { code: "25513", name: "Pacho", departmentCode: "25" },
  { code: "25743", name: "Silvania", departmentCode: "25" },
  { code: "25875", name: "Villeta", departmentCode: "25" },
  { code: "25899", name: "Zipaquirá", departmentCode: "25" },
  { code: "15238", name: "Duitama", departmentCode: "15" },
  { code: "15516", name: "Paipa", departmentCode: "15" },
  { code: "15646", name: "Samacá", departmentCode: "15" },
  { code: "15759", name: "Sogamoso", departmentCode: "15" },
  { code: "15001", name: "Tunja", departmentCode: "15" },
  { code: "15861", name: "Ventaquemada", departmentCode: "15" },
];

/** Espejo de la migración 0003 de catalog (C-08: en el piloto solo Fruver está activa). */
export const CATEGORIES: readonly Category[] = [
  { code: "fruver", name: "Fruver", status: "ACTIVA" },
  { code: "lacteos", name: "Lácteos", status: "PROXIMAMENTE" },
  { code: "carnes", name: "Carnes", status: "PROXIMAMENTE" },
  { code: "pescados_mariscos", name: "Pescados y Mariscos", status: "PROXIMAMENTE" },
  { code: "insumos_servicios", name: "Insumos y Servicios", status: "PROXIMAMENTE" },
];

export function municipalitiesOf(departmentCode: string): Municipality[] {
  return MUNICIPALITIES.filter((m) => m.departmentCode === departmentCode).sort((a, b) => a.name.localeCompare(b.name, "es"));
}
