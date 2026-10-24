// Normalized dataset produced by scripts/collect.ts and read by the site.

export interface Vereador {
  slug: string;
  nome: string;
  partido: string;
  funcao: string;
  /** Path under /public when the photo was downloaded, otherwise null. */
  foto: string | null;
  fotoOrigem: string;
  link: string;
}

export interface Tipo {
  contract: string;
  titulo: string;
  grupo: "proposicao" | "norma";
}

export interface Registro {
  /** Numeric id taken from the official URL. */
  id: string;
  tipo: string;
  titulo: string;
  numero: number | null;
  ano: number | null;
  ementa: string;
  /** Authorship text exactly as published. */
  autoria: string;
  /** Names split from `autoria` (separator ";"). */
  autores: string[];
  /** Slugs of current vereadores found in `autores`. */
  autoresVereadores: string[];
  /** Publication date/time as published (America/Sao_Paulo, no offset). */
  data: string;
  link: string;
}

export interface Norma extends Registro {
  /**
   * Derived, not official: vereador slugs found in the ementa text
   * ("de autoria do Vereador ..."). Empty when the text does not say.
   */
  autoriaCitadaNaEmenta: string[];
}

export interface Execucao {
  coletadoEm: string;
  modo: "completo" | "incremental" | "amostra";
  requisicoes: number;
  duracaoMs: number;
  avisos: string[];
}

export interface Dataset {
  fonte: {
    nome: string;
    url: string;
    termos: string;
  };
  escopo: { inicio: string; descricao: string };
  execucao: Execucao;
  vereadores: Vereador[];
  tipos: Tipo[];
  proposicoes: Registro[];
  normas: Norma[];
}
