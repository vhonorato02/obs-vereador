import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Marca } from "@/components/Icon";
import { NavTopo, TabBar } from "@/components/Navegacao";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Acompanhe seu Vereador | Pindamonhangaba",
    template: "%s | Acompanhe seu Vereador",
  },
  description:
    "O que cada vereador de Pindamonhangaba apresentou na Câmara, com link para o documento oficial. Mantido pelo Observatório Social do Brasil – Pindamonhangaba.",
  openGraph: { locale: "pt_BR", type: "website", siteName: "Acompanhe seu Vereador" },
  appleWebApp: { capable: true, title: "Vereadores Pinda", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1813" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <header className="topbar">
          <div className="page">
            <Link href="/" className="marca">
              <Marca />
              <span>
                Acompanhe seu Vereador
                <small>Pindamonhangaba</small>
              </span>
            </Link>
            <NavTopo />
          </div>
        </header>
        <main id="conteudo" className="page">
          {children}
        </main>
        <footer className="rodape">
          <div className="page">
            <p>
              Mantido pelo Observatório Social do Brasil – Pindamonhangaba. Este não é o site oficial da Câmara; os documentos
              oficiais estão em <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
            </p>
            <ul>
              <li><Link href="/como-funciona">Como funciona</Link></li>
              <li><Link href="/metodologia">Metodologia</Link></li>
              <li><Link href="/dados">Dados abertos</Link></li>
              <li><Link href="/sobre">Sobre</Link></li>
              <li><a href="https://github.com/vhonorato02/obs-vereador/issues/new?title=Erro%20nos%20dados">Reportar erro</a></li>
            </ul>
          </div>
        </footer>
        <TabBar />
      </body>
    </html>
  );
}
