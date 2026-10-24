import type { ProposicaoApi, VereadorApi } from "../camara/schema";
import { APELIDOS } from "../content/apelidos";
import type { Norma, Registro, Vereador } from "./types";

/** Lowercase, no accents, single spaces. Used for matching and search. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "REQUERIMENTO N.º 2490/2026" -> { numero: 2490, ano: 2026 } */
export function numeroAno(titulo: string): { numero: number | null; ano: number | null } {
  const m = /n\.?\s*[º°o]?\s*([\d.]+)\s*\/\s*(\d{4})/i.exec(titulo);
  if (!m || m[1] === undefined || m[2] === undefined) return { numero: null, ano: null };
  return { numero: Number(m[1].replace(/\./g, "")), ano: Number(m[2]) };
}

/** Official page id: ".../proposicoes/0/0/0/0/154351#pesquisa" -> "154351" */
export function idDoLink(link: string): string | null {
  const m = /\/(\d+)(?:#.*)?$/.exec(link);
  return m?.[1] ?? null;
}

export function separarAutores(autoria: string): string[] {
  return autoria
    .split(";")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
}

export function mapaVereadores(vereadores: readonly Pick<Vereador, "slug" | "nome">[]): Map<string, string> {
  const m = new Map(vereadores.map((v) => [normalizar(v.nome), v.slug]));
  const ativos = new Set(vereadores.map((v) => v.slug));
  for (const [slug, nomes] of Object.entries(APELIDOS)) {
    if (!ativos.has(slug)) continue;
    for (const nome of nomes) if (!m.has(normalizar(nome))) m.set(normalizar(nome), slug);
  }
  return m;
}

export function toVereador(v: VereadorApi, foto: string | null): Vereador {
  return {
    slug: slugify(v.nome),
    nome: v.nome,
    partido: v.partido,
    funcao: v.funcao,
    foto,
    fotoOrigem: v.imagem,
    link: v.link,
  };
}

export function toRegistro(p: ProposicaoApi, tipo: string, vereadores: Map<string, string>): Registro {
  const id = idDoLink(p.link);
  if (id === null) throw new Error(`Link sem id numérico: ${p.link}`);
  const autores = separarAutores(p.autoria);
  const autoresVereadores = unique(
    autores.map((a) => vereadores.get(normalizar(a))).filter((s): s is string => s !== undefined),
  );
  return {
    id,
    tipo,
    titulo: p.titulo.trim(),
    ...numeroAno(p.titulo),
    ementa: p.ementa.replace(/\r\n?/g, "\n").trim(),
    autoria: p.autoria.trim(),
    autores,
    autoresVereadores,
    data: p.data,
    link: p.link.replace(/#.*$/, ""),
  };
}

/**
 * Laws carry no authorship field; the ementa often says
 * "(Projeto de Lei n° 148/2026, de autoria do Vereador Professor Felipe Guimarães)".
 * This is a text match, published as derived information.
 */
export function autoriaCitada(ementa: string, vereadores: readonly Pick<Vereador, "slug" | "nome">[]): string[] {
  const texto = normalizar(ementa);
  const trecho = /de autoria d[oa]s? (?:vereador|vereadora|vereadores|vereadoras)\b(.*)/.exec(texto);
  if (!trecho?.[1]) return [];
  const resto = trecho[1];
  return vereadores.filter((v) => resto.includes(normalizar(v.nome))).map((v) => v.slug);
}

export function toNorma(p: ProposicaoApi, tipo: string, vereadores: readonly Vereador[]): Norma {
  const base = toRegistro(p, tipo, mapaVereadores(vereadores));
  return { ...base, autoriaCitadaNaEmenta: autoriaCitada(base.ementa, vereadores) };
}

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}
