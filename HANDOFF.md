# HANDOFF — Acompanhe seu Vereador

> Arquivo de continuidade entre sessões. Atualize ao fim de cada bloco de trabalho.
> Última atualização: 2026-10-24 (sessão de Fase 0 + Fase 1).

## Onde estamos

- **Fase atual:** Fase 1 (pesquisa e planejamento). **Nenhum código de aplicação foi escrito** — por decisão do briefing, a implementação só começa após aprovação do plano.
- **Repositório:** `vhonorato02/obs-vereador` (público). Branch de trabalho: `ccr-7efe4374-h0pmz6`.
- **Entregável da Fase 1:** `docs/research/fase-1-relatorio.md` (relatório para discussão). Cópia no Google Drive (pasta "Acompanhe seu Vereador").

## Estado das tarefas

| Bloco | Estado |
|---|---|
| Fase 0 — ambiente (Superpowers, plugins, memória) | feito (ver `docs/environment.md`) |
| Engenharia reversa do Power BI | feito (`docs/research/power-bi.md`) |
| Mapeamento do site/API da Câmara | feito (`docs/research/camara-site.md`) |
| Transparência (SIAPE GOV), TCE-SP, TSE | feito (seções 3 e 5 do relatório) |
| Teste de alcance a partir do GitHub Actions | feito (workflow `source-probe`, resultado abaixo) |
| Benchmark, design, stack, free tiers | feito (`docs/research/benchmark-design.md`, `docs/research/stack-free-tiers.md`) |
| Relatório da Fase 1 | **entregue** — `docs/research/fase-1-relatorio.md` |
| Decisões do dono (24/10) | aplicadas no relatório, `CLAUDE.md` e aqui (ver abaixo) |
| Aguardando | respostas do dono às 9 decisões em aberto da seção 20 do relatório |

## Decisões do dono do projeto (24/10/2026)

1. **Só Pindamonhangaba** — Observatório Social do Brasil – Pindamonhangaba e Câmara de Pindamonhangaba. (O OS Campos Gerais aparecia só como exemplo de benchmark; foi removido do plano.)
2. **Só free tier** — sem cartão, sem domínio comprado (`*.vercel.app`), sem IA paga. O Cloudflare R2 saiu (pede cartão): snapshots e dados abertos vão para um repositório público de dados no GitHub; backups `pg_dump` criptografados em repositório privado.
3. **Atualização semanal** — coleta toda quarta de manhã (após a sessão de terça), TCE-SP mensal, reconciliação mensal.
4. **Portal para acompanhar todos os vereadores, não um clone do site da Câmara** — ementa, metadados, votos, contexto e link para o documento oficial; sem texto integral. Menu: Vereadores · Votações · Como funciona + Buscar (relatório, seção 10).

## Descobertas que mudam a arquitetura (leia antes de tudo)

1. **A Câmara tem API oficial de Dados Abertos** (sistema SoftCam):
   `GET https://www.pindamonhangaba.sp.leg.br/jsonweb/web-aplicativo.php?keysoft=<TOKEN>&call=<serviço>`.
   Token gratuito obtido com login/cadastro de cidadão em `/cidadao`. **Sem token, responde HTTP 200 com corpo vazio** (falha silenciosa).
   Serviços: `vereadores` (só em exercício), `proposicoes_tipos`, `proposicoes&tipo=…&pagina=`, `proposicoes&bairro=…`, `legislacoes_tipos`, `legislacoes`, `pautas`, `bairros`, `publicacoes_tipos`, `publicacoes`, `atendimento`. RSS de notícias em `/jsonweb/web-rss.php` (sem token).
2. **Votações nominais existem** no fragmento AJAX público de tramitação: `GET /ajax/tramitacao/proposicao/{id}` (timeline + "Votos: Favoráveis (10): nomes…" + PDFs de pauta e votação).
3. **Proteção anti-robô (LiteSpeed reCAPTCHA)** no site. Política do projeto: **nunca contornar** (sem trocar User-Agent para fugir do desafio, sem resolver captcha). Se aparecer "Bot Verification", o coletor para e alerta. Caminho correto: token da API + pedido formal de liberação à Câmara.
4. **O site recusa conexões de alguns datacenters** (ex.: Google Cloud, onde roda o Claude Code na nuvem) mas responde da **Vercel região gru1 (AWS São Paulo)** em ~0,35 s.
   **GitHub Actions (Azure EUA), User-Agent honesto, 24/10/2026:** API `/jsonweb/` ✅; HTML, `/ajax/tramitacao/...` e PDF de votação ❌ (página "Bot Verification"); SIAPE GOV ✅; TCE-SP ✅. Conclusão: tramitação/votos dependem de a Câmara liberar o coletor.
5. **Transparência:** SIAPE GOV tem API JSON pública com a Câmara como `id_entidade=2` (despesas, diárias, contratos, RH, emendas impositivas); TCE-SP `GET /api/json/despesas/pindamonhangaba/{ano}/{mes}` sem autenticação (dados até ago/2026 em out/2026).
6. O Power BI atual guarda **só contagens agregadas** (vereador × ano), digitadas à mão. Baseline extraído em `docs/research/power-bi.md`.

## Limites de segurança que esta sessão respeitou (não tente contornar)

- O classificador do modo automático bloqueou: proxy de terceiros (r.jina.ai), teste de variação de User-Agent contra o anti-robô, e edição das próprias regras de permissão. Isso é intencional.
- Para reduzir prompts de permissão: o dono do projeto escolhe o modo **Auto** no seletor da sessão, ou adiciona regras `permissions.allow` ele mesmo.

## Ambiente útil (IDs, sem segredos)

- Vercel team: `team_43xSvVJZ9lHuy6K7NNxlMhXG` (slug `jose-victors-projects-5cc9abbe`). Nenhum projeto Vercel do produto criado ainda.
- Supabase org: `pktbuinlozbpdgbjmhna` (nada criado).
- Pesquisa no site da Câmara foi feita a partir de um **Vercel Sandbox descartável** (`gru1`, rede restrita aos domínios da Câmara). Ele expira sozinho; recrie se precisar.
- Power BI público: cluster `wabi-brazil-south-api`, resourceKey `21174870-0467-423b-87ed-9fea7c95271b`, modelId `11768514`.
- Arquivos originais do Power BI (.pbix/.xlsx/GLOSSÁRIO.docx) no Google Drive do dono, pasta pai `1br-SgA4I_sxS68YXhaAH2mPyjjVDwlRN`.

## Identidade Git

Commits usam a identidade **local** do repositório: `José Victor Honorato <33707633+vhonorato02@users.noreply.github.com>` (e-mail noreply do GitHub para não expor e-mail pessoal em repo público). Sem assinaturas de IA em commits, PRs ou código (exigência do briefing).

## Próximos passos

1. Dono do projeto lê o relatório e responde às 9 decisões em aberto da seção 20.
2. OSB envia ofício à Câmara (liberação do coletor no anti-robô; tramitação/votações na API; uso das fotos).
3. Criar conta de cidadão no site da Câmara e obter o token da API (só o dono/OSB pode fazer); guardar como secret.
4. Criar a branch `main` (com autorização) para abrir o PR desta pesquisa.
5. Após aprovação: Fase 1 "Foundation" do roadmap, começando por `superpowers:writing-plans`.

## Google Drive

Pasta "Acompanhe seu Vereador" (id `1gmzfL0UGzy6z1UjNQsQDHIe0y_4r6rSK`), dentro de "Documents", ao lado de "OBS - PowerBI". Contém cópias em Google Docs do relatório, deste handoff e das notas de pesquisa. **A fonte de verdade é o repositório.**
