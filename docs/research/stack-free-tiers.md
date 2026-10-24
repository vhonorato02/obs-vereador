# Stack e free tiers — "Acompanhe seu Vereador" (Câmara Municipal de Pindamonhangaba-SP)

> Pesquisa feita em **24/10/2026**. Todos os limites e preços abaixo foram conferidos nesta data nas páginas oficiais citadas (seção [Fontes](#fontes), referências `[Sxx]`). Quando a página não mostra data, isso está indicado. Nada foi comprado, nenhuma conta foi criada.
> Legenda: ✅ verificado na fonte oficial · ⚠️ divergência entre fontes ou fonte secundária · 🔎 inferência minha (não é afirmação da fonte).

---

## 0. TL;DR

**Recomendação:** **Next.js 16.4 (App Router + Cache Components) na Vercel** + **Neon Postgres (região São Paulo)** + **Drizzle ORM 0.45 (versão fixada) + Zod 4** + **Better Auth** para o admin + **coletores em TypeScript rodando no GitHub Actions (repositório público)**, disparados por um **Cron Trigger do Cloudflare Workers (grátis)** via `workflow_dispatch` + **snapshots brutos no Cloudflare R2** + **Sentry + Healthchecks.io + UptimeRobot**. Busca com **Postgres FTS (`portuguese` + `unaccent` + `pg_trgm`)**.

- Custo da fase inicial: **US$ 0/mês** se a Vercel Hobby for aceitável (veja a ressalva dos termos de uso na §4.1), ou **US$ 20/mês** com a Vercel Pro. Com crescimento: **cerca de US$ 25–40/mês**. Domínio: **R$ 40/ano**.
- **O que evita a armadilha do "cron de hora em hora caro":** a Vercel Hobby só aceita cron **1×/dia** [S1]. A ingestão não roda na Vercel. Ela roda no GitHub Actions, que é grátis em repositório público [S10], e o disparo vem do Cloudflare (5 cron triggers grátis por conta [S33]). Assim também se evitam os atrasos do `schedule` do GitHub e a desativação dele após 60 dias sem atividade [S9].

---

## 1. Frameworks (estado em out/2026)

| Framework | Versão estável atual | Maturidade / pontos-chave | Encaixe neste projeto |
|---|---|---|---|
| **Next.js** | **16.4.3** (npm, 23/10/2026) [S66]. 16.4 lançado em 06/10/2026 [S55] | O App Router já está maduro. A partir da 16.4, **Cache Components** (`'use cache'`, `cacheLife`, `cacheTag`) é **recomendado para todo app novo e vem ativado por padrão no `create-next-app`**. Ele vira o padrão no Next 17 [S55]. Partial Prefetching agora faz parte do modelo. A 16.4 trouxe **`ensureStatic`**, que **faz o build falhar** se um componente dinâmico "vazar" para uma rota que deveria ser estática [S55]. Isso é ótimo para controlar custo. **Adapter API estável desde a 16.2** (25/03/2026), com suíte pública de testes de adapters [S58]. React 19.3. `middleware` foi renomeado para **`proxy.ts`**, que roda **por padrão no runtime Node** [S56]. Self-hosting com `next start` funciona sem configuração em instância única, incluindo Cache Components [S57]. **Ponto de atenção:** ritmo intenso de releases de segurança em 2026 (mensais, mais várias fora de ciclo: 22/09, 30/09, 14/10/2026) [S55], e as CVEs críticas de RSC em dez/2025 [S55]. | **Melhor escolha.** Combina páginas públicas estáticas/ISR com revalidação por tag disparada pela ingestão, SEO (Metadata API, sitemap) e admin com Server Functions no mesmo app. Tem o melhor suporte na Vercel e é portável (Node/Docker/OpenNext). |
| **Astro** | **7.4.2** (npm) [S66]. 7.0 em 22/06/2026, 7.4 em 15/10/2026 [S59] | Compilador em Rust, Vite 8 (Rolldown), builds 15–61% mais rápidos, **route caching estável** (`Astro.cache`), "Advanced Routing" compatível com Hono [S59]. Builds estáticos incrementais experimentais na 7.2 [S59]. **O time do Astro foi adquirido pela Cloudflare** (anúncio de 16/01/2026; o projeto continua MIT e com governança aberta) [S60]. Node ≥ 22.23.4 [S66]. | **Forte 2º lugar.** É o melhor para conteúdo puro com zero/mínimo JS. Para o admin (formulários, tabelas de correção, audit trail) exige mais trabalho manual ou "ilhas" React. Alternativa natural se a hospedagem for Cloudflare. |
| **SvelteKit** | **3.1.0** (npm) [S66]. **3.0 lançado em 01/10/2026** [S61] | Major com só ~3 semanas de vida. A config passou para o `vite.config.ts` e `$lib` virou `#lib` [S61]. **Remote functions ainda não estão estáveis** e Async Svelte ainda exige flag experimental [S61]. | Excelente DX, mas o major é imaturo e o ecossistema de auth/admin é menor. Não recomendo agora. |
| **React Router** (ex-Remix) | **8.5.0** (npm) [S66]. v8 em 17/06/2026 [S62] | Quebras pequenas em relação à v7. ESM-only, Node ≥ 22.22, framework/data/declarative mode mantidos. **RSC ainda instável** [S62]. **React Router v6 e Remix v2 chegaram ao EOL.** Majors passam a ser anuais [S62]. **Remix 3** está em RC desde 31/08/2026 e é outro framework [S62]. | Sólido e muito portável, mas não tem primitiva de ISR/cache por tag: o cache depende de `Cache-Control` e CDN. Remix 3 (RC): evitar. |

**Por que Next.js:** o site é majoritariamente estático/ISR, mas tem milhares de páginas de entidades (vereadores, proposições, votações) que mudam quando a ingestão roda. Com `'use cache'` + `cacheTag('vereador:123')` + `revalidateTag` chamado pela ingestão, só o que mudou é regenerado, e `ensureStatic` garante que páginas públicas nunca virem SSR por acidente, que é o que gera custo [S55]. O admin pequeno cabe no mesmo app. Riscos e mitigação: ① cadência de patches de segurança → Renovate/Dependabot + janela semanal de update; ② **não colocar autorização no `proxy.ts`**: a própria doc manda verificar auth dentro de cada Server Function [S56]. Isso também evita a incompatibilidade "Node middleware" do OpenNext/Cloudflare [S38]; ③ não usar flags `experimental.*`.

---

## 2. ORM / query builder e validação

### 2.1 ORM

| | **Drizzle ORM** | **Prisma ORM** | **Kysely** |
|---|---|---|---|
| Versão | **0.45.4 estável** (tag `latest`). **1.0.0-rc.5 publicado em 21/10/2026**, com várias quebras: RQB lança erro com `undefined` em `where`, mudança em `withReplicas` etc. [S63][S66] | **7.10.1 estável** (`@prisma/client`). **Prisma ORM 8 está em RC**, com GA "esperada para outubro de 2026" [S29]. ⚠️ **A tag npm `latest` do CLI `prisma` já aponta para `8.0.0-rc.27`** (23/10/2026) [S66][S29]. O Prisma 7 recebe correções por 18 meses após o GA do 8 [S29] | **0.29.7** (0.30 em beta) [S66]. MIT, Node ≥ 22 |
| Migrations | `drizzle-kit generate` gera **SQL versionado** que você revisa e commita. Aceita migrations SQL customizadas (configuração de text search, triggers, colunas geradas) | `prisma migrate` maduro. Na v8, migrations em TypeScript e índices parciais/de expressão [S29] | Você escreve as migrations à mão (API `Migrator`). Não gera schema |
| FTS / SQL cru | FTS via template `sql\`\``. Índices GIN declarados no schema. **Não há tipo `tsvector` nativo** (contorno: custom type ou SQL) [S64] | **FTS no Postgres ainda é preview** (`fullTextSearchPostgres`) [S30]. Tipos de extensão aparecem como `Unsupported` e exigem raw/TypedSQL [S28] | SQL tipado de ponta a ponta. FTS sai natural com `sql` |
| Edge/serverless | Drivers HTTP/WebSocket (Neon), `postgres-js`, `pg`. Bundle leve | v7 é "Rust-free" com driver adapters. Funciona, mas o bundle é maior | Leve, roda em qualquer runtime com dialeto adequado |
| Licença | Apache-2.0 [S66] | Apache-2.0 | MIT [S66] |

**Recomendação:** **Drizzle 0.45.x com versão exata fixada** (`"drizzle-orm": "0.45.4"`), migrations SQL revisadas em PR e upgrade para a 1.0 só depois do GA (guia "v0 → v1" no site). Motivos: SQL-first (FTS, `unaccent`, `pg_trgm` e triggers de auditoria são SQL de qualquer jeito), migrations legíveis e adapter oficial do Better Auth [S76]. **Kysely** é a alternativa se o time preferir query builder puro. **Prisma, agora não:** a transição 7→8 está em andamento, o `latest` aponta para RC e o FTS ainda é preview.

### 2.2 Validação

| | **Zod** | **Valibot** | **ArkType** |
|---|---|---|---|
| Versão | **4.6.7** [S66]. "Zod 4 is stable", com `zod/mini` e conversão nativa para JSON Schema [S65] | **1.5.0** [S66] | **2.2.9** [S66] |
| Pontos | Maior ecossistema (Better Auth, formulários, OpenAPI). Core "2kb gzip" segundo o site [S65] | API modular, o menor bundle no cliente | Muito rápido, sintaxe parecida com tipos TS |

**Recomendação: Zod 4.** Usar no parser (validar o que foi extraído do HTML/JSON antes do upsert), nos formulários do admin e nos contratos de exportação. Para formulários no cliente, `zod/mini` reduz o bundle. 🔎 Os três implementam Standard Schema, então trocar depois é barato.

---

## 3. Postgres gerenciado: free tiers atuais

| Provedor | Armazenamento free | Compute | Pausa / inatividade | Branches | Backup / PITR (free) | Egress | `pg_trgm`/`unaccent` | Pooling | Próximo degrau |
|---|---|---|---|---|---|---|---|---|---|
| **Neon** [S17][S18][S19][S20] | **1 GB/projeto** (20 GB no total), até 100 projetos | **100 CU-h/projeto/mês**, autoscaling até 2 CU | **Scale-to-zero após 5 min, não dá para desligar no Free** (cold start) | 10/projeto | Histórico de **6 h** (até 1 GB). Sem restore instantâneo | **5 GB/projeto** | ✅ PG16/17/18 | ✅ incluso | **Launch:** pay-as-you-go **sem mínimo**: US$ 0,106/CU-h, US$ 0,35/GB-mês |
| **Supabase** [S21][S22][S23] | **500 MB**/projeto, **2 projetos ativos** | Compartilhado, 500 MB RAM | **Pausa após 7 dias de baixa atividade no banco.** Restaurável por até 1 ano | Não (só no Pro) | **Sem backups automáticos** | 5 GB | ✅ (lista de extensões) [S26] | ✅ | **Pro US$ 25/mês** (inclui US$ 10 de compute): 8 GB de disco, 100 GB de storage, 250 GB de egress, backups diários por 7 dias, sem pausa |
| **Prisma Postgres** [S27][S28] | **2 GB**, 50 bancos | Medido em **200.000 operações/mês** | A página não informa | — | Sem backups no Free (diários a partir do Starter) | "Ilimitado" | ✅ | 10 conexões pooled + 10 diretas. Queries pooled limitadas a 10 min | **Starter US$ 10/mês**: 1 M ops, 10 GB, backups de 7 dias |
| **Xata** [S31] | **Sem free tier na nuvem** (trial de 14 dias). Open source self-hosted | — | Scale-to-zero em todos os planos | Sem cobrança por branch | Não informado | — | Não informado | — | Micro ~US$ 9/mês + US$ 0,28/GB |
| **Aiven** [S32] | **1 GB** | 1 CPU / 1 GB RAM dedicada | Pode desligar serviços "sem uso por período prolongado" (sem número) | — | "Single backup only for disaster recovery" | — | 🔎 provável (não verificado) | **Sem pooling** | Developer **US$ 5/mês** (8 GB). Não dá para escolher região |
| Render Postgres free [S46] | 1 GB | — | **Expira 30 dias após a criação** (+14 de carência) e depois é apagado | — | — | — | — | — | (não recomendado) |

**Recomendação: Neon, região `aws-sa-east-1` (São Paulo)** [S20]. É o mais generoso em armazenamento e compute para o volume do projeto (dezenas a centenas de milhares de linhas cabem em < 1 GB com folga), tem as extensões necessárias, branches por PR (bom para testar migrations) e um degrau pago **sem mínimo**.
- 🔎 Estimativa de compute: ingestão de hora em hora com ~3 min de trabalho + 5 min até suspender dá ≈ 8 min/h ≈ 96 h/mês × 0,25 CU ≈ **24 CU-h**. Somando tráfego (páginas majoritariamente em cache) e admin, fica bem abaixo de 100 CU-h. **Configure o autoscaling com máximo de 0,25–0,5 CU** para não queimar a cota.
- **Backups próprios são obrigatórios:** a janela de 6 h não basta. Rode um `pg_dump -Fc` noturno pelo GitHub Actions para o R2/B2, com retenção de 30 dias + 12 mensais via lifecycle.

**Supabase** é a escolha da opção conservadora (§13): Postgres, Storage, Auth e pg_cron num lugar só, e o Pro elimina pausa e dá backups. O Free fica arriscado sem backup, mas a pausa por inatividade não ocorre com ingestão horária.

---

## 4. Hospedagem: free tiers atuais

### 4.1 Vercel

| Item | **Hobby (US$ 0)** | **Pro** |
|---|---|---|
| Preço | Grátis | **US$ 20/mês por developer seat, com US$ 20 de crédito incluso**. Viewer seats grátis [S3][S5] |
| **Cron** | **100 jobs/projeto, mínimo 1×/dia, precisão de ±59 min.** Expressões como `0 * * * *` **falham no deploy** [S1] | 100 jobs, **a cada minuto**, precisão de minuto [S1] |
| Duração de função | **300 s (padrão e máximo)**, 2 GB / 1 vCPU [S2] | 300 s por padrão, até 800 s (1800 s em beta), até 4 GB / 2 vCPU [S2] |
| Tráfego | **100 GB Fast Data Transfer**, 10 GB Fast Origin Transfer, **1 M CDN requests**, 1 M invocações, **4 h Active CPU**, 360 GB-h de memória [S3] | 1 TB de transferência e 10 M CDN requests inclusos, depois sob demanda [S5]. "Flat Rate CDN" [S4] |
| Ao estourar | **Espera 30 dias** para voltar a usar o recurso [S3] | Cobrança sob demanda, com Spend Management [S3] |
| Logs runtime | **1 hora** [S2] | 1 dia [S2] |
| Deploys | 100/dia [S2] | 6.000/dia |
| Blob | 1 GB, **10 mil ops simples e 2 mil ops avançadas/mês** (upload = op avançada) [S7] | Por uso |
| Git | ⚠️ **"Vercel does not support connecting a project on your Hobby team to Git repositories owned by Git organizations"** [S2] | OK |
| Região SP | `gru1` (São Paulo) existe. Funções rodam por padrão em `iad1` [S8] | idem |

**Termos de uso (ONG):**
- A doc diz: *"Hobby teams are restricted to non-commercial personal use only."* Uso comercial é *"any Deployment used for the purpose of financial gain of anyone involved in any part of the production of the project, **including a paid employee or consultant writing the code**"*. **"Asking for Donations does not fall under commercial usage."** [S4] A página de preços repete: *"Our Hobby plan is for personal, non-commercial use"* [S5].
- 🔎 **Leitura:** uma ONG sem anúncios, sem venda e mantida **só por voluntários** tende a ficar fora da definição de "comercial". Mesmo assim, o site é **institucional, não "pessoal"**, e a Hobby não conecta repositórios de **organizações** do GitHub [S2]. A recomendação é pedir **confirmação por escrito ao suporte da Vercel** (a doc manda contatar o suporte em caso de dúvida [S4]). **Se houver dev ou consultor remunerado, o uso é comercial e exige Pro.**
- **Programa open source:** US$ 3.600 em créditos ao longo de 3 anos. **ONGs são elegíveis se forem "fully open source"**, mas as **inscrições estão fechadas** (coorte Spring 2026 listada) [S6]. Não há desconto oficial para nonprofits na página de preços [S5].

### 4.2 Cloudflare Workers / Pages

| Item | **Workers Free** | **Workers Paid (mín. US$ 5/mês por conta)** |
|---|---|---|
| Requests | **100.000/dia** [S33] | 10 M/mês inclusos, depois US$ 0,30/M [S34] |
| **CPU** | **10 ms por request e 10 ms por Cron Trigger** [S33] | Até 5 min por request (padrão 30 s). **Cron: 30 s (intervalo < 1 h) ou 15 min (intervalo ≥ 1 h)** [S33] |
| Cron Triggers | **5 por conta**, UTC, propagação de até 15 min [S33][S35] | 250 por conta [S33] |
| Bundle | 64 MiB descomprimido ("no compressed size limit") [S33]. ⚠️ A doc do OpenNext ainda fala em 3 MiB (Free) / 10 MiB (Paid) comprimidos [S38]. Teste o deploy | idem |
| R2 | **10 GB-mês, 1 M ops classe A, 10 M ops classe B, egress grátis** [S36]. **Exige assinatura do R2 via checkout com meio de pagamento** [S37] | US$ 0,015/GB-mês, US$ 4,50/M classe A, US$ 0,36/M classe B [S36] |
| D1 / KV / Hyperdrive / Queues | D1 com 5 GB e 5 M linhas lidas/dia. KV com 1 GB. **Hyperdrive com 100 mil queries/dia**. Queues com 10 mil ops/dia [S34][S39] | Maiores ou ilimitados [S34] |
| Next.js | **OpenNext (`@opennextjs/cloudflare` 1.20.13)** suporta Next 16 com App Router, ISR, PPR, `'use cache'` e `after`. ⚠️ **"Node Middleware" não é suportado** (o `proxy.ts` do Next 16 usa Node por padrão [S56]) [S38][S66]. **Vinext 1.0** (28/09/2026) reimplementa o Next sobre Vite, com suporte **limitado** a `'use cache'` [S41] | — |
| Pages | Continua suportado, mas **todo o investimento vai para Workers**. Para projetos novos, use Workers com Static Assets [S40] | — |
| Programa social | **Project Galileo:** recursos do plano Business de graça (WAF, CDN, **Workers**, Zero Trust) para organizações de direitos humanos, sociedade civil, jornalismo e democracia, com indicação de parceiro [S42] | — |

🔎 Com **10 ms de CPU**, SSR de Next.js e parsing de HTML/PDF provavelmente estouram no Free. Para app Next.js ou coletores dentro do Worker, conte com o **Paid (US$ 5)**. Para um **dispatcher de cron** (que só faz um `fetch`, e espera de rede **não conta** como CPU [S33]), o Free sobra.

### 4.3 Outros

| Provedor | Free tier atual | Preço de entrada | Observações |
|---|---|---|---|
| **Netlify** [S43][S44][S45] | **300 créditos/mês com limite rígido** (sem recarga). **Deploy de produção = 15 créditos**, banda = 20 créditos/GB, compute = 10 créditos/GB-h, 2 créditos por 10 mil requests | Personal US$ 9 (1.000 créditos). Pro US$ 20 | 🔎 300 créditos ≈ 20 deploys/mês se nada mais for usado. **Scheduled Functions: limite de 30 s de execução** |
| **Render** [S46] | Web service hiberna após **15 min**. 750 h/mês. **Postgres free apagado após 30 + 14 dias**. **Sem cron no free** | — | Não serve para este caso |
| **Fly.io** [S47] | **Sem free tier para orgs novas.** Trial de 2 h de Machine ou 7 dias | shared-cpu-1x 256 MB: **US$ 2,19/30 dias** (iad/ewr). Volume US$ 0,15/GB. Egress América do Sul US$ 0,04/GB. Managed Postgres a partir de US$ 38 | Bom como plano B de container |
| **Railway** [S48][S49] | Free US$ 0 com **US$ 1/mês de crédito** (1 vCPU / 0,5 GB). Trial com US$ 5 por 30 dias | Hobby **US$ 5/mês** (US$ 5 de uso) | ⚠️ **Incidente de segurança em 21/10/2026:** variáveis de ambiente possivelmente expostas, rotação de segredos recomendada a todos, **deploys pausados** [S49] |
| **VPS** | Oracle Always Free: A1 com **2 OCPU / 12 GB**, 200 GB de block, só na home region, **reclamação de instância ociosa** [S52] | **Hetzner CX23 €5,99/mês** (2 vCPU / 4 GB / 40 GB / 20 TB), **"currently unavailable"** em 24/10/2026 [S50]. **AWS Lightsail US$ 5** (0,5 GB) com região São Paulo, que tem **metade** da franquia de transferência [S51] | Coolify self-hosted é grátis. Coolify Cloud custa US$ 5/mês [S53] |

---

## 5. Agendamento da ingestão

| Opção | Frequência mínima | Duração | Custo | Problemas conhecidos |
|---|---|---|---|---|
| **GitHub Actions (`schedule`), repo público** | **5 min** [S9] | **6 h por job** [S11] | **Grátis** em repo público (runners padrão) [S10] | **Atrasos em alta carga; jobs na fila podem ser descartados; evite o minuto 0** [S9]. **Desativado automaticamente após 60 dias sem atividade no repositório público** [S9][S12]. Roda só na branch padrão. Agora aceita `timezone:` IANA [S9]. ⚠️ Termos: Actions não deve ser usado *"as part of a serverless application"* nem para atividade *"unrelated to the production, testing, deployment, or publication of the software project"* (vigência 27/08/2026) [S14] |
| **GitHub Actions (`workflow_dispatch` via API)** | Quando chamado | 6 h | Grátis | `POST /repos/{o}/{r}/actions/workflows/{id}/dispatches`, que retorna 200 com `workflow_run_id` [S13]. 🔎 A regra dos 60 dias está documentada para **workflows agendados**. Um workflow só com `workflow_dispatch` não é afetado |
| **Vercel Cron** | Hobby: **1×/dia (±59 min)**. Pro: 1 min [S1] | Limite da função (300 s no Hobby) [S2] | Hobby grátis. Pro US$ 20 | Inviável para coleta horária no Hobby |
| **Cloudflare Cron Triggers** | Até a cada minuto [S35] | Free: **10 ms de CPU**. Paid: 30 s (intervalo < 1 h) ou 15 min (≥ 1 h) [S33] | Free: 5 triggers. Paid: US$ 5 | Runtime Workers (não é Node completo: sem Playwright, PDFs pesados são difíceis) |
| **Supabase pg_cron / Edge Functions** | **A cada 1 s** [S24] | Recomendado ≤ 10 min por job e ≤ 8 jobs simultâneos [S24]. Edge Functions: **150 s de wall clock (Free) e 2 s de CPU por request** [S25] | Incluso | Deno. Parsing pesado em 2 s de CPU é arriscado |

**Combinação recomendada (custo zero e robusta):**
1. **Executor:** GitHub Actions no repo público (Node 24, `timeout-minutes: 20`, `concurrency: { group: ingest, cancel-in-progress: false }`, `permissions: contents: read`, actions fixadas por SHA). O workflow `ingest.yml` tem **só** `workflow_dispatch` (com input `collector`).
2. **Relógio:** um **Worker do Cloudflare (Free)** com Cron Trigger (ex.: `17 * * * *`) que só chama a API `dispatches`. Um `fetch` consome bem menos que 10 ms de CPU [S33]. O token (PAT fine-grained ou GitHub App) fica em secret do Worker. 🔎 **Tokens expiram:** anote a data e deixe o Healthchecks avisar.
3. **Rede de segurança:** um `watchdog.yml` com `schedule` diário (fora do minuto 0) que verifica a última execução bem-sucedida e redispara se estiver velha. Se esse workflow for desativado pelos 60 dias, o principal continua funcionando.
4. **Heartbeat:** cada coletor faz ping no **Healthchecks.io** com `/start`, sucesso e `/fail` (ou código de saída). Período de 1 h e graça de 20 min [S69]. Se o Worker, o token ou o Actions falharem silenciosamente, chega alerta.
5. **Plano B portátil:** os coletores são **scripts Node de CLI** (`node dist/ingest.js --collector=x`), sem dependência do Actions. Migram em minutos para Vercel Pro Cron, cron de VPS ou container no Fly.
6. 🔎 **Teste cedo se o site da Câmara aceita requisições dos IPs dos runners do GitHub** (datacenters fora do Brasil). Sites públicos às vezes bloqueiam IP estrangeiro ou de nuvem. Em teste pontual a partir de IP de datacenter (24/10/2026), `www.pindamonhangaba.sp.leg.br` respondeu HTTP 200 uma vez e falhou de forma intermitente nas tentativas seguintes. É inconclusivo e pode ter sido o proxy usado no teste. Se houver bloqueio, use um runner self-hosted ou um VPS em São Paulo.
7. Sobre os termos do GitHub [S14]: 🔎 o argumento é que os coletores fazem parte do software do projeto e da *publicação* dos dados (o mesmo padrão de "git scraping" de vários projetos cívicos). É defensável, mas é uma zona cinzenta, e por isso o item 5 existe.

---

## 6. Snapshots brutos (HTML/JSON/PDF, alguns GB ao longo dos anos)

| Opção | Free atual | Prós | Contras |
|---|---|---|---|
| **Cloudflare R2** | **10 GB-mês, 1 M classe A, 10 M classe B, egress grátis** [S36] | API S3 (portável), sem custo de egress (serve também as exportações CSV/JSON públicas), lifecycle | Exige **cartão** para ativar. O uso não tem teto, então configure alertas [S37] |
| **Backblaze B2** | **10 GB grátis**. Egress grátis até 3× o armazenado. Classes A/B/C grátis. US$ 6,95/TB [S54] | Barato, API S3 | ⚠️ A página não tem data e exibia aviso de "staging". Reconfirme antes de contratar |
| Supabase Storage | 1 GB (Free) [S21] | Integrado se usar Supabase | Pouco espaço |
| **Vercel Blob (Hobby)** | 1 GB, **2.000 ops avançadas/mês** (cada upload conta) [S7] | Simples na Vercel | 🔎 50 snapshots/h ≈ 36 mil uploads/mês, **~18× a cota**. O bloqueio dura 30 dias [S7]. **Não usar** |
| Postgres (`bytea`, TOAST) | Consome a cota do banco (Neon 1 GB, Supabase 500 MB) | Transacional | Enche o banco, encarece backups e dumps. Só para metadados |
| Repositório git público ("dados-brutos") | Recomendado < 1 GB e fortemente < 5 GB. **Arquivo > 100 MiB é bloqueado** [S15][S16] | Transparência e diffs auditáveis | PDFs binários incham o repo. Serve só para HTML/JSON normalizado |

**Recomendação: R2**, com chave por conteúdo: `raw/{fonte}/{yyyy}/{mm}/{sha256}.{ext}.gz`, gzip ou zstd. Os metadados ficam no Postgres (`snapshots`: url, fetched_at, status HTTP, etag, sha256, bytes, chave R2, collector_run_id). **Deduplique por sha256** e só grave quando o conteúdo mudar.
- 🔎 Ordem de grandeza: 30 URLs/h × 15 KB comprimidos × 20% de mudança ≈ 65 MB/mês de HTML. Somando PDFs, cabe em 10 GB por anos. Depois disso, o custo é de US$ 0,015/GB-mês [S36].
- Se a ONG **não puder cadastrar cartão**, use B2 (confirme a exigência de cartão) ou um repositório git só para HTML/JSON, com PDFs em B2.

---

## 7. Observabilidade free

| Ferramenta | Free atual | Uso aqui |
|---|---|---|
| **Sentry Developer** [S67] | **1 usuário**, 5 mil erros, 5 M spans, 50 replays, **1 cron monitor**, 1 uptime monitor, 5 GB de logs, 30 dias | Erros do Next.js (`@sentry/nextjs` 11.9 [S66]) e dos coletores. **Open-Source Sponsorship** para projeto com licença "Apache or MIT": 5 M erros, 500 cron monitors, 25 uptime monitors etc., sem prazo [S68]. Vale pedir |
| **Healthchecks.io** [S69] | Hobbyist: **20 checks**, 100 registros de log por check. **Business é grátis para open source e nonprofits, sob pedido**. Código BSD-3 e self-hostable | **Heartbeat dos coletores e do backup** |
| **UptimeRobot** [S70] | **50 monitores com intervalo de 5 min**, 1 status page, e-mail. Termos atuais (dateModified 24/06/2026): *"available for any use, including commercial"*, e há assinaturas patrocinadas para nonprofit/open source | Uptime do site e da API de exportação, status page pública |
| Better Stack [S71] | 10 monitores e heartbeats, 3 GB de logs com 3 dias de retenção, 100 mil exceções. Descrito como **"personal projects"** | Alternativa |
| Grafana Cloud [S72] | 10 mil séries, **50 GB de logs**, 14 dias, 3 usuários | Se quiser dashboards |
| Axiom [S73] | 500 GB/mês de "data loading compute", 30 dias, 25 GB de storage | Logs estruturados, se necessário |

**Para começar basta:** Sentry (erros) + Healthchecks.io (heartbeat de cada coletor e do backup) + UptimeRobot (uptime e status page) + uma **tabela `ingestion_runs`** no Postgres (início, fim, status, contagens, erros, snapshot ids) exibida no admin. Os logs de runtime da Vercel duram só 1 h no Hobby [S2], então logs JSON relevantes vão para o Sentry ou para essa tabela. Grafana/Axiom só se surgir necessidade.

---

## 8. Autenticação do admin (poucos usuários)

| Opção | Status (out/2026) | Observações |
|---|---|---|
| **Better Auth** | **1.7.12** (MIT) [S66]. Adapter Drizzle oficial com geração de schema por CLI [S76]. Plugins de **2FA (TOTP + backup codes)** e **passkey (`@better-auth/passkey`)** [S76]. **Juntou-se à Vercel em 07/07/2026**, com compromisso declarado de continuar framework- e platform-agnostic [S75] | **Recomendado** |
| Auth.js / NextAuth v5 | *"The Auth.js project is now part of Better Auth"* [S74]. Desde 22/09/2025 a equipe do Better Auth mantém o projeto com **correções de segurança e de urgência** e **recomenda Better Auth para projetos novos** [S74]. `next-auth@5` continua em **beta** (`5.0.0-beta.32`) [S66] | Não iniciar com ele |
| Clerk (Hobby) | 50 mil MRU, até 3 seats no dashboard, magic link e e-mail code. **Passkeys e MFA só no Pro (US$ 25/mês, ou US$ 20 anual)**. A marca Clerk não pode ser removida [S77] | Vendor externo e dados de usuários fora do seu banco. Sem MFA no free |
| Supabase Auth | 50 mil MAU no Free [S21] | Faz sentido na opção B |
| Lucia | **"Lucia was deprecated in March 2025"**. Hoje é recurso didático [S78] | Não usar como biblioteca |

**Recomendação:** Better Auth com Drizzle, nesta configuração:
- **Cadastro desligado.** Usuários convidados por seed ou CLI, com papéis `admin` e `editor`.
- **E-mail + senha com TOTP obrigatório**, ou **passkeys** como fator principal. Magic link é opcional e exige provedor de e-mail transacional.
- Sessões em banco e rate limiting no login.
- **Autorização checada em toda Server Function e Route Handler**, nunca só no `proxy.ts` [S56].
- **Audit trail:** tabela `audit_log` append-only (ator, ação, entidade, diff JSON antes/depois, IP, user-agent, timestamp) gravada **na mesma transação** da correção manual, mais trigger no Postgres como rede de segurança. Correções manuais ficam numa tabela `overrides` separada, aplicada **por cima** do dado coletado. Assim a próxima ingestão não apaga a correção e dá para auditar "coletado × corrigido".

---

## 9. Busca

**Postgres FTS basta** para dezenas ou centenas de milhares de registros:
```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TEXT SEARCH CONFIGURATION pt_unaccent (COPY = portuguese);
ALTER TEXT SEARCH CONFIGURATION pt_unaccent
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, portuguese_stem;
-- Coluna tsvector mantida por trigger ou por coluna gerada com wrapper IMMUTABLE
-- (unaccent() é STABLE e não pode ir direto em coluna gerada/índice — confira na sua versão)
-- setweight(to_tsvector('pt_unaccent', ementa),'A') || setweight(..., 'B')
CREATE INDEX ON proposicoes USING gin (busca_tsv);
CREATE INDEX ON vereadores USING gin (nome_normalizado gin_trgm_ops); -- nomes/autocomplete/typos
```
Consultas com `websearch_to_tsquery('pt_unaccent', $1)`, ordenadas por `ts_rank_cd`. Para nomes, use `similarity()`/`%` do `pg_trgm`. O padrão de configuração com `unaccent` + stemmer está na doc oficial (PostgreSQL 18.6; o 19 está em RC1) [S81]. As extensões estão disponíveis em Neon [S19], Supabase [S26], Prisma Postgres [S28] e PGlite [S85].

**Quando vale migrar para Meilisearch/Typesense** (🔎 critérios práticos):
- busca instantânea a cada tecla com **tolerância a erro de digitação em texto longo** (não só em nomes) e p95 abaixo de 50 ms sob carga;
- facetas dinâmicas com contagem em tempo real sobre milhões de documentos;
- sinônimos e relevância que pessoas **não técnicas** precisam ajustar;
- p95 da busca FTS acima de cerca de 200 ms mesmo com índices adequados.

Custos: **Meilisearch Cloud a partir de US$ 20/mês (trial de 14 dias), self-hosted com licença MIT** [S79]. **Typesense Cloud** menciona "free cluster", mas a página não detalha limites [S80]. Antes de migrar, tente `pg_trgm` + `unaccent` + materialized view de busca.

---

## 10. Scraping e parsing em Node/TS

- **HTTP:** `fetch` nativo do Node 24 (implementado com undici). Use `undici` (**8.12.3** [S66]) quando precisar de `Agent`/keep-alive, `RetryAgent` ou proxy. Boas práticas:
  - timeouts explícitos e retry com backoff e jitter;
  - `If-None-Match`/`If-Modified-Since`;
  - **User-Agent identificando a ONG com e-mail de contato**;
  - cerca de 1 req/s e respeito ao `robots.txt`;
  - 🔎 atenção a páginas em **ISO-8859-1/Windows-1252**, comuns em sites públicos: decodifique o `Buffer` com o charset certo antes de parsear.
- **Parser HTML:** **cheerio 1.2.0** (MIT, Node ≥ 20.18.1) [S66][S83] é o padrão: API jQuery, rápido e sem DOM completo. `linkedom` 0.18 serve quando você precisa de APIs de DOM (`querySelector`, `textContent` com semântica de DOM). `parse5` 8 é o parser de baixo nível compatível com a especificação. **Use cheerio.**
- **Playwright 1.64** [S66]: só se a página depender de JavaScript para renderizar dados. Antes, procure a API ou JSON que a própria página consome (DevTools → Network), que é mais estável e mais barato.
- **PDF:**
  - **unpdf 1.9.1** (MIT, Node ≥ 22) [S66][S82] traz um build serverless do PDF.js 6.4.299. Tem `extractText`, `extractTextItems` (texto com coordenadas), links e imagens. **Não extrai tabelas.** Limite páginas e tamanho e use timeout em PDFs não confiáveis [S82].
  - `pdfjs-dist` 6.4 é a opção direta: mais controle, mais código.
  - Python **pdfplumber 0.11.10** é bom para **tabelas** [S87]. **PyMuPDF 2.0 é AGPL** [S87] e exige atenção à licença.
- **TS único × TS + Python:** **TS único**: um só toolchain e lockfile, e tipos/Zod compartilhados entre coletor, banco e site. Só acrescente um **job Python isolado** (com `uv`, chamado como CLI que emite JSON validado por Zod no lado TS) **se** aparecer PDF tabular que unpdf + heurística de coordenadas não resolva. Não vale manter dois ecossistemas por antecipação.

---

## 11. Testes

| Camada | Ferramenta | Versão / nota |
|---|---|---|
| Unidade / parsers | **Vitest** | **5.0.5**, lançado em 03/09/2026. Exige Node ≥ 22.12 e Vite ≥ 6.4 [S84]. **O teste mais valioso aqui:** fixtures de HTML/PDF reais (snapshots salvos) → saída esperada (golden files). Quando a Câmara mudar o layout, o teste quebra antes da produção |
| Banco (integração) | **Testcontainers** (`@testcontainers/postgresql` 12.2.1) [S66] | Postgres real (mesma versão da produção) em Docker. Funciona em runner Ubuntu do GitHub. Use para migrations, FTS e triggers de auditoria |
| Banco (rápido/local) | **PGlite** 0.5.11 [S66] | Postgres em WASM. Inclui `pg_trgm` e `unaccent` [S85]. 🔎 Não é o servidor de produção: use para testes rápidos e confirme no Testcontainers |
| E2E | **Playwright Test** 1.64.1 [S66] | Login no admin, correção manual mais audit log, busca, exportação |
| Acessibilidade | **axe-core** 4.14 / `@axe-core/playwright` 4.14 [S66] | Rodar dentro dos testes E2E nas páginas principais |
| Performance / SEO | **Lighthouse CI** (`@lhci/cli` 0.15.x) [S86] | ⚠️ Último publish no npm em 25/06/2025 [S66], cadência lenta. Use com budgets nas previews. Manter opcional |

---

## 12. Domínio (consulta RDAP em 24/10/2026, sem compra)

Método: `GET https://rdap.registro.br/domain/<nome>`. **404 = não encontrado**, ou seja, provavelmente livre. **200 = registrado** (controles: `osbrasil.org.br` e `uol.com.br` deram 200). ⚠️ O RDAP do Registro.br devolve **HTTP 403 com `Nicbr-Permission-Denied: 1`** sob consultas rápidas (rate limit), então repeti com intervalo. Confirmei também no endpoint público do Registro.br (`/v2/ajax/avail/raw/<nome>`): todos os nomes livres retornaram `status: 0` e os registrados retornaram `status: 2` [S88].

| Domínio | RDAP | avail | Situação |
|---|---|---|---|
| acompanheseuvereador.org.br | 404 | 0 | **Livre** |
| acompanheseuvereador.com.br | 404 | 0 | **Livre** |
| acompanhe.org.br | 404 | 0 | **Livre** (🔎 genérico; não identifica Pinda) |
| vereadorespinda.org.br | 404 | 0 | **Livre** |
| pindavereadores.org.br | 404 | 0 | **Livre** |
| **Sugestão 1:** vereadorpinda.org.br | 404 | 0 | **Livre** |
| **Sugestão 2:** olhonacamarapinda.org.br | 404 | 0 | **Livre** |
| **Sugestão 3:** pindatransparente.org.br | 404 | 0 | **Livre** |
| extra: acompanheseuvereador.ong.br | — | 0 | **Livre** |
| acompanheseuvereador.org (PIR RDAP) | 404 | — | Livre [S89] |
| acompanheseuvereador.com (Verisign RDAP) | 404 | — | Livre [S89] |
| vereadorespinda.org (PIR RDAP) | 404 | — | Livre [S89] |

- 🔎 **Evite nomes que pareçam oficiais** (`camarapinda.org.br` e `camaradepinda.org.br` também estão livres). Eles podem confundir o cidadão com o site da Câmara.
- **Regra do `.org.br`:** é categoria para **"instituições não governamentais sem fins lucrativos"**, restrita a **pessoa jurídica** e liberada **só após análise de documentação** que comprove a natureza da instituição. Na prática, exige o **CNPJ da ONG**, que é cruzado com a Receita (atividade e natureza jurídica) [S91]. Alternativa sem exigência de personalidade jurídica: **`.ong.br`**. Para associação informal, o domínio fica vinculado ao CPF de um membro [S91].
- **Preço:** **R$ 40,00 por ano** para qualquer `.br` (meta oficial do registro.br). Contratável por **até 10 anos**, sem reajuste desde 2017 (TELETIME, 14/10/2026) [S90]. Preço de `.com`/`.org` depende do registrador e não foi verificado.
- 🔎 Sugestão: registrar `acompanheseuvereador.org.br` (principal, no CNPJ da ONG) e, de forma defensiva, `acompanheseuvereador.com.br` (R$ 40/ano).
- ⚠️ 404 no RDAP não garante disponibilidade: nomes em processo de liberação, reservados ou registrados no mesmo minuto podem existir. A confirmação final é no checkout do Registro.br.

---

## 13. Três opções completas

### A) Stack recomendada: "Vercel + Neon + GitHub Actions"
- **Web:** Next.js 16.4 (App Router, Cache Components, `ensureStatic` nas rotas públicas, `cacheTag` por entidade, sitemap e Metadata API). Funções em `gru1`.
- **Admin:** no mesmo app, em `/admin`. Better Auth (convite, TOTP ou passkey), `overrides` + `audit_log`.
- **Dados:** Neon (sa-east-1), Drizzle 0.45 fixado, Zod 4. FTS `pt_unaccent` + `pg_trgm`.
- **Ingestão:** coletores TS (fetch/undici + cheerio + unpdf) no GitHub Actions (repo público), disparados por Cloudflare Worker Cron (Free) via `workflow_dispatch` e com watchdog. Snapshots no R2. Ao final, `POST /api/revalidate` assinado → `revalidateTag`.
- **Exportações:** CSV/JSON completos gerados pela ingestão e publicados no R2 sob domínio próprio (`dados.<domínio>`, egress grátis). Exportações filtradas por Route Handler com streaming e cache.
- **Backups:** `pg_dump` noturno → R2 (lifecycle), mais o histórico de 6 h do Neon.
- **Observabilidade:** Sentry, Healthchecks.io, UptimeRobot (status page) e tabela `ingestion_runs`.
- **CI/CD:** GitHub Actions (lint, typecheck, Vitest, Testcontainers, Playwright + axe) e previews da Vercel. Branch Neon por PR (10 no Free).

### B) Alternativa conservadora: "pague pouco por garantias, menos peças"
- **Web e admin:** Next.js 16.4 na **Vercel Pro** desde o início. Resolve a dúvida dos termos de uso, permite repo de organização, dá logs de 1 dia, Spend Management, cron por minuto e funções de até 800 s.
- **Dados, Auth e Storage:** **Supabase Pro**: Postgres com backups diários de 7 dias e sem pausa; Storage com 100 GB inclusos para snapshots; Supabase Auth ou Better Auth.
- **Ingestão:** **Vercel Cron (Pro) chamando os coletores como funções** (cada execução leva poucos minutos e cabe em 300–800 s). Assim não dependem do Actions nem do relógio externo. GitHub Actions só para CI e para jobs pesados eventuais (Playwright/Python).
- Mesmo ORM, validação, FTS, testes e observabilidade da opção A.

### C) Alternativa mais independente de vendor: "VPS + Docker Compose"
- **Servidor:** um VPS de 2 vCPU / 4 GB:
  - Hetzner CX23 €5,99, que estava indisponível em 24/10/2026 [S50] e não tem região no Brasil;
  - Lightsail São Paulo [S51];
  - ou Oracle Always Free (2 OCPU / 12 GB) [S52], que tem regra de reclamação por ociosidade.
- **Conteúdo do servidor:** Docker Compose com Next.js `standalone` (`next start` single-instance, com cache em disco [S57]), Postgres 18 com `pg_trgm`/`unaccent` e Caddy (TLS).
- **Ingestão:** cron do host (systemd timer) executando o mesmo CLI de ingestão. IP fixo e, em São Paulo, IP brasileiro.
- **Snapshots:** disco local mais réplica em B2/R2 (restic/rclone). `pg_dump` noturno também para B2/R2.
- **Rede:** Cloudflare Free na frente (CDN e DDoS; Project Galileo possível [S42]).
- **Observabilidade:** Sentry SaaS, Healthchecks (cron e backup) e UptimeRobot.
- **Deploy:** imagem buildada no GitHub Actions → GHCR → `docker compose pull && up -d`. Coolify (self-hosted grátis [S53]) é opcional para quem quer UI; para um app só, Compose + Caddy dá menos manutenção.
- *Variante C′ "Cloudflare-first":* Workers Paid (US$ 5) com Astro 7 (ou Next via OpenNext), Hyperdrive → Neon, R2, Cron Triggers rodando os coletores (15 min de CPU para intervalo ≥ 1 h [S33]). Custo fixo baixo, mas o lock-in fica no runtime Workers.

### Comparação objetiva

| Critério | **A) Recomendada** | **B) Conservadora** | **C) VPS independente** | *C′ Cloudflare-first* |
|---|---|---|---|---|
| **Custo/mês, fase inicial** | **US$ 0** (Hobby, se confirmado) ou **US$ 20** (Pro) + domínio R$ 40/ano | **US$ 45** (Vercel Pro 20 + Supabase Pro 25) | **~€6–7** (Hetzner) / **US$ 5** (Lightsail 0,5 GB, apertado) / **US$ 0** (Oracle, com risco) | **US$ 5** |
| **Custo/mês com crescimento** 🔎 | **~US$ 25–40**: Pro 20 (+20 por dev extra) + Neon Launch ~0–15 + R2 ~0–1 | **~US$ 45–70**: disco Supabase acima de 8 GB a US$ 0,125/GB, egress acima de 250 GB a US$ 0,09/GB | **~€10–20** (VPS maior + B2/R2 centavos) | **~US$ 5–15** |
| **Limites críticos** | Vercel Hobby: termos, 1 seat, repo de org, logs 1 h. Neon: 100 CU-h, 5 GB de egress e 1 GB por projeto (ao estourar, o **compute é suspenso** até o mês seguinte) [S18]. GitHub `schedule` (mitigado com dispatch externo) | Supabase Pro: 8 GB de disco e 250 GB de egress inclusos. Vercel Pro: crédito de US$ 20 | CPU e RAM do VPS. Banda da Lightsail SP pela metade. Ociosidade na Oracle | 128 MB de memória por isolate. Runtime não-Node. OpenNext sem Node middleware |
| **Lock-in** | Médio-baixo: Next tem Adapter API e self-host. Postgres padrão. R2 é S3. Coletores são CLI | Médio: Supabase Auth/Storage/pg_cron amarram mais. Postgres continua padrão | **Baixo** (Docker + Postgres + S3) | Médio-alto (Workers, Hyperdrive) |
| **Manutenção** | **Baixa**: só updates de dependências | **Muito baixa** (tudo gerenciado, backups inclusos) | **Alta**: patches do SO, upgrades do Postgres, testar restores, disco, TLS | Baixa-média |
| **DX** | **Excelente**: previews por PR, branch de banco por PR, logs no Actions | Excelente (dashboard único Supabase) | Boa, mas sem previews automáticas (exige montar) | Boa (wrangler). Debug do OpenNext pode ser chato |
| **Segurança** | Secrets separados por serviço. Papel de banco de ingestão com privilégio mínimo | Backups e PITR pago disponível | Responsabilidade total sua | Bom (WAF e Galileo) |
| **Portabilidade** | Alta | Média | Máxima | Média |

