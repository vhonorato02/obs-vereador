const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});
const numero = new Intl.NumberFormat("pt-BR");

/** API dates have no offset; they are local time in Pindamonhangaba. */
export function dataPublicacao(data: string): string {
  const [d] = data.split(" ");
  if (!d) return data;
  const [a, m, dia] = d.split("-");
  return `${dia}/${m}/${a}`;
}

export function dataColeta(iso: string): string {
  return dataHora.format(new Date(iso));
}

export function n(x: number): string {
  return numero.format(x);
}

export function plural(x: number, um: string, varios: string): string {
  return `${n(x)} ${x === 1 ? um : varios}`;
}
