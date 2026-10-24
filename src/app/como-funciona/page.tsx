import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARIO } from "@/lib/content/glossario";
import { dataset } from "@/lib/data/load";
import { hrefLista } from "@/lib/data/query";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "A Câmara de Pindamonhangaba em poucas linhas e o que significa cada tipo de proposição.",
};

export default function ComoFunciona() {
  const d = dataset();
  const existe = new Set(d.tipos.map((t) => t.contract));
  return (
    <>
      <h1>Como funciona a Câmara</h1>
      <p className="lead">
        A Câmara Municipal de Pindamonhangaba tem {d.vereadores.length} vereadores, eleitos para a legislatura 2025–2028. Eles
        propõem e votam leis municipais, fiscalizam a Prefeitura e fazem pedidos em nome da população.
      </p>
      <p>
        As sessões ordinárias acontecem às terças-feiras, a partir das 17h, segundo a própria Câmara. A Mesa Diretora (presidente,
        vice-presidentes e secretários) conduz os trabalhos.
      </p>

      <h2>Tipos de proposição</h2>
      <div className="note">
        <p>
          Explicações simplificadas, escritas pelo Observatório. A definição oficial está no Regimento Interno da Câmara e na Lei
          Orgânica do Município.
        </p>
      </div>
      <dl>
        {GLOSSARIO.filter((g) => existe.has(g.contract)).map((g) => (
          <div key={g.contract} id={g.contract} style={{ marginBottom: "var(--space-6)" }}>
            <dt>
              <h3 style={{ marginBottom: "var(--space-1)" }}>{d.tipos.find((t) => t.contract === g.contract)?.titulo}</h3>
            </dt>
            <dd style={{ margin: 0 }}>
              <p>{g.explicacao}</p>
              <p>
                <Link href={hrefLista("/proposicoes", { tipo: g.contract })}>Ver as desta legislatura</Link>
              </p>
            </dd>
          </div>
        ))}
      </dl>

      <h2>O que este portal não mostra (ainda)</h2>
      <ul>
        <li>Como cada vereador votou. A API de dados abertos da Câmara não publica votações.</li>
        <li>Presença nas sessões. Também não está na API; fica registrada nas atas, em PDF.</li>
        <li>Tramitação (em que etapa está cada projeto). Consulte o documento oficial pelo link de cada item.</li>
      </ul>
    </>
  );
}
