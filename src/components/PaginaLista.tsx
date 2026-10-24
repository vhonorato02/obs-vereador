import Link from "next/link";
import { Fonte } from "@/components/Fonte";
import { Icon } from "@/components/Icon";
import { Feed } from "@/components/Item";
import { Avatar } from "@/components/Rosto";
import { CURTO } from "@/lib/content/tipos";
import { GRUPOS } from "@/lib/data/extrair";
import { tema as temaPorSlug } from "@/lib/data/temas";
import { buscar } from "@/lib/data/busca";
import { derivados } from "@/lib/data/enriquecer";
import { contar, hrefLista, lerFiltro, paginar, type Filtro } from "@/lib/data/query";
import type { Dataset, Registro } from "@/lib/data/types";
import { n, nomeMes } from "@/lib/format";

const POR_PAGINA = 30;
type Base = "/proposicoes" | "/normas";

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
  base: Base;
  titulo: string;
  registros: readonly Registro[];
  grupo: "proposicao" | "norma";
  searchParams: Record<string, string | string[] | undefined>;
  intro: React.ReactNode;
}) {
  const tipos = d.tipos.filter((t) => t.grupo === grupo);
  const f = lerFiltro(searchParams, new Set(tipos.map((t) => t.contract)), new Set(d.vereadores.map((v) => v.slug)));
  const { pagina, ...filtro } = f;
  // Smart search (numbers, type words) when there is a query; plain filter otherwise.
  const resultado = buscar(registros, filtro.q ?? "", { ...filtro, q: undefined });
  const pag = paginar(resultado, pagina, POR_PAGINA);
  const anos = [...new Set(registros.map((r) => r.ano).filter((a): a is number => a !== null))].sort((a, b) => b - a);
  const autor = d.vereadores.find((v) => v.slug === filtro.autor);
  const nomeBairro = filtro.bairro ? bairroNome(registros, filtro.bairro) : undefined;
  const semTipo: Filtro = { ...filtro, tipo: undefined };
  const contaTipo = (tipo?: string) =>
    filtro.q ? buscar(registros, filtro.q, { ...semTipo, q: undefined, tipo }).length : contar(registros, { ...semTipo, tipo });
  const tiposComConta = tipos.map((t) => ({ t, c: contaTipo(t.contract) })).filter((x) => x.c > 0 || x.t.contract === filtro.tipo);

  return (
    <>
      <div className="prosa">
        <h1>{titulo}</h1>
        {intro}
      </div>

      <form action={base} method="get" role="search" className="busca">
        <label htmlFor="q" className="sr-only">
          Buscar
        </label>
        <div className="busca-campo">
          <Icon nome="buscar" />
          <input id="q" name="q" type="search" defaultValue={filtro.q ?? ""} placeholder="Bairro, assunto, número" enterKeyHint="search" />
          {filtro.tipo && <input type="hidden" name="tipo" value={filtro.tipo} />}
          {filtro.ano && <input type="hidden" name="ano" value={filtro.ano} />}
          {filtro.autor && <input type="hidden" name="autor" value={filtro.autor} />}
          <button type="submit">Buscar</button>
        </div>
      </form>

      <nav className="filtros-barra" aria-label="Filtrar por tipo" style={{ marginTop: "1rem" }}>
        <Link className="chip" href={hrefLista(base, { ...semTipo })} aria-current={!filtro.tipo ? "true" : undefined}>
          Todos <span className="conta">{n(contaTipo(undefined))}</span>
        </Link>
        {tiposComConta.map(({ t, c }) => (
          <Link
            key={t.contract}
            className="chip"
            href={hrefLista(base, { ...semTipo, tipo: t.contract })}
            aria-current={filtro.tipo === t.contract ? "true" : undefined}
          >
            {CURTO[t.contract] ?? t.titulo} <span className="conta">{n(c)}</span>
          </Link>
        ))}
      </nav>

      <div className="etiquetas" style={{ marginTop: "0.25rem" }}>
        {autor && (
          <Link className="chip" aria-current="true" href={hrefLista(base, { ...filtro, autor: undefined })} aria-label={`Remover filtro: ${autor.nome}`}>
            <Avatar v={autor} tamanho={22} /> {autor.nome} ✕
          </Link>
        )}
        {filtro.ano && (
          <Link className="chip" aria-current="true" href={hrefLista(base, { ...filtro, ano: undefined, mes: undefined })} aria-label={`Remover filtro: ${filtro.ano}`}>
            {filtro.ano} ✕
          </Link>
        )}
        {filtro.mes && (
          <Link className="chip" aria-current="true" href={hrefLista(base, { ...filtro, mes: undefined })} aria-label={`Remover filtro: ${nomeMes(filtro.mes, true)}`}>
            {nomeMes(filtro.mes, true)} ✕
          </Link>
        )}
        {filtro.coautor && (
          <Link className="chip" aria-current="true" href={hrefLista(base, { ...filtro, coautor: undefined })} aria-label="Remover filtro de coautoria">
            junto com {d.vereadores.find((v) => v.slug === filtro.coautor)?.nome} ✕
          </Link>
        )}
        {filtro.tema && (
          <Link className="chip" aria-current="true" href={hrefLista(base, { ...filtro, tema: undefined })} aria-label="Remover filtro de assunto">
            Assunto: {temaPorSlug(filtro.tema)?.nome ?? filtro.tema} ✕
          </Link>
        )}
        {filtro.bairro && (
          <Link className="chip" aria-current="true" href={hrefLista(base, { ...filtro, bairro: undefined })} aria-label="Remover filtro de bairro">
            Bairro: {nomeBairro ?? filtro.bairro} ✕
          </Link>
        )}
        {filtro.grupo && (
          <Link className="chip" aria-current="true" href={hrefLista(base, { ...filtro, grupo: undefined })} aria-label="Remover filtro de grupo">
            {GRUPOS.find((g) => g.slug === filtro.grupo)?.nome ?? filtro.grupo} ✕
          </Link>
        )}
        {filtro.pub && (
          <Link className="chip" aria-current="true" href={hrefLista(base, { ...filtro, pub: undefined })} aria-label="Remover filtro de mês">
            Publicadas em {nomeMes(Number(filtro.pub.slice(5, 7)), true)} de {filtro.pub.slice(0, 4)} ✕
          </Link>
        )}
      </div>

      <details className="mais-filtros">
        <summary>
          <Icon nome="filtro" tamanho={18} /> Mais filtros
        </summary>
        <form className="form-filtros" action={base} method="get">
          {filtro.q && <input type="hidden" name="q" value={filtro.q} />}
          {filtro.tipo && <input type="hidden" name="tipo" value={filtro.tipo} />}
          <div>
            <label htmlFor="ano">Ano do número</label>
            <select id="ano" name="ano" defaultValue={filtro.ano ? String(filtro.ano) : ""}>
              <option value="">Todos</option>
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          {grupo === "proposicao" && (
            <div>
              <label htmlFor="autor">Vereador</label>
              <select id="autor" name="autor" defaultValue={filtro.autor ?? ""}>
                <option value="">Todos</option>
                {d.vereadores.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <button type="submit">Aplicar</button>
          </div>
        </form>
      </details>

      <p className="contagem" aria-live="polite">
        <strong>{n(pag.total)}</strong> {pag.total === 1 ? "resultado" : "resultados"}
        {Object.values(filtro).some((x) => x !== undefined) && (
          <>
            {" "}
            <Link href={base} className="small">
              Limpar filtros
            </Link>
          </>
        )}
      </p>

      {pag.itens.length > 0 ? (
        <Feed itens={pag.itens} vereadores={d.vereadores} />
      ) : (
        <p className="nota">
          Nada encontrado com esses filtros. Tente outra palavra, tire um filtro ou procure pelo número com ano, como 2398/2026.
        </p>
      )}

      {pag.totalPaginas > 1 && (
        <nav className="paginacao" aria-label="Paginação">
          {pag.pagina > 1 ? (
            <Link className="botao secundario" href={hrefLista(base, filtro, pag.pagina - 1)}>
              Anteriores
            </Link>
          ) : (
            <span />
          )}
          <span className="small soft">
            Página {pag.pagina} de {pag.totalPaginas}
          </span>
          {pag.pagina < pag.totalPaginas ? (
            <Link className="botao" href={hrefLista(base, filtro, pag.pagina + 1)}>
              Mais resultados
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
      <Fonte d={d} />
    </>
  );
}

function bairroNome(registros: readonly Registro[], slug: string): string | undefined {
  for (const r of registros) {
    const dv = derivados(r);
    const i = dv.bairrosSlug.indexOf(slug);
    if (i >= 0) return dv.bairros[i];
  }
  return undefined;
}
