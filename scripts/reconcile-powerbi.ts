/**
 * Compares the API-derived counts (public/dados/proposicoes.json) with the manual
 * Power BI baseline of 24/08/2026 (docs/research/power-bi.md). Prints a Markdown table.
 * Usage: tsx scripts/reconcile-powerbi.ts <proposicoes.json>
 */
import { readFileSync } from "node:fs";
import type { Registro } from "../src/lib/data/types";

const TIPOS: Record<string, string> = {
  Moç: "Mocoes",
  Emd: "Emendas",
  Ind: "Indicacoes",
  PLO: "Projetos-de-Lei-Ordinaria",
  PR: "Projetos-de-Resolucao",
  Req: "Requerimentos",
  PDL: "Projetos-de-Decreto-Legislativo",
};
// Power BI name -> current parliamentary name slug.
const NOMES: Record<string, string> = {
  "Ana Paula Goffi": "ana-paula-goffi",
  "Carlos Moura - Magrão": "carlos-moura-magrao",
  "Felipe César Filho - FC": "felipinho-cesar",
  "Gari Abençoado": "gari-abencoado",
  "Gilson Nagrin": "gilson-nagrin",
  "Marco Mayor": "marco-mayor",
  Norbertinho: "norberto-moraes",
  "Professor Everton": "professor-everton",
  "Professor Felipe Guimarães": "professor-felipe-guimaraes",
  "Renato Cebola": "renato-cebola",
  "Rogério Ramos": "rogerio-ramos",
};
// Sums from docs/research/power-bi.md (2025 full year; 2026 until 24/08).
const PBI_SOMA: Record<number, Record<string, number>> = {
  2025: { Moç: 437, Emd: 624, Ind: 4499, PLO: 347, PR: 54, Req: 3146, PDL: 38 },
  2026: { Moç: 226, Emd: 68, Ind: 3773, PLO: 182, PR: 16, Req: 1964, PDL: 13 },
};

const regs = JSON.parse(readFileSync(process.argv[2] ?? "public/dados/proposicoes.json", "utf8")) as Registro[];
const slugs = new Set(Object.values(NOMES));
const linhas: string[] = ["| Ano | Tipo | Power BI (soma por vereador) | API: soma por vereador | API: documentos distintos |", "|---|---|---:|---:|---:|"];
for (const ano of [2025, 2026]) {
  for (const [sig, tipo] of Object.entries(TIPOS)) {
    const sel = regs.filter(
      (r) => r.tipo === tipo && r.ano === ano && (ano === 2025 || r.data.slice(0, 10) <= "2026-08-24"),
    );
    const soma = sel.reduce((acc, r) => acc + r.autoresVereadores.filter((s) => slugs.has(s)).length, 0);
    const distintos = sel.filter((r) => r.autoresVereadores.some((s) => slugs.has(s))).length;
    linhas.push(`| ${ano}${ano === 2026 ? " (até 24/08)" : ""} | ${sig} | ${PBI_SOMA[ano]?.[sig] ?? "—"} | ${soma} | ${distintos} |`);
  }
}
console.log(linhas.join("\n"));