---

## 14. Armadilhas de free tier (riscos concretos)

1. **Vercel Hobby e cron:** só **1×/dia**, com até 59 min de atraso. `0 * * * *` **quebra o deploy** [S1]. Não coloque a ingestão horária na Vercel Hobby.
2. **Vercel Hobby e termos:** *"non-commercial personal use only"*. **Código escrito por pessoa paga já caracteriza uso comercial**. Doações são permitidas [S4]. Além disso: **sem conexão Git com repositório de organização** [S2], **1 dev seat** e **logs de 1 h** [S2]. Se estourar uma cota, o recurso **fica bloqueado por 30 dias** [S3].
3. **Vercel Blob Hobby:** **2.000 operações avançadas/mês**, e cada upload conta. Snapshots horários estouram em poucos dias, com bloqueio de 30 dias [S7].
4. **GitHub Actions `schedule`:**
   - mínimo de 5 min, **atrasos e descarte de jobs em pico**, pior no minuto 0 [S9];
   - **em repositório público, é desativado após 60 dias sem atividade** [S9][S12];
   - os termos vetam uso *"as part of a serverless application"* e atividade não relacionada ao projeto [S14];
   - 🔎 os IPs dos runners não são brasileiros, o que pode levar a bloqueio pelo site da Câmara.
