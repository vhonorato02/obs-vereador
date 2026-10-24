import { ORDEM_TIPOS } from "../content/glossario";
import { contar, filtrar } from "./query";
import type { Registro } from "./types";

export interface RecorteAno {
  /** null = whole period */
  ano: number | null;
  total: number;
  porTipo: Array<{ tipo: string; n: number }>;
  /** 12 monthly counts (publication month); empty for the whole period. */
  porMes: number[];
}

/**
 * Pre-computed slices for a councillor profile. Every number comes from `contar`,
 * the same filter the linked lists use.
 */
export function recortes(registros: readonly Registro[], autor: string): RecorteAno[] {
  const deles = filtrar(registros, { autor });
  const anos = [...new Set(deles.map((r) => r.ano).filter((a): a is number => a !== null))].sort((a, b) => a - b);
  const tipos = [
    ...ORDEM_TIPOS,
    ...[...new Set(deles.map((r) => r.tipo))].filter((t) => !ORDEM_TIPOS.includes(t)),
  ];
  const fatia = (ano: number | null): RecorteAno => {
    const f = ano === null ? { autor } : { autor, ano };
    return {
      ano,
      total: contar(registros, f),
      porTipo: tipos.map((tipo) => ({ tipo, n: contar(registros, { ...f, tipo }) })).filter((x) => x.n > 0),
      porMes: ano === null ? [] : Array.from({ length: 12 }, (_, i) => contar(registros, { ...f, mes: i + 1 })),
    };
  };
  return [...anos.map(fatia), fatia(null)];
}
