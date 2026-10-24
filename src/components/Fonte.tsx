import Link from "next/link";
import { dataColeta } from "@/lib/format";
import type { Dataset } from "@/lib/data/types";

/** Provenance block shown at the end of every data page. */
export function Fonte({ d }: { d: Dataset }) {
  return (
    <aside className="source" aria-label="Fonte dos dados">
      <p>
        <strong>Fonte:</strong> <a href={d.fonte.url}>{d.fonte.nome}</a>. Coletado em {dataColeta(d.execucao.coletadoEm)}.
        Período: {d.escopo.descricao} (desde {d.escopo.inicio.split("-").reverse().join("/")}).{" "}
        <Link href="/metodologia">Como contamos</Link> · <Link href="/dados">Baixar os dados</Link>
      </p>
      {d.execucao.modo === "amostra" && (
        <p className="note warning">Atenção: esta versão usa uma amostra de desenvolvimento, não a coleta completa.</p>
      )}
    </aside>
  );
}