5. **Tokens que expiram:** o PAT ou credencial usado pelo dispatcher externo expira e a ingestão para **sem erro visível**. O heartbeat no Healthchecks é obrigatório.
6. **Neon Free:**
   - scale-to-zero sempre ligado (cold start na primeira query);
   - ao esgotar **100 CU-h ou 5 GB de egress**, o **compute é suspenso até o próximo ciclo**, ou seja, **site fora do ar** [S18];
   - acima de 1 GB, **as escritas falham** [S18];
   - restore só das últimas 6 h.
   Mitigação: limite de autoscaling, cache agressivo, exportações servidas pelo R2 (não pelo banco) e backups próprios.
7. **Supabase Free:** **pausa após 7 dias** de baixa atividade, **sem backups**, 500 MB e no máximo 2 projetos ativos [S21][S23].
8. **Prisma Postgres Free:** cobrança por **operação** (200 mil/mês), que uma ingestão com muitos upserts consome rápido. Sem backup [S27]. **`npm i prisma` instala o RC do Prisma 8** (tag `latest`, 23/10/2026) [S66][S29].
9. **Cloudflare Free:**
   - **10 ms de CPU por request e por cron**: SSR e parsing não cabem [S33];
   - 5 cron triggers por conta [S33];
   - **R2 exige cartão e o uso não tem teto** [S37];
   - OpenNext **não suporta Node middleware** [S38];
   - divergência na documentação sobre o limite de tamanho do Worker (64 MiB × 3/10 MiB) [S33][S38].
