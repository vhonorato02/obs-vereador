import { normalizar } from "./derive";
import type { Registro } from "./types";

export interface Filtro {
  tipo?: string;
  ano?: number;
  autor?: string;
  q?: string;
}

/**
 * The single filter used both for the lists and for every count shown on the site,
 * so a published number always equals the length of the list it links to.
 */
export function filtrar<T extends Registro>(registros: readonly T[], f: Filtro): T[] {
  const termos = f.q ? normalizar(f.q).split(" ").filter(Boolean) : [];
  return registros.filter((r) => {
    if (f.tipo && r.tipo !== f.tipo) return false;
    if (f.ano !== undefined && r.ano !== f.ano) return false;
    if (f.autor && !r.autoresVereadores.includes(f.autor)) return false;
    if (termos.length > 0) {
      const alvo = normalizar(`${r.titulo} ${r.ementa} ${r.autoria}`);
      if (!termos.every((t) => alvo.includes(t))) return false;
    }
    return true;
  });
}

export function contar(registros: readonly Registro[], f: Filtro): number {
  return filtrar(registros, f).length;
}

/** Newest first; ties broken by number, then id, so the order is stable. */
export function ordenar<T extends Registro>(registros: readonly T[]): T[] {
  return [...registros].sort(
    (a, b) =>
      b.data.localeCompare(a.data) ||
      (b.numero ?? 0) - (a.numero ?? 0) ||
      b.id.localeCompare(a.id),
  );
}

export function paginar<T>(xs: readonly T[], pagina: number, porPagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(xs.length / porPagina));
  const atual = Math.min(Math.max(1, pagina), totalPaginas);
  return {
    itens: xs.slice((atual - 1) * porPagina, atual * porPagina),
    pagina: atual,
    totalPaginas,
    total: xs.length,
  };
}

export function hrefLista(base: "/proposicoes" | "/normas", f: Filtro, pagina?: number): string {
  const p = new URLSearchParams();
  if (f.tipo) p.set("tipo", f.tipo);
  if (f.ano !== undefined) p.set("ano", String(f.ano));
  if (f.autor) p.set("autor", f.autor);
  if (f.q) p.set("q", f.q);
  if (pagina && pagina > 1) p.set("pagina", String(pagina));
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

/** Parse untrusted query-string values into a Filtro; invalid values are dropped. */
export function lerFiltro(
  sp: Record<string, string | string[] | undefined>,
  tiposValidos: ReadonlySet<string>,
  autoresValidos: ReadonlySet<string>,
): Filtro & { pagina: number } {
  const um = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const tipo = um("tipo");
  const ano = Number(um("ano"));
  const autor = um("autor");
  const q = um("q")?.slice(0, 120).trim();
  const pagina = Number(um("pagina"));
  return {
    tipo: tipo && tiposValidos.has(tipo) ? tipo : undefined,
    ano: Number.isInteger(ano) && ano >= 1900 && ano <= 2100 ? ano : undefined,
    autor: autor && autoresValidos.has(autor) ? autor : undefined,
    q: q ? q : undefined,
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
}
