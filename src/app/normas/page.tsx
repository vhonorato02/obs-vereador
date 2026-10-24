import type { Metadata } from "next";
import { PaginaLista } from "@/components/PaginaLista";
import { dataset } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Leis e normas",
  description: "Leis, resoluções e decretos legislativos publicados pela Câmara de Pindamonhangaba nesta legislatura.",
};

export default async function Normas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const d = dataset();
  return (
    <PaginaLista
      d={d}
      base="/normas"
      titulo="Leis e normas"
      registros={d.normas}
      grupo="norma"
      searchParams={await searchParams}
      intro={
        <p className="muted">
          Leis ordinárias e complementares, emendas à Lei Orgânica, resoluções e decretos legislativos publicados desde 2025. A
          Câmara não informa a autoria das normas em campo próprio; quando a ementa cita o autor do projeto, o texto aparece aqui
          como foi publicado.
        </p>
      }
    />
  );
}
