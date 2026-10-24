import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLista } from "@/components/PaginaLista";
import { dataset } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Proposições",
  description: "Requerimentos, indicações, moções, emendas e projetos apresentados na Câmara de Pindamonhangaba.",
};

export default async function Proposicoes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const d = dataset();
  return (
    <PaginaLista
      d={d}
      base="/proposicoes"
      titulo="Proposições"
      registros={d.proposicoes}
      grupo="proposicao"
      searchParams={await searchParams}
      intro={
        <p className="muted">
          Tudo o que foi apresentado na Câmara nesta legislatura, inclusive pelo Poder Executivo e por comissões. O que é cada
          tipo: <Link href="/como-funciona">Como funciona</Link>. A busca procura no título, na ementa e na autoria; para bairros,
          ela encontra o nome escrito no texto (a Câmara não publica uma classificação por bairro).
        </p>
      }
    />
  );
}
