# Ambiente de trabalho (Claude Code)

Preparado na Fase 0 (24/10/2026). Sessões do Claude Code na nuvem rodam em contêiner efêmero: o que é instalado "globalmente" no contêiner some no fim da sessão. Por isso, **o que importa para o projeto fica declarado no repositório** (`.claude/settings.json`), e o que vale para todos os projetos fica na conta do claude.ai.

## Ferramentas

| Ferramenta | Versão | Origem | Escopo | Função | Observações |
|---|---|---|---|---|---|
| **Superpowers** | 6.4.2 | Jesse Vincent (obra), via diretório oficial da Anthropic (parceiro verificado) | Projeto (`.claude/settings.json`) | brainstorming, writing-plans, executing-plans, TDD, systematic-debugging, verification-before-completion, requesting/receiving-code-review, subagent-driven-development, git worktrees | Inclui hook `SessionStart`. Licença MIT, upstream `github.com/obra/superpowers` |
| **frontend-design** | build 58267944 | Anthropic (diretório oficial) | Projeto | direção visual e tipográfica de UI, evitar visual "template" | Usar junto com `docs/research/benchmark-design.md` |
| **Playwright MCP** | build 7d7dbbd9 | Microsoft (diretório oficial) | Projeto | navegador controlado pelo Claude: QA visual, E2E exploratório, captura de requisições de SPAs | Chromium já vem no contêiner (`/opt/pw-browsers`, Playwright 1.63) |
| security-guidance | 2.0.13 | Anthropic | Conta (claude.ai) | alertas ao editar workflows, auth, SQL etc. | já ativo |
| modern-web-guidance | 0.0.194 | Anthropic | Conta | boas práticas web atuais | já ativo |
| design (accessibility-review, ux-copy, design-system) | — | Anthropic | Conta | revisão de acessibilidade e microcopy | já ativo |
| Skills nativas `code-review`, `security-review`, `simplify` | — | Claude Code | Nativo | revisão de diff, segurança, simplificação | já disponíveis |
| MCP GitHub | — | conector claude.ai | Conta | PRs, Actions, logs | escopo restrito a `vhonorato02/obs-vereador` nesta sessão |
| MCP Vercel | — | conector claude.ai | Conta | projetos, deploys, logs, **Sandbox** (usado na pesquisa) | time `team_43xSvVJZ9lHuy6K7NNxlMhXG` |
| MCP Supabase | — | conector claude.ai | Conta | alternativa conservadora de banco | nada criado |
| MCP Google Drive | — | conector claude.ai | Conta | cópia do relatório e leitura dos arquivos do Power BI | — |
| MCP Context7 | — | conector claude.ai | Conta | documentação atualizada de bibliotecas (Next.js, Drizzle, Zod…) | usar antes de escrever código de framework |
| MCP Brandfetch | — | conector claude.ai | Conta | dados de marca (logo e cores do OSB) | — |
| Claude Code | 2.1.310 | Anthropic | Contêiner | — | — |
| Node.js / pnpm / Bun | 22.22 / 10.28 / 1.4.4 | contêiner | Contêiner | runtime e gerenciador de pacotes | o projeto deve fixar a versão do Node em `.nvmrc`/`engines` |
| Python / uv | 3.13 / 0.11.32 | contêiner | Contêiner | só se surgir PDF tabular difícil | — |
| Docker / psql | 29.9 / 16.15 | contêiner | Contêiner | Postgres local e Testcontainers | — |

## Memória e continuidade

| Mecanismo | Arquivo | Uso |
|---|---|---|
| Instruções do projeto | `CLAUDE.md` | princípios, convenções, comandos, limites — lido em toda sessão |
| Passagem de bastão | `HANDOFF.md` | estado atual, descobertas críticas, próximos passos — atualizar ao fim de cada bloco |
| Pesquisa versionada | `docs/research/` | Power BI, site da Câmara, benchmark/design, stack/free tiers, relatório da Fase 1 |
| Decisões | `docs/adr/` (a partir da aprovação) | uma ADR por decisão arquitetural relevante |

A memória nativa do Claude Code não persiste entre contêineres efêmeros; por isso tudo que importa está no repositório.

## Não instalado (e por quê)

| Item | Motivo |
|---|---|
| MCP do Neon / Sentry | só faz sentido depois de escolher e criar os serviços (pós-aprovação) |
| Variantes do Superpowers (ZSL, Decibel, sdd-superpowers) | duplicariam o Superpowers original |
| Plugin "code-review" do diretório | duplica a skill nativa `code-review` e o fluxo do Superpowers |
| Plugins de conta irrelevantes (Unity, LSEG, Twilio, QuickBooks…) | já estão sincronizados na conta; não foram removidos (não são deste projeto), mas não devem ser usados aqui |

## Permissões

Em sessão na nuvem, o modo de permissão é escolhido pelo dono no seletor ao lado da caixa de prompt (use **Auto**). O Claude não edita as próprias regras de permissão (bloqueio intencional de "auto-modificação"). Para liberar comandos de forma persistente, o dono adiciona `permissions.allow` em `.claude/settings.json`.
