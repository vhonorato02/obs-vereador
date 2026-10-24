# HANDOFF — Acompanhe seu Vereador

> Arquivo de continuidade entre sessões. Atualize ao fim de cada bloco de trabalho.
> Última atualização: 2026-10-24 (v1 publicada).

## Onde estamos

- **v1 em produção** na Vercel, projeto `acompanhe-seu-vereador` (id `prj_tduqr6ZAVAtyEGz5mJJ5JgbTOaZe`, team `team_43xSvVJZ9lHuy6K7NNxlMhXG`), ligado ao repositório `vhonorato02/obs-vereador`, **branch de produção `main`**.
- Por decisão do dono: trabalho direto na `main`, sem PR.
- **Endereço: https://acompanhe-seu-vereador.vercel.app** (público).
- Primeira coleta (24/10/2026): 16.822 proposições e 397 normas desde 01/01/2025, 377 consultas, build de 10 min. Coletas seguintes incrementais: ~1 min.
- Reconciliação com o Power BI: 2025 bate exatamente; confirmada a contagem de coautoria por coautor (`docs/research/power-bi.md` §9).

## Decisões do dono (24/10/2026)

1. Só Pindamonhangaba (Observatório e Câmara).
2. Só free tier: sem cartão, sem domínio comprado, sem IA paga.
3. Portal para acompanhar todos os vereadores, não clone do site da Câmara.
4. **Sem votações** (e, por consequência, sem presença) na v1.
5. **Atualização quinzenal feita pelo dono**: Vercel → Deployments → produção → ⋯ → Redeploy (com build cache).
6. Implementar e publicar direto em produção, na `main`.

## Arquitetura real da v1 (mais simples que o plano da Fase 1)

- Sem banco, sem admin, sem login. O plano previa Neon + Better Auth + GitHub Actions; com sem votações, atualização manual quinzenal e uma única fonte (API), nada disso se pagava.
- `scripts/collect.ts` roda no `prebuild` da Vercel, consulta a API com `CAMARA_API_TOKEN` (variável sensível da Vercel, só produção) e gera `data/generated/dataset.json` + `public/dados/` + `public/fotos/`.
- Coleta incremental usando `.next/cache/acompanhe/coleta.json` (cache de build da Vercel); completa a cada 30 dias ou com `COLETA_COMPLETA=1`.
- Qualquer falha (resposta vazia, anti-robô, formato, queda de volume) **falha o build** → a Vercel mantém a versão anterior no ar.
- Sem token fora de produção: usa `fixtures/camara-amostra.json` (amostra real) e mostra aviso.
- Detalhes da API: `docs/research/camara-api.md`.

## Comandos

`npm install` · `npm run collect` · `npm run dev` · `npm test` · `npm run typecheck` · `npm run build`

## Próximos passos possíveis

1. Conferir os números da API com o baseline do Power BI (`docs/research/power-bi.md`) e publicar a reconciliação.
2. Despesas da Câmara, diárias e emendas impositivas (SIAPE GOV / TCE-SP) — exige capturar parâmetros da API do SIAPE (H8).
3. Histórico 2021–2024 (a API tem décadas de dados).
4. Presença/votações só se a Câmara publicar na API ou o dono topar enviar as atas.
5. Concluir o inventário histórico interrompido (`camara-api.md`).

## Limites de segurança (não contornar)

- Nunca contornar o anti-robô da Câmara; o coletor para se o detectar.
- O classificador bloqueia proxy de terceiros, variação de User-Agent contra o anti-robô e edição das próprias permissões.
- Token só na Vercel; nunca em commit, log ou chat.

## Identidade Git

Local ao repo: `José Victor Honorato <33707633+vhonorato02@users.noreply.github.com>`. Sem assinaturas de IA.

## Google Drive

Pasta "Acompanhe seu Vereador" (id `1gmzfL0UGzy6z1UjNQsQDHIe0y_4r6rSK`). A fonte de verdade é o repositório.
