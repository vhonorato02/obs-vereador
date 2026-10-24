import Link from "next/link";
import { Busca } from "@/components/Busca";
import { Fonte } from "@/components/Fonte";
import { Feed } from "@/components/Item";
import { Rosto } from "@/components/Rosto";
import { dataset } from "@/lib/data/load";
import { hrefLista, ordenar } from "@/lib/data/query";
import { diaPorExtenso, n } from "@/lib/format";

const ATALHOS = ["Iluminação", "Asfalto", "Saúde", "Escola", "Araretama", "Moreira César", "Animais"];

export default function Inicio() {
  const d = dataset();
  const recentes = ordenar(d.proposicoes);
  const maisRecente = recentes[0]?.data.slice(0, 10);
  const corte = maisRecente ? new Date(`${maisRecente}T00:00:00Z`) : null;
  corte?.setUTCDate(corte.getUTCDate() - 14);
  const limite = corte?.toISOString().slice(0, 10) ?? "";
  const quinzena = recentes.filter((r) => r.data.slice(0, 10) > limite);
  const dias = [...new Set(quinzena.slice(0, 18).map((r) => r.data.slice(0, 10)))];
  const leis = ordenar(d.normas).slice(0, 3);

  return (
    <>
      <section className="hero entrada">
        <h1>Acompanhe os {d.vereadores.length} vereadores de Pindamonhangaba</h1>
        <p>Pedidos, projetos e leis de cada um, direto da Câmara Municipal, atualizados a cada 15 dias.</p>
        <Busca />
      </section>
      <nav className="sugestoes" aria-label="Buscas sugeridas">
        {ATALHOS.map((a) => (
          <Link key={a} className="chip" href={`/buscar?q=${encodeURIComponent(a)}`}>
            {a}
          </Link>
        ))}
      </nav>

      <section className="section" aria-labelledby="t-vereadores">
        <div className="section-head">
          <h2 id="t-vereadores">Vereadores</h2>
          <Link href="/vereadores">Ver todos</Link>
        </div>
        <ul className="trilho">
          {d.vereadores.map((v, i) => (
            <li key={v.slug}>
              <Rosto v={v} prioridade={i < 3} />
            </li>
          ))}
        </ul>
        <p className="small soft">Em ordem alfabética.<span className="so-celular"> Deslize para ver todos.</span></p>
      </section>

      <section className="section" aria-labelledby="t-quinzena">
        <div className="section-head">
          <h2 id="t-quinzena">Nas últimas duas semanas</h2>
          <Link href={hrefLista("/proposicoes", {})}>Ver tudo</Link>
        </div>
        <p className="soft">
          {n(quinzena.length)} proposições publicadas pela Câmara nos 14 dias até a última atualização.
        </p>
        {dias.map((dia) => (
          <div key={dia}>
            <h3 className="dia">{diaPorExtenso(dia)}</h3>
            <Feed itens={quinzena.slice(0, 18).filter((r) => r.data.startsWith(dia))} vereadores={d.vereadores} />
          </div>
        ))}
      </section>

      <section className="section" aria-labelledby="t-leis">
        <div className="section-head">
          <h2 id="t-leis">Leis publicadas por último</h2>
          <Link href="/normas">Todas as leis</Link>
        </div>
        <Feed itens={leis} vereadores={d.vereadores} />
      </section>

      <section className="section nota">
        <p>
          <strong>Quantidade não é qualidade.</strong> Requerimentos e indicações são pedidos rotineiros; um único projeto de lei
          pode levar meses. Por isso não existe ranking aqui. Cada número abre a lista dos documentos que o formam.{" "}
          <Link href="/como-funciona">Entenda cada tipo</Link>.
        </p>
      </section>
      <Fonte d={d} />
    </>
  );
}
