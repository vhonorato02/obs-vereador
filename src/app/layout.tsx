import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Acompanhe seu Vereador — Pindamonhangaba",
    template: "%s — Acompanhe seu Vereador",
  },
  description:
    "O que cada vereador de Pindamonhangaba apresentou na Câmara, com link para o documento oficial. Mantido pelo Observatório Social do Brasil – Pindamonhangaba.",
  openGraph: { locale: "pt_BR", type: "website", siteName: "Acompanhe seu Vereador" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1f1a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand">
              Acompanhe seu Vereador
              <small>Pindamonhangaba · Observatório Social do Brasil</small>
            </Link>
            <nav className="nav" aria-label="Principal">
              <ul>
                <li>
                  <Link href="/#vereadores">Vereadores</Link>
                </li>
                <li>
                  <Link href="/proposicoes">Proposições</Link>
                </li>
                <li>
                  <Link href="/normas">Leis e normas</Link>
                </li>
                <li>
                  <Link href="/como-funciona">Como funciona</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main id="conteudo" className="wrap">
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap">
            <p>
              Mantido pelo Observatório Social do Brasil – Pindamonhangaba. <strong>Este não é o site oficial da Câmara.</strong>{" "}
              Os documentos oficiais estão em{" "}
              <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
            </p>
            <ul>
              <li>
                <Link href="/metodologia">Metodologia</Link>
              </li>
              <li>
                <Link href="/dados">Dados abertos</Link>
              </li>
              <li>
                <Link href="/sobre">Sobre</Link>
              </li>
              <li>
                <a href="https://github.com/vhonorato02/obs-vereador/issues/new?title=Erro%20nos%20dados">Reportar erro</a>
              </li>
            </ul>
          </div>
        </footer>
      </body>
    </html>
  );
}
