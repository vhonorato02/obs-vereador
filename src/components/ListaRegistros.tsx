import Link from "next/link";
import { dataPublicacao } from "@/lib/format";
import type { Registro, Vereador } from "@/lib/data/types";

export function ListaRegistros({
  itens,
  vereadores,
  titulos,
}: {
  itens: readonly Registro[];
  vereadores: readonly Vereador[];
  titulos: (contract: string) => string;
}) {
  const porSlug = new Map(vereadores.map((v) => [v.slug, v]));
  return (
    <ol className="lista">
      {itens.map((r) => (
        <li key={`${r.tipo}-${r.id}`}>
          <div className="titulo">
            <a href={r.link}>{r.titulo}</a> <span className="tag">{titulos(r.tipo)}</span>
          </div>
          <p className="ementa">{r.ementa || <span className="muted">(sem ementa publicada)</span>}</p>
          <div className="meta">
            Publicado em {dataPublicacao(r.data)}
            {r.autores.length > 0 && (
              <>
                {" · "}Autoria:{" "}
                {r.autores.map((a, i) => {
                  const slug = r.autoresVereadores.find((s) => porSlug.get(s)?.nome === a);
                  return (
                    <span key={a}>
                      {i > 0 && "; "}
                      {slug ? <Link href={`/vereadores/${slug}`}>{a}</Link> : a}
                    </span>
                  );
                })}
              </>
            )}
            {" · "}
            <a href={r.link}>Documento oficial</a>
          </div>
        </li>
      ))}
    </ol>
  );
}
