import { describe, expect, it } from "vitest";
import { contar, filtrar, hrefLista, lerFiltro, paginar } from "@/lib/data/query";
import type { Registro } from "@/lib/data/types";

function reg(p: Partial<Registro> & { id: string }): Registro {
  return {
    tipo: "Requerimentos",
    titulo: `REQUERIMENTO N.º ${p.id}/2026`,
    numero: Number(p.id),
    ano: 2026,
    ementa: "",
    autoria: "",
    autores: [],
    autoresVereadores: [],
    data: "2026-01-01 10:00:00",
    link: `https://x/${p.id}`,
    ...p,
  };
}

const base: Registro[] = [
  reg({ id: "1", autoresVereadores: ["ana"], ementa: "Iluminação no Araretama" }),
  reg({ id: "2", autoresVereadores: ["ana", "beto"], ano: 2025 }),
  reg({ id: "3", tipo: "Indicacoes", autoresVereadores: ["beto"], ementa: "Buraco na rua" }),
  reg({ id: "4", autoresVereadores: [] }),
];

describe("número = lista", () => {
  const filtros = [
    {},
    { autor: "ana" },
    { autor: "beto", tipo: "Requerimentos" },
    { autor: "ana", ano: 2025 },
    { q: "araretama" },
    { q: "ILUMINACAO araretama" },
    { tipo: "Indicacoes", ano: 2026 },
  ];
  for (const f of filtros) {
    it(`contagem igual ao tamanho da lista para ${JSON.stringify(f)}`, () => {
      expect(contar(base, f)).toBe(filtrar(base, f).length);
    });
  }

  it("coautoria conta para cada coautor", () => {
    expect(contar(base, { autor: "ana" })).toBe(2);
    expect(contar(base, { autor: "beto" })).toBe(2);
    expect(contar(base, {})).toBe(4);
  });

  it("busca ignora acento e caixa", () => {
    expect(filtrar(base, { q: "iluminacao" }).map((r) => r.id)).toEqual(["1"]);
  });
});

describe("filtros vindos da URL", () => {
  const tipos = new Set(["Requerimentos", "Indicacoes"]);
  const autores = new Set(["ana", "beto"]);

  it("descarta valores inválidos", () => {
    expect(lerFiltro({ tipo: "<script>", ano: "abc", autor: "zz", pagina: "-3" }, tipos, autores)).toEqual({
      tipo: undefined,
      ano: undefined,
      autor: undefined,
      q: undefined,
      pagina: 1,
    });
  });

  it("aceita valores válidos e o href reconstrói os mesmos filtros", () => {
    const f = lerFiltro({ tipo: "Indicacoes", ano: "2026", autor: "beto", q: "rua" }, tipos, autores);
    expect(f).toMatchObject({ tipo: "Indicacoes", ano: 2026, autor: "beto", q: "rua" });
    expect(hrefLista("/proposicoes", f)).toBe("/proposicoes?tipo=Indicacoes&ano=2026&autor=beto&q=rua");
  });

  it("pagina sem perder itens", () => {
    const xs = Array.from({ length: 120 }, (_, i) => i);
    const todas = [1, 2, 3].flatMap((p) => paginar(xs, p, 50).itens);
    expect(todas).toEqual(xs);
    expect(paginar(xs, 99, 50).pagina).toBe(3);
  });
});
