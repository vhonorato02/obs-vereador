import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fonte } from "@/components/Fonte";
import { ListaRegistros } from "@/components/ListaRegistros";
import { ORDEM_TIPOS, verbete } from "@/lib/content/glossario";
import { dataset, tipoTitulo } from "@/lib/data/load";
import { contar, filtrar, hrefLista, ordenar } from "@/lib/data/query";
import { n } from "@/lib/format";

export function generateStaticParams() {
  return dataset().vereadores.map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = dataset().vereadores.find((x) => x.slug === slug);
  return v
    ? { title: v.nome, description: `O que ${v.nome} (${v.partido}) apresentou na Câmara de Pindamonhangaba.` }
    : {};
}

export default async function PaginaVereador({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = dataset();
  const v = d.vereadores.find((x) => x.slug === slug);
  if (!v) notFound();

  const deles = filtrar(d.proposicoes, { autor: v.slug });
  const anos = [...new Set(deles.map((r) => r.ano).filter((a): a is number => a !== null))].sort();
  const tipos = ORDEM_TIPOS.filter((t) => d.tipos.some((x) => x.contract === t));
  const outros = [...new Set(deles.map((r) => r.tipo))].filter((t) => !tipos.includes(t));
  const linhas = [...tipos, ...outros];
  const normasCitadas = d.normas.filter((x) => x.autoriaCitadaNaEmenta.includes(v.slug));
  const recentes = ordenar(deles).slice(0, 10);

  return (
    <>
      <p className="muted">
        <Link href="/#vereadores">Vereadores</Link> / {v.nome}
      </p>
      <div className="perfil">
        <div>
          {v.foto ? (
            <img src={v.foto} alt={`Foto oficial de ${v.nome}`} width={240} height={320} />
          ) : (
            <span className="foto-vazia" aria-hidden="true" />
          )}
          {v.foto && <p className="muted credito">Foto: Câmara Municipal de Pindamonhangaba</p>}
        </div>
        <div>
          <h1>{v.nome}</h1>
          <dl className="resumo">
            <dt>Partido</dt>
            <dd>{v.partido}</dd>
            <dt>Função</dt>
            <dd>{v.funcao || "—"}</dd>
            <dt>Mandato</dt>
            <dd>Em exercício na legislatura 2025–2028</dd>
            <dt>Página oficial</dt>
            <dd>
              <a href={v.link.replace(/#.*$/, "")}>Perfil no site da Câmara</a>
            </dd>
          </dl>
          {v.funcao === "Presidente" && (
            <div className="note">
              <p>
                Como presidente, conduz as sessões e representa a Câmara. Esse papel institucional é contexto para ler os
                números abaixo.
              </p>
            </div>
          )}
        </div>
      </div>

      <h2>Proposições com autoria ou coautoria</h2>
      <p className="muted">
        Cada número é um link para a lista completa. Uma proposição assinada por vários vereadores conta para cada um deles.
      </p>
      <div className="tabela-wrap" role="region" aria-label="Proposições por tipo e ano" tabIndex={0}>
        <table>
          <caption>Proposições de {v.nome} por tipo e ano do número</caption>
          <thead>
            <tr>
              <th scope="col">Tipo</th>
              {anos.map((a) => (
                <th scope="col" className="num" key={a}>
                  {a}
                </th>
              ))}
              <th scope="col" className="num">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((t) => {
              const total = contar(d.proposicoes, { autor: v.slug, tipo: t });
              return (
                <tr key={t}>
                  <th scope="row">
                    {tipoTitulo(d, t)}
                    {verbete(t) && <div className="muted">{verbete(t)?.curto}</div>}
                  </th>
                  {anos.map((a) => {
                    const c = contar(d.proposicoes, { autor: v.slug, tipo: t, ano: a });
                    return (
                      <td className="num" key={a}>
                        {c > 0 ? <Link href={hrefLista("/proposicoes", { autor: v.slug, tipo: t, ano: a })}>{n(c)}</Link> : "0"}
                      </td>
                    );
                  })}
                  <td className="num">
                    {total > 0 ? <Link href={hrefLista("/proposicoes", { autor: v.slug, tipo: t })}>{n(total)}</Link> : "0"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2>Leis e normas que citam {v.nome} como autor do projeto</h2>
      {normasCitadas.length > 0 ? (
        <>
          <p className="muted">
            Informação derivada: o portal procura no texto da ementa a frase “de autoria do Vereador…”. A Câmara não publica
            esse campo separado, então normas com outra redação podem ficar de fora.
          </p>
          <ListaRegistros itens={ordenar(normasCitadas)} vereadores={d.vereadores} titulos={(c) => tipoTitulo(d, c)} />
        </>
      ) : (
        <p className="muted">
          Nenhuma norma desta legislatura cita este vereador no texto da ementa. Isso não significa que não haja; veja a{" "}
          <Link href="/metodologia#normas">metodologia</Link>.
        </p>
      )}

      <h2>Mais recentes</h2>
      {recentes.length > 0 ? (
        <>
          <ListaRegistros itens={recentes} vereadores={d.vereadores} titulos={(c) => tipoTitulo(d, c)} />
          <p>
            <Link href={hrefLista("/proposicoes", { autor: v.slug })}>Ver todas as {n(deles.length)} proposições</Link>
          </p>
        </>
      ) : (
        <p className="muted">Nenhuma proposição encontrada no período.</p>
      )}
      <Fonte d={d} />
    </>
  );
}
