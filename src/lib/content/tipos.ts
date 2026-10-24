// Singular, sentence-case names used in the interface ("Requerimento 2398/2026").

export const SINGULAR: Record<string, string> = {
  Requerimentos: "Requerimento",
  Indicacoes: "Indicação",
  "Indicacoes-de-Projetos-de-Lei": "Indicação de projeto de lei",
  Mocoes: "Moção",
  Emendas: "Emenda",
  "Projetos-de-Lei-Ordinaria": "Projeto de lei",
  "Projetos-de-Lei-Complementar": "Projeto de lei complementar",
  "Projetos-de-Lei-de-Iniciativa-Popular": "Projeto de lei de iniciativa popular",
  "Projetos-de-Resolucao": "Projeto de resolução",
  "Projetos-de-Decreto-Legislativo": "Projeto de decreto legislativo",
  "Propostas-de-Emenda-a-Lei-Organica": "Proposta de emenda à Lei Orgânica",
  "Relatorio-Final---Comissao-de-Assuntos-Relevantes": "Relatório final de comissão",
  "Representacao-ao-Conselho-de-Etica-e-Decoro-Parlamentar": "Representação ao Conselho de Ética",
  Vetos: "Veto",
  "Leis-Ordinarias": "Lei",
  "Leis-Complementares": "Lei complementar",
  "Emendas-a-Lei-Organica": "Emenda à Lei Orgânica",
  Resolucoes: "Resolução",
  "Decretos-Legislativos": "Decreto legislativo",
};

/** Short plural labels for chips and charts. */
export const CURTO: Record<string, string> = {
  Requerimentos: "Requerimentos",
  Indicacoes: "Indicações",
  "Indicacoes-de-Projetos-de-Lei": "Indicações de PL",
  Mocoes: "Moções",
  Emendas: "Emendas",
  "Projetos-de-Lei-Ordinaria": "Projetos de lei",
  "Projetos-de-Lei-Complementar": "Leis complementares (projetos)",
  "Projetos-de-Resolucao": "Projetos de resolução",
  "Projetos-de-Decreto-Legislativo": "Decretos legislativos (projetos)",
  "Propostas-de-Emenda-a-Lei-Organica": "Emendas à Lei Orgânica",
  Vetos: "Vetos",
  "Leis-Ordinarias": "Leis",
  "Leis-Complementares": "Leis complementares",
  "Emendas-a-Lei-Organica": "Emendas à Lei Orgânica",
  Resolucoes: "Resoluções",
  "Decretos-Legislativos": "Decretos legislativos",
};

export function nomeItem(tipo: string, numero: number | null, ano: number | null, tituloOficial: string): string {
  const s = SINGULAR[tipo];
  if (!s || numero === null || ano === null) return tituloOficial;
  return `${s} ${numero}/${ano}`;
}

/**
 * Some ementas are published in all caps. They are shown in sentence case for
 * readability; the official text is one tap away.
 */
export function legivel(texto: string): string {
  const letras = texto.replace(/[^\p{L}]/gu, "");
  if (letras.length < 12) return texto;
  const maiusculas = letras.replace(/[^\p{Lu}]/gu, "").length;
  if (maiusculas / letras.length < 0.8) return texto;
  const baixo = texto.toLocaleLowerCase("pt-BR");
  return baixo.replace(/(^\s*\p{L}|[.!?]\s+\p{L}|\n\s*\(?\p{L})/gu, (m) => m.toLocaleUpperCase("pt-BR"));
}
