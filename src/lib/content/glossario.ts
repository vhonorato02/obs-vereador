// Plain-language explanations written by the project, not official definitions.
// Official rules: Regimento Interno da Câmara and Lei Orgânica do Município.

export interface Verbete {
  contract: string;
  curto: string;
  explicacao: string;
}

export const GLOSSARIO: Verbete[] = [
  {
    contract: "Requerimentos",
    curto: "Pede informação ou providência",
    explicacao:
      "Pedido formal de um ou mais vereadores, em geral de informações ou providências a órgãos públicos ou empresas. É um instrumento rotineiro do mandato.",
  },
  {
    contract: "Indicacoes",
    curto: "Sugestão à Prefeitura, que não é obrigada a atender",
    explicacao:
      "Sugestão do vereador ao Poder Executivo para que faça uma obra ou preste um serviço (por exemplo, tapar um buraco). Não obriga a Prefeitura a atender.",
  },
  {
    contract: "Mocoes",
    curto: "Aplauso, apoio, pesar ou repúdio",
    explicacao: "Manifestação de aplauso, apoio, pesar, protesto ou repúdio sobre um fato ou uma pessoa.",
  },
  {
    contract: "Emendas",
    curto: "Muda um projeto que está em andamento",
    explicacao: "Proposta para alterar, acrescentar ou retirar parte de um projeto que já está em tramitação.",
  },
  {
    contract: "Projetos-de-Lei-Ordinaria",
    curto: "Pode virar lei municipal se aprovado",
    explicacao:
      "Proposta de lei municipal. Pode ser apresentada por vereadores ou pelo Poder Executivo. Só vira lei se for aprovada pela Câmara e sancionada (ou promulgada).",
  },
  {
    contract: "Projetos-de-Lei-Complementar",
    curto: "Lei com quórum maior, para temas da Lei Orgânica",
    explicacao:
      "Proposta de lei sobre temas que a Lei Orgânica reserva a esse tipo de norma, aprovada com quórum maior que o de uma lei ordinária.",
  },
  {
    contract: "Projetos-de-Resolucao",
    curto: "Trata do funcionamento da própria Câmara",
    explicacao: "Proposta que trata de assuntos internos da própria Câmara, como seu funcionamento e organização.",
  },
  {
    contract: "Projetos-de-Decreto-Legislativo",
    curto: "Por exemplo, títulos honoríficos",
    explicacao:
      "Proposta sobre matéria de competência da Câmara com efeito fora dela, como a concessão de títulos honoríficos.",
  },
  {
    contract: "Indicacoes-de-Projetos-de-Lei",
    curto: "Sugere ao Executivo um projeto de iniciativa dele",
    explicacao: "Sugestão ao Poder Executivo para que envie um projeto de lei sobre um tema que é de iniciativa dele.",
  },
  {
    contract: "Vetos",
    curto: "Recusa do prefeito a um projeto aprovado",
    explicacao: "Recusa, total ou parcial, do prefeito a um projeto aprovado pela Câmara. A Câmara pode manter ou derrubar o veto.",
  },
  {
    contract: "Propostas-de-Emenda-a-Lei-Organica",
    curto: "Altera a Lei Orgânica do município",
    explicacao: "Proposta de alteração da Lei Orgânica, a \"constituição\" do município.",
  },
];

export function verbete(contract: string): Verbete | undefined {
  return GLOSSARIO.find((v) => v.contract === contract);
}

/** Order used in profiles: the most common instruments of a mandate first, laws next. */
export const ORDEM_TIPOS = [
  "Projetos-de-Lei-Ordinaria",
  "Projetos-de-Lei-Complementar",
  "Emendas",
  "Requerimentos",
  "Indicacoes",
  "Indicacoes-de-Projetos-de-Lei",
  "Mocoes",
  "Projetos-de-Resolucao",
  "Projetos-de-Decreto-Legislativo",
];