10. **Netlify Free:** **300 créditos com limite rígido** e **15 créditos por deploy de produção**. Scheduled Functions param em **30 s** [S43][S44][S45].
11. **Render Free:** **Postgres apagado após 30 + 14 dias**, hibernação em 15 min, sem cron [S46]. **Fly.io:** não tem mais free tier [S47]. **Railway:** só US$ 1/mês de crédito e **incidente com exposição de variáveis de ambiente em 21/10/2026** [S48][S49].
12. **Aiven Free:** pode **desligar serviço sem uso**, sem pooling, sem escolha de região, 1 backup [S32]. **Oracle Always Free:** **reclama instâncias ociosas** (7 dias com CPU p95, rede e memória abaixo de 20%), só na home region [S52].
13. **VPS barato:** Hetzner subiu preços em 2026 ⚠️ (fontes secundárias). Os planos cost-optimized aparecem **"currently unavailable"** em 24/10/2026 [S50]. A Lightsail São Paulo tem **metade** da franquia de transferência [S51].
14. **Observabilidade free:** Sentry Developer tem **1 usuário e 1 cron monitor** [S67] (peça o patrocínio OSS [S68]). Better Stack free é para "personal projects" [S71]. 🔎 O UptimeRobot já teve restrição não-comercial reportada por terceiros. Os termos atuais (24/06/2026) permitem qualquer uso [S70], mas vale revisitar.
15. **Clerk Hobby:** **sem passkeys e sem MFA** (só no Pro, US$ 25) e com marca obrigatória [S77]. Ruim para um admin que precisa de 2FA.
16. **Versões em transição:**
    - Drizzle 1.0 RC (com quebras) e Prisma 8 RC;
    - SvelteKit 3 com 3 semanas e remote functions instáveis;
    - React Router v6 e Remix v2 em EOL [S62].
    Fixe versões exatas e use Renovate.
