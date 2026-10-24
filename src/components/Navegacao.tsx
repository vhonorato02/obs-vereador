"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const ABAS = [
  { href: "/", rotulo: "Início", icone: "inicio", ativo: (p: string) => p === "/" },
  { href: "/vereadores", rotulo: "Vereadores", icone: "pessoas", ativo: (p: string) => p.startsWith("/vereadores") },
  { href: "/buscar", rotulo: "Buscar", icone: "buscar", ativo: (p: string) => p.startsWith("/buscar") || p.startsWith("/proposicoes") },
  { href: "/normas", rotulo: "Leis", icone: "lei", ativo: (p: string) => p.startsWith("/normas") },
];

export function NavTopo() {
  const p = usePathname();
  return (
    <nav className="topnav" aria-label="Principal">
      {ABAS.map((a) => (
        <Link key={a.href} href={a.href} aria-current={a.ativo(p) ? "page" : undefined}>
          {a.rotulo}
        </Link>
      ))}
      <Link href="/como-funciona" aria-current={p.startsWith("/como-funciona") ? "page" : undefined}>
        Como funciona
      </Link>
    </nav>
  );
}

export function TabBar() {
  const p = usePathname();
  return (
    <nav className="tabbar" aria-label="Atalhos">
      <ul>
        {ABAS.map((a) => (
          <li key={a.href}>
            <Link href={a.href} aria-current={a.ativo(p) ? "page" : undefined}>
              <span className="tab-ico">
                <Icon nome={a.icone} />
              </span>
              {a.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
