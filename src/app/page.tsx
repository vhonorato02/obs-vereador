import Link from "next/link";
import { Fonte } from "@/components/Fonte";
import { ListaRegistros } from "@/components/ListaRegistros";
import { dataset, tipoTitulo } from "@/lib/data/load";
import { hrefLista, ordenar } from "@/lib/data/query";
import { dataColeta, n } from "@/lib/format";

export default function Inicio() {
  const d = dataset();
  const recentes = ordenar(d.proposicoes).slice(0, 8);
  return (
    <>
      <h1>Acompanhe os vereadores de Pindamonhangaba</h1>
      <p className="lead">
        O que cada um dos {d.vereadores.length} vereadores em exercício apresentou na Câmara Municipal nesta legislatura,
        com link para o documento oficial de cada item.
      </p>
      <p className="muted">
        Dados da Câmara coletados em {dataColeta(d.execucao.coletadoEm)}. Desde{" "}
        {d.escopo.inicio.split("-").reverse().join("/")}:{" "}
        <Link href="/proposicoes">{n(d.proposicoes.length)} proposições</Link> e{" "}
        <Link href="/normas">{n(d.normas.length)} leis e normas</Link>.
      </p>

      <h2 id="vereadores">Vereadores em exercício</h2>
      <p className="muted">Em ordem alfabética pelo nome parlamentar. Fotos: Câmara Municipal de Pindamonhangaba.</p>
      <ul className="grid-vereadores">
        {d.vereadores.map((v) => (
          <li key={v.slug}>
            <Link href={`/vereadores/${v.slug}`}>
              {v.foto ? (
                <img src={v.foto} alt="" width={240} height={320} loading="lazy" />
              ) : (
                <span className="foto-vazia" aria-hidden="true" />
              )}
              <div className="nome">{v.nome}</div>
              <div className="meta">
                {v.partido}
                {v.funcao && v.funcao !== "Vereador" ? ` · ${v.funcao}` : ""}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="note">
        <p>
          <strong>Como ler estes números.</strong> Quantidade de proposições não mede qualidade nem dedicação. Requerimentos e
          indicações são pedidos rotineiros; um único projeto de lei pode exigir meses de trabalho. Por isso o portal não faz
          ranking: cada número abre a lista dos documentos que o compõem.
        </p>
      </div>

      <h2>Publicadas mais recentemente</h2>
      <ListaRegistros itens={recentes} vereadores={d.vereadores} titulos={(c) => tipoTitulo(d, c)} />
      <p>
        <Link href={hrefLista("/proposicoes", {})}>Ver todas as proposições</Link>
      </p>
      <Fonte d={d} />
    </>
  );
}
