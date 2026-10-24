# Acompanhe seu Vereador — Pindamonhangaba

Portal do **Observatório Social do Brasil – Pindamonhangaba** para acompanhar o que cada vereador da Câmara Municipal de Pindamonhangaba apresentou na legislatura 2025–2028. Cada número leva à lista que o compõe, e cada item leva ao documento oficial no site da Câmara.

Não é o site oficial da Câmara e não republica seus documentos: mostra título, ementa, autoria e data, com link para o original.

## Como funciona

1. Antes do build, `scripts/collect.ts` consulta a [API de Dados Abertos da Câmara](https://www.pindamonhangaba.sp.leg.br/dadosabertos) (vereadores, proposições e normas desde 01/01/2025).
2. O coletor se identifica, espera ≥ 1 s entre consultas, trata resposta vazia como erro e para se detectar desafio anti-robô ou queda brusca de volume. **Se algo der errado, o build falha e a Vercel continua servindo a versão anterior.**
3. O resultado vira `data/generated/dataset.json` (lido pelo site) e `public/dados/*.csv|json` (dados abertos).
4. As coletas seguintes são incrementais (páginas novas + 45 dias de margem), com coleta completa a cada 30 dias. O estado fica no cache de build da Vercel (`.next/cache/acompanhe`).

## Atualizar os dados (a cada 15 dias)

No app ou no site da Vercel: projeto **acompanhe-seu-vereador** → **Deployments** → no deploy de produção mais recente, **⋯ → Redeploy** (deixe "Use existing Build Cache" marcado). Em cerca de 5 minutos o site mostra a nova data de coleta no rodapé de cada página. Se o deploy falhar, o site antigo continua no ar e o log diz o motivo.

## Desenvolvimento

```bash
npm install
npm run collect   # sem CAMARA_API_TOKEN usa a amostra real de fixtures/ (só desenvolvimento)
npm run dev
npm test          # testes (inclui a garantia número = lista)
npm run typecheck
npm run build
```

Em produção o token fica na variável de ambiente `CAMARA_API_TOKEN` da Vercel. Sem ele, o build de produção falha de propósito.

## Documentação

- `docs/research/` — pesquisa da Fase 1 (fontes, API, Power BI, design, free tiers)
- `HANDOFF.md` — estado atual e próximos passos
- `CLAUDE.md` — princípios e convenções do projeto

## Licença

Código: MIT. Dados: de origem pública (Câmara Municipal de Pindamonhangaba); cite a fonte ao reutilizar.
