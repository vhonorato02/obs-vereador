import type { Metadata } from "next";
import { Fonte } from "@/components/Fonte";
import { Rosto } from "@/components/Rosto";
import { dataset } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Vereadores",
  description: "Os 11 vereadores em exercício na Câmara Municipal de Pindamonhangaba, legislatura 2025–2028.",
};

export default function Vereadores() {
  const d = dataset();
  return (
    <>
      <div className="prosa">
        <h1>Vereadores em exercício</h1>
        <p className="soft">
          Legislatura 2025–2028, em ordem alfabética pelo nome parlamentar. Toque num rosto para ver tudo o que a pessoa
          apresentou. Fotos: Câmara Municipal de Pindamonhangaba.
        </p>
      </div>
      <ul className="grade section">
        {d.vereadores.map((v, i) => (
          <li key={v.slug}>
            <Rosto v={v} prioridade={i < 4} />
          </li>
        ))}
      </ul>
      <Fonte d={d} />
    </>
  );
}
