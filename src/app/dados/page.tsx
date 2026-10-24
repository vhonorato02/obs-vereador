import type { Metadata } from "next";
import { dataset } from "@/lib/data/load";
import { dataColeta, n } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dados abertos",
  description: "Baixe as proposições, normas e vereadores usados pelo portal, em CSV e JSON.",
};

export default function Dados() {
  const d = dataset();
  const arquivos = [
    { href: "/dados/proposicoes.csv", nome: "Proposições (CSV)", qtd: d.proposicoes.length },
    { href: "/dados/proposicoes.json", nome: "Proposições (JSON)", qtd: d.proposicoes.length },
    { href: "/dados/normas.csv", nome: "Leis e normas (CSV)", qtd: d.normas.length },
    { href: "/dados/normas.json", nome: "Leis e normas (JSON)", qtd: d.normas.length },
    { href: "/dados/vereadores.json", nome: "Vereadores em exercício (JSON)", qtd: d.vereadores.length },
    { href: "/dados/manifesto.json", nome: "Manifesto da coleta (data, fonte, avisos)", qtd: null },
  ];
  return (
    <>
      <h1>Dados abertos</h1>
      <p>
        Os mesmos dados que o portal mostra, como foram coletados em {dataColeta(d.execucao.coletadoEm)}. Reutilize à vontade,
        citando a fonte original (Câmara Municipal de Pindamonhangaba) e este portal.
      </p>
      <ul>
        {arquivos.map((a) => (
          <li key={a.href}>
            <a href={a.href} download>
              {a.nome}
            </a>
            {a.qtd !== null && <span className="muted"> · {n(a.qtd)} registros</span>}
          </li>
        ))}
      </ul>
      <h2>Dicionário</h2>
      <div className="tabela-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Campo</th>
              <th scope="col">Significado</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">id</th><td>Número do documento no site da Câmara (vem do link oficial)</td></tr>
            <tr><th scope="row">tipo</th><td>Tipo, como a Câmara o identifica (ex.: Requerimentos)</td></tr>
            <tr><th scope="row">titulo</th><td>Título oficial, com número e ano</td></tr>
            <tr><th scope="row">numero, ano</th><td>Extraídos do título</td></tr>
            <tr><th scope="row">data_publicacao</th><td>Data e hora de publicação no site da Câmara (horário de Brasília)</td></tr>
            <tr><th scope="row">autoria</th><td>Texto de autoria como publicado; vários autores separados por “;”</td></tr>
            <tr><th scope="row">ementa</th><td>Resumo oficial do documento</td></tr>
            <tr><th scope="row">link_oficial</th><td>Página do documento no site da Câmara</td></tr>
          </tbody>
        </table>
      </div>
      <p className="muted">
        Os CSV usam “;” como separador e codificação UTF-8, para abrir direto em planilhas configuradas em português.
      </p>
    </>
  );
}