17. **Next.js:** releases de segurança mensais mais várias fora de ciclo em 2026 [S55]. Sem rotina de atualização, o site fica vulnerável.
18. **Domínio:** RDAP do Registro.br com **rate limit (403)**. **404 não garante disponibilidade**. `.org.br` **exige documentação e CNPJ da ONG** [S88][S91].

---

## Fontes

Todas acessadas em **24/10/2026**. Entre parênteses, a data exibida pela página, quando houver.

- [S1] Vercel – Usage & Pricing for Cron Jobs — https://vercel.com/docs/cron-jobs/usage-and-pricing (last_updated 2026-07-15)
- [S2] Vercel – Limits — https://vercel.com/docs/limits (2026-09-16)
- [S3] Vercel – Hobby Plan — https://vercel.com/docs/plans/hobby (2026-09-14)
- [S4] Vercel – Fair Use Guidelines (Commercial usage) — https://vercel.com/docs/limits/fair-use-guidelines (2026-09-14)
- [S5] Vercel – Pricing — https://vercel.com/pricing (sem data)
- [S6] Vercel – Open Source Program — https://vercel.com/open-source-program (sem data; coorte "Spring 2026"; inscrições fechadas)
- [S7] Vercel – Blob Pricing — https://vercel.com/docs/vercel-blob/usage-and-pricing (2026-09-23)
- [S8] Vercel – Regions — https://vercel.com/docs/regions (2026-08-11)
- [S9] GitHub Docs – Events that trigger workflows (`schedule`) — https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- [S10] GitHub Docs – GitHub Actions billing — https://docs.github.com/en/billing/concepts/product-billing/github-actions
- [S11] GitHub Docs – Actions limits — https://docs.github.com/en/actions/reference/limits
- [S12] GitHub Docs – Disable and enable workflows — https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
- [S13] GitHub REST – Create a workflow dispatch event / Enable a workflow — https://docs.github.com/en/rest/actions/workflows
- [S14] GitHub Terms for Additional Products and Features (Actions) — https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features (vigência 27/08/2026)
- [S15] GitHub Docs – Repository limits — https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits
- [S16] GitHub Docs – About large files — https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
- [S17] Neon – Pricing — https://neon.com/pricing
- [S18] Neon – Plans — https://neon.com/docs/introduction/plans (sem data)
- [S19] Neon – Supported extensions — https://neon.com/docs/extensions/pg-extensions
- [S20] Neon – Regions — https://neon.com/docs/introduction/regions (listas de IP atualizadas em 07/10/2026)
- [S21] Supabase – Pricing — https://supabase.com/pricing
- [S22] Supabase – Billing on Free plan — https://supabase.com/docs/guides/platform/billing-on-free-plan
- [S23] Supabase – Project Pausing — https://supabase.com/docs/guides/platform/free-project-pausing
- [S24] Supabase – Cron — https://supabase.com/docs/guides/cron
- [S25] Supabase – Edge Functions limits — https://supabase.com/docs/guides/functions/limits
- [S26] Supabase – Extensions / Full Text Search — https://supabase.com/docs/guides/database/extensions ; https://supabase.com/docs/guides/database/full-text-search
- [S27] Prisma – Pricing (Prisma Postgres) — https://www.prisma.io/pricing
- [S28] Prisma Postgres – Extensions — https://www.prisma.io/docs/postgres/database/postgres-extensions
- [S29] Prisma ORM – Release status — https://www.prisma.io/docs/orm/release-status ("`latest` on 23 October 2026")
- [S30] Prisma – Full-text search — https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search
- [S31] Xata – Pricing — https://xata.io/pricing (sem data)
- [S32] Aiven – Pricing — https://aiven.io/pricing
- [S33] Cloudflare Workers – Limits — https://developers.cloudflare.com/workers/platform/limits/ (12/10/2026)
- [S34] Cloudflare Workers – Pricing — https://developers.cloudflare.com/workers/platform/pricing/ (02/10/2026)
- [S35] Cloudflare – Cron Triggers — https://developers.cloudflare.com/workers/configuration/cron-triggers/ (17/10/2026)
- [S36] Cloudflare R2 – Pricing — https://developers.cloudflare.com/r2/pricing/ (01/10/2026)
- [S37] Cloudflare R2 – Get started (assinatura R2 via checkout) — https://developers.cloudflare.com/r2/get-started/ ; relatos: https://community.cloudflare.com/t/why-using-r2-free-tier-involves-giving-card-info/945179
- [S38] OpenNext – Cloudflare adapter — https://opennext.js.org/cloudflare
- [S39] Cloudflare Hyperdrive – Pricing — https://developers.cloudflare.com/hyperdrive/platform/pricing/ (18/06/2026)
- [S40] Cloudflare – Migrate from Pages to Workers — https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/ ; https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/
- [S41] Cloudflare Blog – Vinext 1.0 — https://blog.cloudflare.com/vinext-nextjs-on-vite/ (28/09/2026)
- [S42] Cloudflare – Project Galileo — https://www.cloudflare.com/galileo/
- [S43] Netlify – Pricing — https://www.netlify.com/pricing/
- [S44] Netlify – Credit-based pricing plans — https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- [S45] Netlify – Scheduled Functions — https://docs.netlify.com/build/functions/scheduled-functions/ (03/10/2026)
- [S46] Render – Free instances — https://render.com/docs/free (sem data; "© 2026")
- [S47] Fly.io – Pricing — https://docs.fly.io/about/pricing (sem data)
- [S48] Railway – Pricing — https://railway.com/pricing (sem data)
- [S49] Railway – Security disclosure, 21/10/2026 — https://blog.railway.com/p/security-disclosure-wednesday-october-21st
- [S50] Hetzner – Cloud / Cost-Optimized — https://www.hetzner.com/cloud/ ; https://www.hetzner.com/cloud/cost-optimized/ (aumentos de 2026 citados por fontes secundárias, p.ex. https://wz-it.com/en/blog/hetzner-price-increase-june-2026-cpx-ccx-alternatives/)
- [S51] AWS Lightsail – Pricing — https://aws.amazon.com/lightsail/pricing/
- [S52] Oracle Cloud – Always Free Resources — https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- [S53] Coolify – Pricing — https://coolify.io/pricing/
- [S54] Backblaze B2 – Pricing — https://www.backblaze.com/cloud-storage/pricing (sem data; aviso de staging na página)
- [S55] Next.js – Blog (lista) e "Next.js 16.4" — https://nextjs.org/blog ; https://nextjs.org/blog/next-16-4 (06/10/2026)
- [S56] Next.js – `proxy.js` — https://nextjs.org/docs/app/api-reference/file-conventions/proxy (2026-09-04)
- [S57] Next.js – Self-hosting — https://nextjs.org/docs/app/guides/self-hosting (2026-10-15)
- [S58] Next.js – Across Platforms: Adapters, OpenNext — https://nextjs.org/blog/nextjs-across-platforms (25/03/2026)
- [S59] Astro – Blog e "Astro 7" — https://astro.build/blog/ ; https://astro.build/blog/astro-7/ (22/06/2026)
- [S60] Cloudflare adquire o time do Astro — https://www.businesswire.com/news/home/20260116386991/en (16/01/2026)
- [S61] Svelte – Blog e "SvelteKit 3 is here" — https://svelte.dev/blog ; https://svelte.dev/blog/sveltekit-3-is-here (01/10/2026)
- [S62] Remix/React Router – Blog e "React Router v8" — https://remix.run/blog ; https://remix.run/blog/react-router-v8 (17/06/2026)
- [S63] Drizzle ORM – Releases — https://github.com/drizzle-team/drizzle-orm/releases
- [S64] Drizzle – PostgreSQL full-text search guide — https://orm.drizzle.team/docs/guides/postgresql-full-text-search
- [S65] Zod — https://zod.dev/
- [S66] npm registry (versões, dist-tags, licenças, engines) — https://registry.npmjs.org/<pacote> (consultado em 24/10/2026)
- [S67] Sentry – Pricing — https://sentry.io/pricing/
- [S68] Sentry – Open Source Sponsorship — https://sentry.io/for/open-source/
- [S69] Healthchecks.io – Pricing, Docs, Repositório — https://healthchecks.io/pricing/ ; https://healthchecks.io/docs/ ; https://github.com/healthchecks/healthchecks
- [S70] UptimeRobot – Pricing e Terms — https://uptimerobot.com/pricing/ ; https://uptimerobot.com/terms/ (dateModified 2026-06-24)
- [S71] Better Stack – Pricing — https://betterstack.com/pricing
- [S72] Grafana Cloud – Pricing — https://grafana.com/pricing/
- [S73] Axiom – Pricing — https://axiom.co/pricing
- [S74] Auth.js e anúncio "Auth.js joins Better Auth" — https://authjs.dev/ ; https://www.better-auth.com/blog/authjs-joins-better-auth (22/09/2025)
- [S75] Better Auth joins Vercel — https://better-auth.com/blog/better-auth-joins-vercel (07/07/2026)
- [S76] Better Auth – Passkey, 2FA, Drizzle adapter — https://www.better-auth.com/docs/plugins/passkey ; https://www.better-auth.com/docs/plugins/2fa ; https://www.better-auth.com/docs/adapters/drizzle
- [S77] Clerk – Pricing — https://clerk.com/pricing
- [S78] Lucia — https://lucia-auth.com/
- [S79] Meilisearch – Pricing — https://www.meilisearch.com/pricing
- [S80] Typesense Cloud – Pricing — https://cloud.typesense.org/pricing
- [S81] PostgreSQL – unaccent (docs 18.6) — https://www.postgresql.org/docs/current/unaccent.html
- [S82] unpdf — https://github.com/unjs/unpdf
- [S83] Cheerio — https://cheerio.js.org/
- [S84] Vitest – Blog e "Vitest 5" — https://vitest.dev/blog/ ; https://vitest.dev/blog/vitest-5 (03/09/2026)
- [S85] PGlite – Extensions — https://pglite.dev/extensions/
- [S86] Lighthouse CI — https://github.com/GoogleChrome/lighthouse-ci
- [S87] PyPI JSON (pdfplumber 0.11.10; PyMuPDF 2.0 AGPL; pypdf 6.21.2) — https://pypi.org/pypi/<pacote>/json
- [S88] Registro.br RDAP e consulta de disponibilidade — https://rdap.registro.br/domain/<nome> ; https://registro.br/v2/ajax/avail/raw/<nome>
- [S89] RDAP Verisign (.com) e PIR (.org) — https://rdap.verisign.com/com/v1/domain/<nome> ; https://rdap.publicinterestregistry.org/rdap/domain/<nome>
- [S90] Preço do .br — https://registro.br/ (meta: "Registro de domínio por R$ 40,00 por ano") ; TELETIME, ".br atinge 6 milhões", https://teletime.com.br/14/10/2026/br-6-milhoes/ (14/10/2026)
- [S91] Regras .org.br / .ong.br — https://registro.br/ajuda/registro-de-novos-dominios/ ; https://registro.br/dominio/categorias ; https://www.cgi.br/resolucoes/documento/2008/008/ ; https://www.nic.br/noticia/releases/nic-br-lanca-categoria-ong-br-voltada-a-associacoes-informais-e-comunidades-civis-sem-fins-de-lucro/
