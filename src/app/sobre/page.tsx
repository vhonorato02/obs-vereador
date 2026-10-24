import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Quem mantém o portal Acompanhe seu Vereador e quais são seus princípios.",
};

export default function Sobre() {
  return (
    <div className="prosa">
      <h1>Sobre o portal</h1>
      <p className="soft" style={{ fontSize: "var(--step-1)" }}>
        O Acompanhe seu Vereador é mantido pelo Observatório Social do Brasil – Pindamonhangaba para que qualquer pessoa possa ver,
        em poucos cliques, o que os vereadores da cidade apresentaram na Câmara.
      </p>
      <h2>Princípios</h2>
      <ul>
        <li><strong>Apartidário.</strong> Sem ranking, nota, selo ou “melhor e pior”. Vereadores em ordem alfabética, sem cores de partido.</li>
        <li><strong>Com fonte.</strong> Todo número leva à lista que o compõe, e todo item leva ao documento oficial.</li>
        <li><strong>Com contexto.</strong> Quantidade não é qualidade; explicamos o que cada tipo de proposição significa.</li>
        <li><strong>Sem invenção.</strong> O que a fonte não publica aparece como lacuna, não como estimativa.</li>
        <li><strong>Privacidade.</strong> O portal não usa cookies nem rastreia visitantes, e não republica textos com dados pessoais de cidadãos.</li>
      </ul>
      <h2>Este não é o site da Câmara</h2>
      <p>
        Os documentos oficiais, a tramitação e as votações estão no site da Câmara Municipal de Pindamonhangaba:{" "}
        <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
      </p>
      <h2>Código aberto</h2>
      <p>
        O código está em <a href="https://github.com/vhonorato02/obs-vereador">github.com/vhonorato02/obs-vereador</a>. Erros nos
        dados podem ser informados <a href="https://github.com/vhonorato02/obs-vereador/issues/new?title=Erro%20nos%20dados">por lá</a>.
      </p>
    </div>
  );
}
