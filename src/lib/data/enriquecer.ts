import { slugify } from "./derive";
import { bairrosDe, destinoDe, grupoDe, type Destino, type Grupo } from "./extrair";
import { temasDe } from "./temas";
import type { Registro } from "./types";

export interface Derivados {
  temas: string[];
  bairros: string[];
  bairrosSlug: string[];
  destino: Destino | null;
  grupo: Grupo;
}

const cache = new Map<string, Derivados>();

/** Derived fields (rule-based, labelled as such on the site). Memoised per record. */
export function derivados(r: Registro): Derivados {
  const k = `${r.tipo}:${r.id}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const bairros = bairrosDe(r.ementa);
  const grupo = grupoDe(r.tipo);
  const v: Derivados = {
    temas: temasDe(`${r.ementa}`),
    bairros,
    bairrosSlug: bairros.map(slugify),
    destino: grupo === "pedidos" ? destinoDe(r.ementa, r.tipo) : null,
    grupo,
  };
  cache.set(k, v);
  return v;
}
