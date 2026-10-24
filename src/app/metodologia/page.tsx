import type { Metadata } from "next";
import Link from "next/link";
import { dataset } from "@/lib/data/load";
import { dataColeta, n } from "@/lib/format";

export const metadata: Metadata = {
  title: "Metodologia",
  description: "De onde vêm os dados do portal, como são contados e quais são os limites.",
};

export default function Metodologia() {
  const d = dataset();
  const semVereador = d.proposicoes.filter((p) => p.autoresVereadores.length === 0).length;
  return (
    <>
      <h1>Metodologia</h1>

      <h2>De onde vêm os dados</h2>
      <p>
        Todos os dados vêm da <a href={d.fonte.url}>{d.fonte.nome}</a>, consultada com um token de cidadão. Termos da fonte:{" "}
        {d.fonte.termos}
      </p>
      <p>
        Última coleta: {dataColeta(d.execucao.coletadoEm)} ({d.execucao.modo === "completo" ? "coleta completa" : d.execucao.modo === "incremental" ? "coleta incremental: páginas novas mais uma margem de 45 dias das anteriores" : "amostra de desenvolvimento"}
        {d.execucao.requisicoes > 0 ? `, ${n(d.execucao.requisicoes)} consultas à API` : ""}). A atualização é feita a cada
        quinze dias pelo Observatório.
      </p>
      <p>
        O coletor se identifica, espera pelo menos 1 segundo entre consultas e para se a resposta vier vazia, em formato
        inesperado ou com queda brusca de volume. Nesses casos o site não é atualizado e continua mostrando a última coleta boa.
      </p>

      <h2>Período</h2>
      <p>
        {d.escopo.descricao}: proposições e normas publicadas desde {d.escopo.inicio.split("-").reverse().join("/")} ou numeradas
        a partir de 2025. O “ano” das tabelas é o do número oficial (por exemplo, Requerimento nº 2398/<strong>2026</strong>).
      </p>

      <h2>Como contamos</h2>
      <ul>
        <li>
          Cada número do portal é calculado com o mesmo filtro da lista para a qual ele aponta. Um teste automático garante que
          número e lista batem.
        </li>
        <li>
          <strong>Coautoria conta para cada coautor.</strong> A Câmara publica a autoria como uma lista separada por “;”. Um
          requerimento assinado por três vereadores aparece no perfil dos três. Por isso a soma dos perfis é maior que o total de
          proposições.
        </li>
        <li>
          O nome do autor é comparado com o nome parlamentar dos vereadores em exercício. Autores que não são vereadores em
          exercício (Poder Executivo, comissões, Mesa, suplentes que já saíram) aparecem nas listas, mas não têm perfil. Nesta
          coleta, {n(semVereador)} proposições não têm nenhum vereador em exercício entre os autores.
        </li>
        <li>Nada é estimado. Se um dado não existe na fonte, o portal diz que não existe.</li>
      </ul>

      <h2 id="normas">Autoria de leis e normas</h2>
      <p>
        A API não informa quem propôs cada lei. Quando a ementa traz a frase “de autoria do Vereador…”, o portal liga a norma ao
        perfil do vereador e marca a informação como <em>derivada</em>. Normas com outra redação, ou de autoria do Poder Executivo,
        não aparecem nos perfis.
      </p>

      <h2>Limites conhecidos</h2>
      <ul>
        <li>Sem votações, presença e tramitação: não estão na API de dados abertos.</li>
        <li>
          A API tem um serviço de bairros, mas ele vem vazio. A busca por bairro procura o nome no texto da ementa, e por isso pode
          deixar de fora pedidos que não escrevem o nome do bairro.
        </li>
        <li>A lista de vereadores da API traz só quem está em exercício hoje, sem histórico de suplências.</li>
        <li>O portal não republica o texto integral dos documentos. Cada item tem link para o documento oficial.</li>
      </ul>

      {d.execucao.avisos.length > 0 && (
        <>
          <h2>Avisos da última coleta</h2>
          <ul>
            {d.execucao.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </>
      )}

      <p>
        Encontrou um erro? <a href="https://github.com/vhonorato02/obs-vereador/issues/new?title=Erro%20nos%20dados">Avise aqui</a>.
        O código do portal é aberto. Veja também os <Link href="/dados">dados para download</Link>.
      </p>
    </>
  );
}
