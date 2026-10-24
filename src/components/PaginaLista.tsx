import Link from "next/link";
import { Fonte } from "@/components/Fonte";
import { ListaRegistros } from "@/components/ListaRegistros";
import { tipoTitulo } from "@/lib/data/load";
import { filtrar, hrefLista, lerFiltro, ordenar, paginar } from "@/lib/data/query";
import type { Dataset, Registro } from "@/lib/data/types";
import { n } from "@/lib/format";

const POR_PAGINA = 50;

export function PaginaLista({
  d,
  base,
  titulo,
  registros,
  grupo,
  searchParams,
  intro,
}: {
  d: Dataset;
  base: "/proposicoes" | "/normas";
  titulo: string;
  registros: readonly Registro[];
  grupo: "proposicao" | "norma";
  searchParams: Record<string, string | string[] | undefined>;
  intro: React.ReactNode;
}) {
  const tipos = d.tipos.filter((t) => t.grupo === grupo);
  const f = lerFiltro(
    searchParams,
    new Set(tipos.map((t) => t.contract)),
    new Set(d.vereadores.map((v) => v.slug)),
  );
  const resultado = ordenar(filtrar(registros, f));
  const pag = paginar(resultado, f.pagina, POR_PAGINA);
  const anos = [...new Set(registros.map((r) => r.ano).filter((a): a is number => a !== null))].sort((a, b) => b - a);
  const autorNome = d.vereadores.find((v) => v.slug === f.autor)?.nome;

  const descricao = [
    f.tipo ? tipoTitulo(d, f.tipo) : null,
    f.ano ? `de ${f.ano}` : null,
    autorNome ? `com autoria ou coautoria de ${autorNome}` : null,
    f.q ? `contendo “${f.q}”` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <h1>{titulo}</h1>
      {intro}
      <form className="filtros" method="get" action={base} role="search">
        <div>
          <label htmlFor="q">Buscar no texto</label>
          <input id="q" name="q" type="search" defaultValue={f.q ?? ""} placeholder="ex.: Araretama, iluminação, 2398" />
        </div>
        <div>
          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" defaultValue={f.tipo ?? ""}>
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t.contract} value={t.contract}>
                {t.titulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ano">Ano do número</label>
          <select id="ano" name="ano" defaultValue={f.ano ? String(f.ano) : ""}>
            <option value="">Todos</option>
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        {grupo === "proposicao" ? (
          <div>
            <label htmlFor="autor">Vereador</label>
            <select id="autor" name="autor" defaultValue={f.autor ?? ""}>
              <option value="">Todos</option>
              {d.vereadores.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.nome}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div />
        )}
        <div>
          <button type="submit">Filtrar</button>
        </div>
      </form>

      <p aria-live="polite">
        <strong>{n(pag.total)}</strong> {pag.total === 1 ? "resultado" : "resultados"}
        {descricao ? ` · ${descricao}` : ""}.{" "}
        {(f.tipo || f.ano || f.autor || f.q) && <Link href={base}>Limpar filtros</Link>}
      </p>

      <ListaRegistros itens={pag.itens} vereadores={d.vereadores} titulos={(c) => tipoTitulo(d, c)} />

      {pag.totalPaginas > 1 && (
        <nav className="paginacao" aria-label="Paginação">
          {pag.pagina > 1 && <Link href={hrefLista(base, f, pag.pagina - 1)}>← Anterior</Link>}
          <span>
            Página {pag.pagina} de {pag.totalPaginas}
          </span>
          {pag.pagina < pag.totalPaginas && <Link href={hrefLista(base, f, pag.pagina + 1)}>Próxima →</Link>}
        </nav>
      )}
      <Fonte d={d} />
    </>
  );
}
