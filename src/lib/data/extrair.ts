import { normalizar, slugify } from "./derive";

/** Neighbourhoods named in the summary text ("no bairro Araretama", "distrito de Moreira César"). Derived. */
const RE_BAIRRO =
  /\b(?:bairros?|distrito de)\s+((?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ'’.-]*|I{1,3}|IV|V)(?:\s+(?:d[aeo]s?|e)?\s*(?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ'’.-]*|I{1,3}|IV|V)){0,4})/g;

const NAO_BAIRRO = new Set(["de", "do", "da", "dos", "das"]);

export function bairrosDe(texto: string): string[] {
  const achados = new Map<string, string>();
  for (const m of texto.matchAll(RE_BAIRRO)) {
    const bruto = m[1];
    if (!bruto) continue;
    const prefixo = /distrito de/i.test(m[0]) ? "Distrito de " : "";
    // Cut at the end of a sentence and split "Morumbi I e Morumbi II" into two places.
    const frase = bruto.split(/\.(?:\s|$)/)[0] ?? "";
    for (const parte of frase.split(/\s+e\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/)) {
      const nome = parte
        .replace(/[.,;:]+$/, "")
        .replace(/\s+(?:e|d[aeo]s?)$/i, "")
        .replace(/^Nossa Sra\.?/i, "Nossa Senhora")
        .trim();
      if (nome.length < 3 || NAO_BAIRRO.has(nome.toLowerCase())) continue;
      const canon = canonico(`${prefixo}${nome}`);
      achados.set(slugify(canon), canon);
    }
  }
  return [...achados.values()];
}

/** Title-case with pt-BR particles in lower case; merges spelling variants by slug. */
function canonico(nome: string): string {
  return nome
    .split(/\s+/)
    .map((p, i) => {
      const b = p.toLocaleLowerCase("pt-BR");
      if (i > 0 && ["de", "do", "da", "dos", "das", "e"].includes(b)) return b;
      if (/^(i{1,3}|iv|v)$/i.test(p)) return p.toUpperCase();
      return b.charAt(0).toLocaleUpperCase("pt-BR") + b.slice(1);
    })
    .join(" ");
}

/** Who a request is addressed to, from the opening words of the summary. Derived. */
export const DESTINOS = [
  { slug: "prefeitura", nome: "Prefeitura", re: /\b(executivo|prefeit\w*|secretari\w*|departament\w*|administracao municipal|municipalidade)\b/ },
  { slug: "edp", nome: "EDP (energia)", re: /\bedp\b|bandeirante energia|energia eletrica/ },
  { slug: "sabesp", nome: "Sabesp (água e esgoto)", re: /\bsabesp\b|companhia de saneamento/ },
  { slug: "der", nome: "DER (rodovias estaduais)", re: /\bder\b|departamento de estradas de rodagem/ },
  { slug: "onibus", nome: "Viva Pinda (ônibus)", re: /viva pinda/ },
  { slug: "mesa", nome: "Mesa Diretora da Câmara", re: /mesa diretora/ },
  { slug: "estado-uniao", nome: "Governo do Estado ou federal", re: /\b(governador|governo do estado|deputad\w*|ministr\w*|presidente da republica|vice-presidente da republica|senador\w*|secretaria estadual|estado de sao paulo)\b/ },
] as const;

export type Destino = (typeof DESTINOS)[number]["slug"] | "outros";

export function destinoDe(ementa: string, tipo = ""): Destino {
  // Only the opening of the text names the addressee.
  const inicio = normalizar(ementa.slice(0, 160));
  const especificos = DESTINOS.filter((d) => d.slug !== "prefeitura");
  for (const d of especificos) if (d.re.test(inicio)) return d.slug;
  // An indicação is, by definition, a suggestion to the Executive.
  if (DESTINOS[0].re.test(inicio) || /^indico\b/.test(inicio) || tipo.startsWith("Indicacoes")) return "prefeitura";
  return "outros";
}

/** "(Projeto de Lei n° 148/2026, de autoria …)" in a law's summary -> the bill it came from. */
export function projetoDeOrigem(ementa: string): { tipo: string; numero: number; ano: number } | null {
  const m =
    /projeto de (lei complementar|lei|decreto legislativo|resolucao|emenda a lei organica)\s*n?\s*[.º°o]*\s*([\d.]+)\s*\/\s*(\d{4})/.exec(
      normalizar(ementa),
    );
  if (!m?.[1] || !m[2] || !m[3]) return null;
  const tipo = {
    "lei complementar": "Projetos-de-Lei-Complementar",
    lei: "Projetos-de-Lei-Ordinaria",
    "decreto legislativo": "Projetos-de-Decreto-Legislativo",
    resolucao: "Projetos-de-Resolucao",
    "emenda a lei organica": "Propostas-de-Emenda-a-Lei-Organica",
  }[m[1]];
  if (!tipo) return null;
  return { tipo, numero: Number(m[2].replace(/\./g, "")), ano: Number(m[3]) };
}

/** Four groups for part-to-whole charts. Colour slots are fixed per group. */
export const GRUPOS = [
  { slug: "pedidos", nome: "Pedidos", descricao: "Indicações e requerimentos", tipos: ["Indicacoes", "Requerimentos", "Indicacoes-de-Projetos-de-Lei"] },
  { slug: "projetos", nome: "Projetos de lei", descricao: "Projetos, emendas e vetos", tipos: ["Projetos-de-Lei-Ordinaria", "Projetos-de-Lei-Complementar", "Projetos-de-Lei-de-Iniciativa-Popular", "Propostas-de-Emenda-a-Lei-Organica", "Emendas", "Vetos"] },
  { slug: "homenagens", nome: "Homenagens", descricao: "Moções e decretos legislativos", tipos: ["Mocoes", "Projetos-de-Decreto-Legislativo"] },
  { slug: "camara", nome: "Funcionamento da Câmara", descricao: "Resoluções, relatórios e representações", tipos: ["Projetos-de-Resolucao", "Relatorio-Final---Comissao-de-Assuntos-Relevantes", "Representacao-ao-Conselho-de-Etica-e-Decoro-Parlamentar"] },
] as const;

export type Grupo = (typeof GRUPOS)[number]["slug"];

export function grupoDe(tipo: string): Grupo {
  return GRUPOS.find((g) => (g.tipos as readonly string[]).includes(tipo))?.slug ?? "camara";
}
