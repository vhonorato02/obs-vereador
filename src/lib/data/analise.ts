import { slugify } from "./derive";
import { derivados } from "./enriquecer";
import { DESTINOS, GRUPOS, projetoDeOrigem, type Grupo } from "./extrair";
import { contar, type Filtro } from "./query";
import { TEMAS } from "./temas";
import type { Dataset, Norma, Registro } from "./types";

export const MIN_BAIRRO = 3;
const PROJETOS = ["Projetos-de-Lei-Ordinaria", "Projetos-de-Lei-Complementar"];

export interface Conta {
  slug: string;
  nome: string;
  n: number;
  filtro: Filtro;
}

export interface MesConta {
  mes: string; // YYYY-MM
  total: number;
  porGrupo: Record<Grupo, number>;
}

export interface Par {
  a: string;
  b: string;
  n: number;
}

export interface ProjetoLei {
  projeto: Registro;
  lei: Norma;
}

/** Months from the start of the scope to the collection month, inclusive. */
export function meses(inicio: string, fim: string): string[] {
  const out: string[] = [];
  let [a, m] = inicio.slice(0, 7).split("-").map(Number) as [number, number];
  const [fa, fm] = fim.slice(0, 7).split("-").map(Number) as [number, number];
  while (a < fa || (a === fa && m <= fm)) {
    out.push(`${a}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      a++;
    }
  }
  return out;
}

function vazioGrupo(): Record<Grupo, number> {
  return { pedidos: 0, projetos: 0, homenagens: 0, camara: 0 };
}

export function porMes(registros: readonly Registro[], lista: string[]): MesConta[] {
  const idx = new Map(lista.map((m, i) => [m, i]));
  const out = lista.map((mes) => ({ mes, total: 0, porGrupo: vazioGrupo() }));
  for (const r of registros) {
    const i = idx.get(r.data.slice(0, 7));
    if (i === undefined) continue;
    const alvo = out[i];
    if (!alvo) continue;
    alvo.total++;
    alvo.porGrupo[derivados(r).grupo]++;
  }
  return out;
}

export function porGrupo(registros: readonly Registro[], base: Filtro = {}): Conta[] {
  return GRUPOS.map((g) => ({ slug: g.slug, nome: g.nome, n: contar(registros, { ...base, grupo: g.slug }), filtro: { ...base, grupo: g.slug } }));
}

export function porTema(registros: readonly Registro[], base: Filtro = {}): Conta[] {
  return TEMAS.map((t) => ({ slug: t.slug, nome: t.nome, n: contar(registros, { ...base, tema: t.slug }), filtro: { ...base, tema: t.slug } }))
    .filter((c) => c.n > 0)
    .sort((x, y) => y.n - x.n || x.nome.localeCompare(y.nome, "pt-BR"));
}

export function porBairro(registros: readonly Registro[], base: Filtro = {}, minimo = MIN_BAIRRO): Conta[] {
  const nomes = new Map<string, string>();
  const cont = new Map<string, number>();
  for (const r of registros) {
    const dv = derivados(r);
    dv.bairros.forEach((nome, i) => {
      const s = dv.bairrosSlug[i] ?? slugify(nome);
      if (!nomes.has(s)) nomes.set(s, nome);
      cont.set(s, (cont.get(s) ?? 0) + 1);
    });
  }
  return [...cont.entries()]
    .filter(([, n]) => n >= minimo)
    .map(([slug, n]) => ({ slug, nome: nomes.get(slug) ?? slug, n, filtro: { ...base, bairro: slug } }))
    .sort((x, y) => y.n - x.n || x.nome.localeCompare(y.nome, "pt-BR"));
}

export function porDestino(registros: readonly Registro[]): Array<{ slug: string; nome: string; n: number }> {
  const cont = new Map<string, number>();
  for (const r of registros) {
    const d = derivados(r).destino;
    if (d) cont.set(d, (cont.get(d) ?? 0) + 1);
  }
  return [...DESTINOS.map((d) => ({ slug: d.slug as string, nome: d.nome as string })), { slug: "outros", nome: "Outros" }]
    .map((d) => ({ ...d, n: cont.get(d.slug) ?? 0 }))
    .filter((d) => d.n > 0);
}

/** Co-authorship among sitting councillors: one edge per pair, weight = shared propositions. */
export function pares(registros: readonly Registro[]): Par[] {
  const cont = new Map<string, number>();
  for (const r of registros) {
    const vs = [...r.autoresVereadores].sort();
    for (let i = 0; i < vs.length; i++)
      for (let j = i + 1; j < vs.length; j++) {
        const k = `${vs[i]}|${vs[j]}`;
        cont.set(k, (cont.get(k) ?? 0) + 1);
      }
  }
  return [...cont.entries()].map(([k, n]) => {
    const [a = "", b = ""] = k.split("|");
    return { a, b, n };
  });
}

/** Bills whose number is cited in a law's summary ("Projeto de Lei n° 148/2026"). Derived. */
export function projetosQueViraramLei(d: Dataset): ProjetoLei[] {
  const porChave = new Map(d.proposicoes.map((p) => [`${p.tipo}:${p.numero}/${p.ano}`, p]));
  const out: ProjetoLei[] = [];
  for (const lei of d.normas) {
    const o = projetoDeOrigem(lei.ementa);
    if (!o) continue;
    const projeto = porChave.get(`${o.tipo}:${o.numero}/${o.ano}`);
    if (projeto) out.push({ projeto, lei });
  }
  return out;
}

export interface Funil {
  autor: "vereadores" | "executivo" | "outros";
  apresentados: number;
  viraramLei: number;
}

export function funilLeis(d: Dataset, viraram: readonly ProjetoLei[]): Funil[] {
  const quem = (r: Registro): Funil["autor"] =>
    r.autoresVereadores.length > 0 ? "vereadores" : /poder executivo/i.test(r.autoria) ? "executivo" : "outros";
  const proj = d.proposicoes.filter((p) => PROJETOS.includes(p.tipo));
  const ids = new Set(viraram.filter((v) => PROJETOS.includes(v.projeto.tipo)).map((v) => `${v.projeto.tipo}:${v.projeto.id}`));
  return (["vereadores", "executivo"] as const).map((autor) => {
    const deles = proj.filter((p) => quem(p) === autor);
    return { autor, apresentados: deles.length, viraramLei: deles.filter((p) => ids.has(`${p.tipo}:${p.id}`)).length };
  });
}

export function projetosDe(d: Dataset, slug: string): Registro[] {
  return d.proposicoes.filter((p) => PROJETOS.includes(p.tipo) && p.autoresVereadores.includes(slug));
}

export function percent(parte: number, todo: number): number {
  return todo === 0 ? 0 : Math.round((parte / todo) * 100);
}

/** Percentage with one decimal, for small shares in charts (0.4% instead of 0%). */
export function percent1(parte: number, todo: number): number {
  return todo === 0 ? 0 : Math.round((parte / todo) * 1000) / 10;
}
