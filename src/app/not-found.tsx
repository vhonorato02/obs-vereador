import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <>
      <h1>Página não encontrada</h1>
      <p>
        Este endereço não existe no portal. <Link href="/">Voltar ao início</Link>.
      </p>
    </>
  );
}
