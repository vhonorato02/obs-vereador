import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Fonte } from "@/components/Fonte";
import { Feed } from "@/components/Item";
import { PainelVereador } from "@/components/PainelVereador";
import { GLOSSARIO } from "@/lib/content/glossario";
import { CURTO } from "@/lib/content/tipos";
import { dataset } from "@/lib/data/load";
import { recortes } from "@/lib/data/perfil";
import { filtrar, hrefLista, ordenar } from "@/lib/data/query";
import { n } from "@/lib/format";

export function generateStaticParams() {
  return dataset().vereadores.map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = dataset().vereadores.find((x) => x.slug === slug);
  if (!v) return {};
  return {
    title: v.nome,
    description: `O que ${v.nome} (${v.partido}) apresentou na Câmara de Pindamonhangaba nesta legislatura.`,
    openGraph: v.foto ? { images: [{ url: v.foto }] } : undefined,
  };
}

export default async function PaginaVereador({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = dataset();
  const v = d.vereadores.find((x) => x.slug === slug);
  if (!v) notFound();

  const deles = ordenar(filtrar(d.proposicoes, { autor: v.slug }));
  const normasCitadas = ordenar(d.normas.filter((x) => x.autoriaCitadaNaEmenta.includes(v.slug)));
  const explicacoes = Object.fromEntries(GLOSSARIO.map((g) => [g.contract, g.curto]));
  const papel = v.funcao && v.funcao !== "Vereador" ? v.funcao : null;

  return (
    <>
      <header className="perfil-hero">
        <ViewTransition name={`foto-${v.slug}`}>
          <div className="perfil-foto">
            {v.foto && (
              <Image src={v.foto} alt={`Foto oficial de ${v.nome}`} width={480} height={600} priority sizes="(min-width: 46rem) 17rem, 100vw" />
            )}
          </div>
        </ViewTransition>
        <div className="entrada">
          <h1 className="perfil-nome">{v.nome}</h1>
          <div className="etiquetas">
            <span className="etiqueta">{v.partido}</span>
            {papel && <span className="etiqueta destaque">{papel}</span>}
            <span className="etiqueta">Mandato 2025–2028</span>
          </div>
          <p className="small soft" style={{ marginTop: "0.85rem" }}>
            Foto: Câmara Municipal. <a href={v.link.replace(/#.*$/, "")}>Perfil no site oficial</a>
          </p>
        </div>
      </header>

      {papel === "Presidente" && (
        <p className="nota section" style={{ marginTop: "1.25rem" }}>
          Como presidente, conduz as sessões e representa a Câmara. Esse papel é contexto para ler os números abaixo.
        </p>
      )}

      <PainelVereador slug={v.slug} nome={v.nome} recortes={recortes(d.proposicoes, v.slug)} rotulos={CURTO} explicacoes={explicacoes} />

      <p className="small soft" style={{ marginTop: "0.75rem" }}>
        Proposições assinadas por vários vereadores contam para cada um. <Link href="/metodologia">Como contamos</Link>
      </p>

      <section className="section" aria-labelledby="t-recentes">
        <div className="section-head">
          <h2 id="t-recentes">Mais recentes</h2>
          {deles.length > 0 && <Link href={hrefLista("/proposicoes", { autor: v.slug })}>Ver as {n(deles.length)}</Link>}
        </div>
        {deles.length > 0 ? (
          <Feed itens={deles.slice(0, 8)} vereadores={d.vereadores} />
        ) : (
          <p className="soft">Nenhuma proposição desta legislatura até a última atualização.</p>
        )}
      </section>

      <section className="section" aria-labelledby="t-leis">
        <h2 id="t-leis">Leis que citam {v.nome} como autor do projeto</h2>
        <p className="small soft" style={{ margin: "0.5rem 0 1rem" }}>
          Informação derivada: o portal procura “de autoria do Vereador…” no texto da lei. A Câmara não publica esse campo, então
          leis com outra redação podem ficar de fora.
        </p>
        {normasCitadas.length > 0 ? (
          <Feed itens={normasCitadas.slice(0, 10)} vereadores={d.vereadores} />
        ) : (
          <p className="soft">Nenhuma lei desta legislatura cita este nome na ementa.</p>
        )}
      </section>
      <Fonte d={d} />
    </>
  );
}
