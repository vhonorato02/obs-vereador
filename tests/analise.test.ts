import { describe, expect, it } from "vitest";
import { meses, pares, porBairro, porGrupo, porMes, porTema } from "@/lib/data/analise";
import { bairrosDe, destinoDe, grupoDe, projetoDeOrigem } from "@/lib/data/extrair";
import { contar } from "@/lib/data/query";
import { temasDe } from "@/lib/data/temas";
import type { Registro } from "@/lib/data/types";

let seq = 0;
function reg(p: Partial<Registro>): Registro {
  seq++;
  return {
    id: String(seq), tipo: "Indicacoes", titulo: `INDICAÇÃO N.º ${seq}/2026`, numero: seq, ano: 2026, ementa: "",
    autoria: "", autores: [], autoresVereadores: [], data: "2026-03-10 10:00:00", link: `https://x/${seq}`, ...p,
  };
}

describe("extratores (informação derivada)", () => {
  it("encontra bairros e separa listas", () => {
    expect(bairrosDe("Troca de lâmpadas na Rua X, no bairro Araretama.")).toEqual(["Araretama"]);
    expect(bairrosDe("nos bairros Morumbi I e Morumbi II")).toEqual(["Morumbi I", "Morumbi II"]);
    expect(bairrosDe("no distrito de Moreira César. A população pede")).toEqual(["Distrito de Moreira César"]);
    expect(bairrosDe("Pede melhorias na cidade.")).toEqual([]);
  });

  it("classifica assuntos por regras", () => {
    expect(temasDe("Indico a troca de lâmpadas queimadas")).toContain("iluminacao");
    expect(temasDe("roçada na praça do bairro")).toEqual(expect.arrayContaining(["limpeza-e-meio-ambiente", "esporte-lazer-cultura"]));
    expect(temasDe("Requerimento ao Professor Everton")).not.toContain("educacao");
  });

  it("identifica a quem o pedido se dirige", () => {
    expect(destinoDe("à Sabesp, solicitando providências", "Requerimentos")).toBe("sabesp");
    expect(destinoDe("à EDP São Paulo, requeiro estudo", "Requerimentos")).toBe("edp");
    expect(destinoDe("A colocação de um novo portão no campo", "Indicacoes")).toBe("prefeitura");
  });

  it("acha o projeto de origem na ementa da lei", () => {
    expect(projetoDeOrigem("INSTITUI... (Projeto de Lei n° 148/2026, de autoria do Vereador X).")).toEqual({
      tipo: "Projetos-de-Lei-Ordinaria", numero: 148, ano: 2026,
    });
    expect(projetoDeOrigem("(Projeto de Decreto Legislativo n° 01/2025, de autoria...)")?.tipo).toBe("Projetos-de-Decreto-Legislativo");
    expect(projetoDeOrigem("Dispõe sobre crédito.")).toBeNull();
  });

  it("agrupa tipos", () => {
    expect(grupoDe("Requerimentos")).toBe("pedidos");
    expect(grupoDe("Mocoes")).toBe("homenagens");
    expect(grupoDe("Projetos-de-Lei-Ordinaria")).toBe("projetos");
  });
});

describe("agregados: cada número bate com a lista do mesmo filtro", () => {
  const regs = [
    reg({ ementa: "lâmpadas no bairro Araretama", autoresVereadores: ["ana"] }),
    reg({ ementa: "asfalto no bairro Araretama", autoresVereadores: ["ana", "beto"] }),
    reg({ ementa: "roçada no bairro Araretama", autoresVereadores: ["beto"], data: "2026-04-02 09:00:00" }),
    reg({ tipo: "Mocoes", ementa: "aplauso ao time", autoresVereadores: ["ana"] }),
    reg({ tipo: "Projetos-de-Lei-Ordinaria", ementa: "institui o dia do ciclista", autoresVereadores: ["beto"] }),
  ];

  it("por grupo, tema e bairro", () => {
    for (const c of [...porGrupo(regs), ...porTema(regs), ...porBairro(regs, {}, 1)]) {
      expect(c.n).toBe(contar(regs, c.filtro));
    }
    expect(porBairro(regs, {}, 1)[0]).toMatchObject({ nome: "Araretama", n: 3 });
  });

  it("por mês soma o total", () => {
    const m = porMes(regs, meses("2026-01-01", "2026-06-30"));
    expect(m).toHaveLength(6);
    expect(m.reduce((a, x) => a + x.total, 0)).toBe(regs.length);
    expect(m[2]?.porGrupo.pedidos).toBe(2);
  });

  it("pares de coautoria", () => {
    expect(pares(regs)).toEqual([{ a: "ana", b: "beto", n: 1 }]);
  });
});

describe("colunas mensais", () => {
  it("cada coluna bate com o filtro de mês de publicação", () => {
    const regs = [
      reg({ data: "2026-01-05 10:00:00", ano: 2025 }),
      reg({ data: "2026-01-20 10:00:00" }),
      reg({ data: "2026-02-01 10:00:00" }),
    ];
    for (const m of porMes(regs, meses("2026-01-01", "2026-02-28"))) {
      expect(m.total).toBe(contar(regs, { pub: m.mes }));
    }
  });
});
