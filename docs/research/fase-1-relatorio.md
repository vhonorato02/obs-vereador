# Acompanhe seu Vereador — Relatório da Fase 1

**Pesquisa, diagnóstico e plano para discussão.** Nenhuma linha de código de aplicação foi escrita.
Data: 24/10/2026. Projeto do Observatório Social do Brasil – Pindamonhangaba.

Documentos de apoio (mesma pasta): `power-bi.md`, `camara-site.md`, `benchmark-design.md`, `stack-free-tiers.md`. Ambiente: `../environment.md`.

> Legenda de confiança usada no texto: **[verificado]** testado nesta pesquisa · **[fonte]** lido em documentação oficial · **[hipótese]** precisa ser confirmado (lista na seção 18.1).

> **Decisões do dono do projeto (24/10/2026), já incorporadas a este plano:**
> 1. **Escopo só de Pindamonhangaba** — Observatório Social do Brasil – Pindamonhangaba e Câmara Municipal de Pindamonhangaba. Nada de projeto genérico para outras cidades.
> 2. **Só free tier.** Nenhum serviço pago, nenhum domínio comprado por enquanto (o site usa o subdomínio gratuito da Vercel).
> 3. **Atualização semanal** é suficiente.
> 4. **Não é um clone do site da Câmara.** É um portal para acompanhar **todos os vereadores**: o centro é a pessoa e o que ela fez; o detalhe completo de cada documento fica no site oficial, com link.

---

## 1. Sumário executivo

**O que descobri**

1. **A Câmara tem uma API oficial de Dados Abertos** (sistema SoftCam), gratuita, que exige apenas um token obtido com cadastro de cidadão. Ela cobre vereadores em exercício, proposições por tipo e **por bairro**, legislação, pautas e publicações. É a base mais confiável para a automação. [verificado: documentação e comportamento sem token]
2. **Votações nominais existem e são públicas**: cada matéria tem uma linha do tempo (protocolo → pauta → votação → resultado) com quórum, resultado e o nome de cada vereador que votou, além de PDF oficial da votação. Isso não existe no Power BI e é o dado mais valioso do projeto. [verificado]
3. **Mas o site tem proteção anti-robô** (LiteSpeed reCAPTCHA). A partir do GitHub Actions, com identificação honesta, **a API passa; as páginas HTML, a tramitação e os PDFs recebem o desafio**. A política deste projeto é não contornar proteção. Logo, **a coleta de tramitação e votos depende de um pedido formal à Câmara** (liberar o coletor ou ampliar a API). Esse é o maior risco e a primeira decisão que precisa de você. [verificado]
4. **O Power BI atual é só contagem agregada** (vereador × ano × tipo), digitada a partir do site, sem registros individuais, sem fonte e sem atualização automática (última em 24/08/2026). Extraí o modelo completo e os dados como baseline para reconciliação. [verificado]
5. **Despesas da Câmara são coletáveis por duas fontes independentes**: o Portal da Transparência municipal (SIAPE GOV, API JSON pública, com a Câmara como entidade própria: empenhos, pagamentos, **diárias**, contratos, RH, emendas impositivas) e a API do TCE-SP (mensal, defasagem de ~2 meses). As duas passam no GitHub Actions. [verificado]
6. **O volume é pequeno**: ~8–10 mil proposições por ano, 11 vereadores, ~45 sessões ordinárias por ano (a 38ª de 2026 é em 27/10). Cabe com folga num Postgres gratuito. [verificado pela numeração das matérias]

**O que recomendo**

- **Produto:** portal editorial, rápido e indexável, **centrado nos 11 vereadores**: o que cada um apresentou, como votou, presença, diárias e emendas impositivas. Todo número abre a lista que o compõe; cada item da lista leva ao documento oficial no site da Câmara. Nada de ranking, nada de espelhar o site da Câmara.
- **Dados:** API oficial primeiro; HTML só onde a API não cobre e só com anuência da Câmara; PDF apenas para atas (presença). Coleta **semanal**, snapshots guardados, parsers testados com fixtures reais, validação de plausibilidade que distingue "nada novo" de "coletor quebrado".
- **Stack (100% gratuita):** Next.js 16.4 + TypeScript strict na Vercel Hobby; Postgres no Neon Free (São Paulo) com Drizzle e Zod; coletores em TypeScript como CLI rodando semanalmente no GitHub Actions; snapshots e dados abertos num repositório público de dados no GitHub; Better Auth no admin; Sentry, Healthchecks.io e UptimeRobot nos planos gratuitos. **Custo: R$ 0**, sem cartão de crédito.
- **Sequência:** começar pelo que já é acessível (API + transparência), lançar com proposições por vereador, normas, diárias e emendas, e acrescentar votações/presenças quando a Câmara liberar o coletor.

**Autocrítica honesta:** mapeei a estrutura do site com cerca de 20 requisições manuais; **não validei o conteúdo real da API** (precisa do token) nem a cobertura histórica. As seções de modelo de dados e ingestão estão desenhadas sobre o que vi, com as incertezas marcadas.

---

## 2. Diagnóstico do sistema atual (Power BI)

Detalhes completos e tabela de dados em `power-bi.md`.

**O que funciona**
- A pergunta central certa: "o que este vereador fez neste ano?".
- Glossário em linguagem simples para os 7 tipos de proposição.
- Identificação humana do vereador (foto, partido, subsídio).

**O que é ruim**
- Números sem saída: "637 requerimentos" não leva a nenhum requerimento.
- Coleta manual, sem fonte, sem data de coleta, sem método; atualização a cada vários meses.
- Gráficos de barras ordenados por volume que funcionam como ranking implícito.
- 10 páginas quase idênticas (uma por tipo) em tela fixa 1280×720: ilegível no celular, ruim para leitor de tela, nada indexável, nada compartilhável.
- Ausências praticamente zeradas: sinal de dado incompleto, não de presença perfeita.

**O que precisa desaparecer**
- A contagem digitada à mão.
- A ordenação por volume e a estética de painel corporativo.
- Um arquivo novo por legislatura.

**O que merece ser preservado**
- Todos os indicadores atuais (7 tipos + presença), por vereador e por ano, agora com o detalhe.
- O glossário, revisado e com base no Regimento.
- O baseline 2025–2026, importado como **"dado histórico (Power BI, 24/08/2026)"**, até ser reconciliado com a fonte.

Hipótese importante para a reconciliação: a soma de projetos de lei por vereador (347 em 2025) parece contar **coautoria para cada coautor**. Se confirmado, a plataforma deve mostrar as duas leituras — "projetos dos quais foi autor ou coautor" e "projetos distintos" — explicando a diferença.

---

## 3. Inventário de dados

| Dado | Fonte | Disponibilidade | Confiabilidade | Forma de coleta | Frequência | Observações |
|---|---|---|---|---|---|---|
| Vereadores em exercício (nome parlamentar, partido, foto) | Câmara — API `vereadores`; página `/camara/membros/exercicio/0` | Alta | Alta | API (token) | Semanal | API só traz quem está em exercício |
| Vereadores de legislaturas anteriores | Câmara — seletor de autoria (~200 nomes com ID interno); TSE | Média | Média | HTML + TSE + revisão manual | Uma vez + por evento | Há duplicatas (mesma pessoa, IDs diferentes) |
| Nome civil, nome de urna | TSE (candidaturas); protocolo das matérias | Alta | Alta | CSV TSE | Por eleição | Apelidos variam ("Norbertinho" / "Norberto Moraes") |
| Partido atual e histórico | Câmara (atual); TSE (na eleição) | Alta / Média | Alta / Média | API + TSE | Semanal / por eleição | Troca de partido no meio do mandato não vem estruturada [hipótese] |
| Votos na eleição, nº de mandatos | TSE dados abertos | Alta | Alta | CSV | Por eleição | O Power BI tinha isso sem fonte |
| Subsídio | Lei/resolução que fixa subsídio; SIAPE (estrutura remuneratória) | Alta | Alta | API legislação + SIAPE | Anual | Hoje é valor digitado |
| Legislaturas, mandatos, suplências, licenças | Atos da Mesa, pautas, notícias | Média | Média | HTML/PDF + revisão no admin | Por evento | Pouco estruturado; evento raro, revisão manual é aceitável |
| Mesa Diretora | Atos, notícias | Média | Alta | HTML + admin | Bienal | — |
| Comissões permanentes (7) e composição | `/pautas/comissao`, Atos (ex.: Ato 01/2025) | Média | Alta | HTML + admin | Anual | Pautas de comissão são coletáveis |
| Proposições (requerimentos, indicações, moções, emendas, vetos, PL, PLC, PDL, PR, atos…) | Câmara — API `proposicoes` por tipo | Alta | Alta | API (token), paginada | Semanal + reconciliação mensal | ~8–10 mil/ano |
| Ementa e texto integral | API [hipótese] + página HTML + PDF assinado | Alta | Alta | API / HTML / PDF | Junto com a proposição | Não republicar o texto integral: ementa + link oficial (honrarias trazem dados pessoais de terceiros) |
| Autoria e coautoria | Página da matéria; assinatura | Alta | Média | API/HTML | Junto | Forma de registrar coautoria a confirmar [hipótese] |
| **Proposições por bairro** | API `bairros` + `proposicoes&bairro=` | Alta | Alta (classificação da própria Câmara) | API | Semanal | Atende "bairro Araretama" sem IA |
| Tramitação (linha do tempo) | `/ajax/tramitacao/{tipo}/{id}` | Alta | Alta | HTML (fragmento) | Para matérias alteradas | **Recebe desafio anti-robô no GitHub Actions** |
| **Votações nominais** (turno, quórum, resultado, voto de cada vereador) | Fragmento de tramitação + PDF `votacao_print_pdf` | Alta | Alta | HTML + PDF para conferência | Semanal (após a sessão de terça) | **Mesmo bloqueio**; o presidente não aparece entre os votantes |
| Pautas das sessões | API `pautas`; `/pautas/...`; PDF | Alta | Alta | API | Semanal | Inclui solenes, especiais, audiências |
| Sessões (calendário, tipo, número) | `/calendario`, pautas | Alta | Alta | API/HTML | Semanal | Ordinárias às terças, 17h |
| Presença por sessão | Atas em PDF (chamada nominal) | Média | Média | Extração de PDF + validação | Semanal | Ausência justificada: fonte a confirmar [hipótese] |
| Normas resultantes (leis, resoluções, decretos legislativos) | API `legislacoes` | Alta | Alta | API (token) | Semanal | Liga projeto → norma |
| Sanção, veto, promulgação | Tramitação + tipo "Vetos" + Jornal Oficial do município | Média | Alta | HTML/API | Por evento | Diário oficial: verificar Querido Diário [hipótese] |
| Despesas da Câmara (empenho, liquidação, pagamento, fornecedor) | SIAPE GOV (entidade 2); TCE-SP | Alta | Alta | APIs JSON | Semanal (SIAPE) / mensal (TCE) | Duas fontes permitem reconciliação |
| **Diárias e passagens** | SIAPE `/execucao/diarias` | Alta | Alta | API | Semanal | Atribuível a vereador quando ele é o beneficiário |
| **Emendas impositivas** (por vereador) | SIAPE `/emendas_parlamentares/*`; app DSI | Alta | Alta | API | Mensal | Muito relevante e ausente do Power BI |
| Contratos, licitações, atas de registro de preço | SIAPE + `/imprensa/transparencia/*` da Câmara | Alta | Alta | API/HTML | Semanal | Nível Câmara, não vereador |
| Servidores, cargos, lotação (inclui assessores) | SIAPE RH | Alta | Alta | API | Mensal | Sensível; ver decisão LGPD (seção 20) |
| Repasse de duodécimos | SIAPE receitas | Alta | Alta | API | Mensal | Contexto do orçamento da Câmara |
| Notícias oficiais | RSS `/jsonweb/web-rss.php` | Alta | Alta (versão oficial) | RSS | Semanal | Contexto, não fato primário |
| Vídeos das sessões | Canal da TV Câmara no YouTube | Alta | Alta | Link manual/feed | Semanal | Prova visual da sessão |
| Histórico 2021–2024 | Power BI antigo (xlsx no Drive); SoftCam (há matérias desde 2009) | Média | Média | Importação + reconciliação | Uma vez | Profundidade histórica do SoftCam a confirmar [hipótese] |
| Baseline 2025–ago/2026 | Power BI público (extraído) | Alta | Baixa (manual) | Importado | Uma vez | Marcado como histórico até reconciliar |

Não encontrei: despesas de gabinete por vereador (cota/verba indenizatória), registro de interesses, agenda individual. Se não existirem como dado público, a plataforma diz que não existem — não estima.

---

## 4. Dados adicionais possíveis (além do Power BI)

| Novo | Por que importa |
|---|---|
| Cada proposição individual, com ementa e link para o documento oficial | Acaba com o "número mágico" sem copiar o site da Câmara |
| Linha do tempo da tramitação | Mostra o que aconteceu com o pedido, não só que ele existiu |
| Resultado (aprovado, rejeitado, arquivado, em tramitação) | Distingue apresentar de aprovar |
| **Votações nominais e voto de cada vereador** | O dado de maior valor cívico; viabiliza "votações divididas" |
| Normas resultantes | Liga projeto → lei |
| Proposições por bairro | Responde "o que pediram para o meu bairro?" |
| Sessões, pautas e presença por sessão | Presença com denominador real |
| Mesa Diretora, comissões, papéis institucionais | Contexto obrigatório (presidente não vota, relator, licença) |
| Emendas impositivas por vereador | Para onde cada vereador indicou recursos do orçamento |
| Diárias de vereadores | Gasto atribuível individualmente, com fonte |
| Despesas da Câmara como instituição | Contexto de custo do Legislativo |
| Natureza da proposição (rotineira/honorífica × substantiva) | Evita ler volume como mérito |
| Temas | Navegação por assunto ("saúde", "transporte") |
| Histórico de legislaturas | Comparar com o próprio passado, sem ranking |
| Exportações abertas (CSV/JSON) | Reuso por jornalistas, pesquisadores e cidadãos |

---

## 5. Estratégia de ingestão — fonte por fonte

### 5.1 Câmara — API SoftCam (fonte principal)
- **Acesso:** token de cidadão (cadastro em `/cidadao`), guardado como secret. Requisição GET simples.
- **Coleta:** listas paginadas por tipo (`proposicoes&tipo=…&pagina=N`), por bairro, `legislacoes`, `pautas`, `vereadores`, `bairros`, `publicacoes`.
- **Incremental e semanal:** uma execução por semana (quarta de manhã, depois da sessão ordinária de terça) percorre as páginas mais recentes até encontrar itens já conhecidos e inalterados (hash do registro); reconciliação completa mensal.
- **Armadilhas conhecidas:** sem token, a API devolve **200 vazio** — tratar como erro de autenticação. Validar com Zod; campo inesperado vira alerta, não crash silencioso.
- **Primeira tarefa da implementação:** com o token, catalogar os campos reais de cada serviço (hipóteses H1–H4).

### 5.2 Câmara — tramitação e votações (HTML)
- **Endpoint:** `/ajax/tramitacao/{tipo}/{id}` (fragmento pequeno, ~4 KB) e PDF `/softcam/votacao_print_pdf.php?topico={id}`.
- **Gatilho:** só para matérias novas/alteradas e matérias pautadas na última sessão — dezenas por semana, não milhares.
- **Bloqueio:** desafio anti-robô a partir do GitHub Actions. **Sem contorno.** Caminhos legítimos, em ordem:
  1. Pedido formal do OSB à Câmara para incluir o User-Agent do coletor na lista de permissão do LiteSpeed (configuração simples para a TI deles) e, idealmente, expor tramitação/votações na API.
  2. Pedido via Lei de Acesso à Informação para carga histórica.
  3. **Coleta assistida** enquanto isso: um voluntário baixa no navegador o PDF de votação da sessão e envia pelo admin; o parser extrai, guarda hash e URL de origem. Reduz o trabalho manual de "contar" para "enviar um arquivo por semana".
- **Detector:** se a resposta for a página "Bot Verification", a execução para, marca a fonte como "bloqueada" e alerta.

### 5.3 Câmara — atas (presença)
- PDFs assinados `/assinatura/assinado/...`. Extração de texto com `unpdf`; parser específico para a chamada nominal; validação manual das primeiras dezenas de atas no admin até a taxa de acerto ser medida.
- Mesmo bloqueio de acesso que 5.2.

### 5.4 Portal da Transparência (SIAPE GOV)
- API JSON pública (`/portal-transparencia/api/...`), com a Câmara como `id_entidade=2`. Endpoints mapeados: empenhos, liquidações, pagamentos, diárias, adiantamentos, suprimento de fundos, duodécimos, contratos, atas, licitações, RH e emendas parlamentares.
- Parâmetros exatos a capturar com o navegador (Playwright) na implementação — a primeira tentativa direta devolveu erro 500, provavelmente por parâmetro faltando.
- Semanal para despesas; mensal para RH e emendas.

### 5.5 TCE-SP
- `GET /api/json/despesas/pindamonhangaba/{ano}/{mes}` sem autenticação; filtrar `orgao = CÂMARA MUNICIPAL DE PINDAMONHANGABA`. ~260 eventos/mês.
- Uso: reconciliação independente das despesas do SIAPE e fonte de fallback. Defasagem de ~2 meses (agosto/2026 disponível em outubro).

### 5.6 TSE
- Dados abertos de candidaturas e resultados (2016, 2020, 2024): nome civil, nome de urna, partido, votos, situação (eleito/suplente).
- Coleta pontual por eleição, com revisão humana do casamento TSE ↔ Câmara.
- Minimização: não importar bens declarados, CPF, endereço, ocupação.

### 5.7 Fontes históricas
- Power BI 2025–2026: importado como "histórico não reconciliado".
- Planilhas 2021–2024 (Drive): idem, para a legislatura anterior.
- SoftCam: há matérias de 2009 e 2013 publicadas; a profundidade real se confirma com a API.
- SAPL/Plone antigos: fora do ar; não depender.

### 5.8 O que não fazer
- Playwright para coletar o site da Câmara (só seria necessário para passar pela proteção — o que não faremos).
- IA para extrair dados que a fonte já estrutura (bairro, tipo, autor).
- Raspar notícias como fonte de fato.

---

## 6. Arquitetura proposta

### 6.1 Diagrama

```mermaid
flowchart LR
  subgraph FONTES["Fontes oficiais"]
    A1["API Câmara<br/>/jsonweb"]
    A2["Tramitação e votos<br/>/ajax + PDF"]
    A3["Atas em PDF"]
    B1["SIAPE GOV API"]
    B2["TCE-SP API"]
    C1["TSE CSV"]
  end

  subgraph ING["Ingestão (GitHub Actions)"]
    S["Agendador<br/>semanal + disparo manual"]
    F["Cliente HTTP educado<br/>limite de taxa, retry, detector de bloqueio"]
    R[("Snapshots<br/>repositório público de dados")]
    P["Parsers versionados<br/>fixtures reais"]
    V["Validação Zod<br/>+ plausibilidade"]
    N["Normalização<br/>IDs canônicos, apelidos, vocabulário"]
    U["Upsert com detecção de mudança<br/>+ histórico de versões"]
  end

  DB[("Postgres no Neon<br/>fatos, correções, auditoria, execuções")]
  M["Métricas derivadas<br/>views com versão do método"]
  W["Site público Next.js<br/>estático/ISR na Vercel"]
  ADM["Admin<br/>Better Auth"]
  X["Dados abertos CSV/JSON<br/>repositório público de dados"]
  O["Observabilidade<br/>Sentry, Healthchecks, UptimeRobot"]
  Q["Fila de pendências<br/>no admin"]

  S --> F
  A1 & A2 & A3 & B1 & B2 & C1 --> F
  F --> R --> P --> V --> N --> U --> DB
  V -- "falha" --> Q
  DB --> M --> W
  DB --> X
  U -- "revalidateTag" --> W
  ADM <--> DB
  F & U --> O
```

### 6.2 Componentes

| Componente | Responsabilidade | Decisão |
|---|---|---|
| Cliente HTTP | User-Agent honesto com contato, ≥ 1 s entre requisições por host, timeout, retry com backoff e jitter (só em erro de rede/5xx), detector de "Bot Verification" e de "200 vazio", lista de hosts permitidos (anti-SSRF) | Um único módulo; todos os coletores usam |
| Snapshots | Guarda o retorno da fonte antes de qualquer parse (JSON comprimido num repositório público de dados no GitHub; PDFs só por hash + URL oficial); metadados no banco (URL, data, status, hash, tamanho, execução) | Permite reprocessar quando o parser melhora, sem voltar à fonte; o histórico do git vira trilha pública de auditoria |
| Parsers | Funções puras: bruto → objetos tipados. Versionados (`parser_version` no registro) | Testados com fixtures reais (golden files) |
| Validação | Zod no formato; regras de plausibilidade no conjunto (volume vs. histórico, campos obrigatórios, datas no futuro, número/ano coerentes) | Falha de plausibilidade marca a execução como **suspeita**: não publica remoções, alerta |
| Normalização | Identidade canônica de vereador (apelidos), vocabulário controlado de tipos/situações/eventos, slugs | Tabelas de referência editáveis no admin |
| Upsert | Compara hash do registro normalizado; grava nova versão só se mudou; nunca apaga por ausência (marca "não visto na fonte desde…" após N confirmações) | Histórico de alterações auditável |
| Métricas | Views SQL com nome e versão do método (`metodo_v1`) | Todo número publicado sabe de qual consulta veio |
| Site | Next.js com páginas estáticas/ISR; `cacheTag` por entidade; a ingestão chama um endpoint assinado que invalida só o que mudou | Zero JS no cliente onde não precisa |
| Admin | Mesmo app, rota protegida, autorização verificada em cada Server Function | Sem SaaS de admin |
| Exportações | Geradas pela ingestão e publicadas no repositório público de dados (download grátis pelo GitHub) | O banco não serve download em massa |

### 6.3 Melhorias sobre o fluxo sugerido no briefing
- **Descoberta separada de detalhe:** primeiro "o que mudou?" (listas, feeds, pautas), depois "baixe os detalhes só disso". É o que torna a ingestão incremental e barata.
- **Reprocessamento sem rede:** parser novo roda sobre snapshots antigos.
- **Fila de pendências em vez de dead-letter queue:** registro que falha na validação vai para uma tabela visível no admin com o motivo. Sem infraestrutura de fila.
- **Disjuntor por plausibilidade:** "ontem 4.300, hoje 17" para a publicação e alerta, em vez de apagar 4.283 registros.
- **Sem remoção por ausência** sem confirmação.

---

## 7. Banco e modelo de dados

Postgres, modelo relacional próximo do padrão **Open Civic Data/Popolo** (pessoa, órgão, filiação, proposição, ação, evento de votação), um padrão aberto e documentado.

### 7.1 Entidades principais

| Grupo | Entidade | Notas |
|---|---|---|
| Pessoas | `pessoa` | nome civil; minimizado (sem CPF, sem endereço) |
| | `pessoa_apelido` | nomes parlamentares e variantes por fonte e período ("Norbertinho", "Norberto Moraes") |
| | `partido`, `filiacao` | filiação com início/fim e fonte |
| Mandatos | `legislatura` | número, início, fim |
| | `mandato` | pessoa × legislatura; titular/suplente; início/fim; votos (TSE) |
| | `afastamento` | licença, suplente que assumiu |
| Órgãos | `orgao` | Plenário, Mesa Diretora, 7 comissões |
| | `cargo_orgao` | pessoa × órgão × papel (presidente, relator…) × período |
| Proposições | `tipo_proposicao` | vocabulário controlado + **natureza** (normativa, fiscalizatória, honorífica, administrativa) + texto do glossário |
| | `proposicao` | ID da fonte (SoftCam), tipo, número, ano, ementa, data, regime, situação atual (derivada) |
| | `autoria` | proposição × (pessoa \| órgão \| Executivo \| iniciativa popular) × papel (autor, coautor) |
| | `relacionamento` | proposição ↔ proposição (emenda de, veto a, substitutivo de…) |
| | `evento_tramitacao` | data/hora, tipo (vocabulário), descrição original, sessão, documento |
| | `norma` | lei/resolução/decreto resultante e ligação com a proposição de origem |
| | `bairro`, `proposicao_bairro` | classificação da própria Câmara |
| | `tema`, `proposicao_tema` | origem (regra, IA, humano), revisado por, data |
| Plenário | `sessao` | tipo, número, data/hora, legislatura |
| | `presenca` | sessão × pessoa × status (presente, ausente, justificada, licença) |
| | `votacao` | sessão × proposição × turno × quórum × resultado × modo (nominal \| simbólica) |
| | `voto` | votação × pessoa × valor (sim, não, abstenção, não votou, ausente, **não vota por regra** — presidente) |
| Finanças | `despesa` | fonte (SIAPE/TCE), empenho, evento, fornecedor (PJ por CNPJ; PF mascarado), valor, data |
| | `diaria`, `emenda_impositiva` | com beneficiário/autor quando atribuível |
| Documentos | `documento` | URL oficial, tipo, hash, snapshot, assinado digitalmente |
| Proveniência | `fonte`, `execucao_coleta`, `snapshot` | fonte → execução → bruto |
| | `origem_registro` | linhagem por registro: entidade, id, snapshot, URL, extraído em, versão do parser |
| | `versao_registro` | histórico de mudanças (antes/depois) |
| Correções | `correcao_manual` | entidade, campo, valor corrigido, motivo, autor, **valor da fonte no momento da correção**, status |
| | `auditoria` | append-only: ator, ação, alvo, diff, quando |
| | `pendencia` | registros reprovados na validação, possíveis duplicatas, conflitos |
| Métricas | `metodo` | nome, versão, SQL/descrição, vigência — referenciado por toda métrica publicada |

JSON só onde faz sentido: payload bruto normalizado no snapshot e `diff` da auditoria. Nada de "registro inteiro em JSON" como substituto de coluna.

### 7.2 Política de correções manuais (source × normalizado × override × derivado)
- **Valor da fonte** e **valor normalizado** ficam nas tabelas de fatos e são sempre reescritos pela ingestão.
- **Correção manual** fica em `correcao_manual` e é aplicada **por cima**, numa view de leitura. A ingestão nunca a apaga.
- Ao corrigir, guarda-se o valor da fonte daquele momento. Se a fonte mudar depois, a correção vira **"em conflito"** na fila do admin: talvez a Câmara tenha corrigido o erro e o override possa sair.
- **Valor derivado** (contagens, percentuais) nunca é corrigido à mão: corrige-se o dado de base ou o método.
- Toda correção exige motivo, aparece no histórico público de correções (sem expor quem fez, se você preferir) e gera auditoria.

### 7.3 Identidade e URLs
- Chave interna: UUID. Chave da fonte: ID SoftCam, preservado.
- URL pública: `/proposicoes/{tipo}/{ano}/{numero}` (como o cidadão vê no documento) e `/vereadores/{nome-parlamentar}`; slugs nunca reaproveitados, 301 quando mudarem.

---

## 8. Stack

Pesquisa completa, versões e fontes em `stack-free-tiers.md`. Decisão do dono: **só free tier**. Tudo abaixo é gratuito e não exige cartão de crédito.

### 8.1 Recomendada (100% gratuita)
| Camada | Escolha | Por quê |
|---|---|---|
| Web + admin | **Next.js 16.4** na **Vercel Hobby**, App Router, Cache Components, `ensureStatic` nas rotas públicas | Páginas estáticas com invalidação por entidade quando a ingestão roda; SEO; admin no mesmo app |
| Endereço | Subdomínio gratuito `*.vercel.app` (ex.: `acompanhe-seu-vereador.vercel.app`) | Sem compra de domínio por enquanto |
| Linguagem | TypeScript strict | Um ecossistema só para coletor, banco e site |
| Validação | **Zod 4** | Fronteiras (parsers, formulários, exportações) |
| Banco | **Postgres no Neon Free**, região São Paulo | 1 GB e 100 CU-h/mês bastam para o volume; extensões `unaccent`/`pg_trgm`; branch por PR |
| ORM | **Drizzle 0.45** (versão fixada) | SQL-first, migrations SQL legíveis e revisáveis |
| Busca | Postgres FTS (`portuguese` + `unaccent`) + `pg_trgm` | Suficiente para dezenas de milhares de registros |
| Coletores | CLI TypeScript (`fetch`/undici, cheerio, unpdf) | Portáveis: rodam no Actions ou em qualquer máquina |
| Agendamento | **GitHub Actions** (repo público, grátis), `schedule` **semanal** + `workflow_dispatch` | Semanal basta; o atraso típico do `schedule` é irrelevante nessa cadência |
| Snapshots e dados abertos | **Repositório público de dados no GitHub** (JSON comprimido por execução; PDFs só por hash + URL oficial) | Grátis e sem cartão; o histórico do git vira trilha pública de auditoria; downloads servidos pelo GitHub |
| Backups do banco | `pg_dump` semanal **criptografado** em repositório **privado** no GitHub | Grátis; o dump tem dados do admin, por isso não vai para o repositório público |
| Auth do admin | **Better Auth** (convite, TOTP ou passkey) | Dados no próprio banco; Auth.js entrou em manutenção |
| Observabilidade | Sentry Developer + Healthchecks.io + UptimeRobot (planos grátis) + tabela de execuções | Suficiente e sem custo |
| Testes | Vitest, Testcontainers (Postgres real), Playwright + axe-core | Tudo roda no GitHub Actions gratuito |

**Ajustes que faço sobre a pesquisa de stack:** (1) ela sugeria um relógio externo no Cloudflare para fugir dos atrasos do `schedule`; com coleta semanal isso não paga o aluguel. (2) Ela recomendava Cloudflare R2 para snapshots; o R2 pede cartão no cadastro, então troquei por um repositório de dados no GitHub. (3) A regra do GitHub que desativa workflows agendados após 60 dias sem atividade não deve nos atingir, porque o próprio coletor faz commit semanal no repositório de dados; mesmo assim, o heartbeat do Healthchecks avisa se a coleta parar.

### 8.2 Alternativa conservadora — fora do escopo
Vercel Pro + Supabase Pro (~US$ 45/mês): menos peças, backups gerenciados. **Descartada pela decisão "só free tier".** Fica registrada para o caso de o projeto ganhar financiamento.

### 8.3 Alternativa independente de vendor
VPS com Docker Compose (Next.js `standalone`, Postgres, Caddy, coletores via systemd timer). Os VPS são pagos, com uma exceção: **Oracle Cloud Always Free** (2 OCPU / 12 GB), que é gratuito mas pode recuperar instâncias ociosas e dá mais trabalho de manutenção (patches, backups, TLS). Vantagem real: IP fixo, fácil de a Câmara liberar. Fica como plano B se a Vercel Hobby deixar de servir.

### 8.4 Comparação
| Critério | Recomendada | Conservadora | Independente |
|---|---|---|---|
| Cabe em "só free tier" | **Sim** | Não | Só com Oracle Always Free |
| Custo | R$ 0 | ~US$ 45/mês | R$ 0 (Oracle) ou pago |
| Manutenção | Baixa | Muito baixa | Alta |
| Lock-in | Médio-baixo | Médio | Baixo |
| IP fixo para liberação na Câmara | Não (Actions) | Não | Sim |
| Previews por PR | Sim | Sim | Não (montar) |

---

## 9. Estratégia free tier

| Componente | Serviço / plano gratuito | Limite relevante | Uso estimado | Se estourar |
|---|---|---|---|---|
| Site + admin | Vercel Hobby | 100 GB de banda, 1 M requisições CDN, 4 h de CPU ativa/mês; uso **pessoal e não comercial**; 1 desenvolvedor; repositório pessoal (não de organização) | Site quase todo estático: folgado | Recurso bloqueado até o mês seguinte → plano B (Oracle Always Free) |
| Banco | Neon Free | 1 GB, 100 CU-h, 5 GB de egress/mês; se estourar, o banco fica suspenso até o mês seguinte; histórico de 6 h | < 300 MB/ano; < 20 CU-h/mês com coleta semanal e autoscaling limitado | Cache agressivo; exportações fora do banco; alerta de uso |
| Coleta | GitHub Actions (repo público) | Grátis; jobs de até 6 h | ~10–20 min por semana | — |
| Snapshots e dados abertos | Repositório público no GitHub | Recomendado < 1 GB; arquivo < 100 MB | Poucos MB por ano (JSON comprimido) | Podar snapshots antigos mantendo os normalizados |
| Backups | Repositório privado no GitHub | Idem | Dezenas de MB/ano | Reter só os últimos N |
| Erros | Sentry Developer | 1 usuário, 5 mil erros/mês | Baixo | Pedir patrocínio open source do Sentry (grátis) |
| Heartbeat | Healthchecks.io | 20 checks | ~5 | — |
| Uptime + página de status | UptimeRobot | 50 monitores, 5 min | ~3 | — |
| Endereço | Subdomínio `*.vercel.app` | — | — | Domínio próprio só se houver decisão futura |

**Armadilhas que o desenho evita:** cron horário na Vercel Hobby (não existe e não precisamos), Vercel Blob (2 mil uploads/mês), Cloudflare R2 (exige cartão), Supabase Free (pausa e não faz backup), Prisma Postgres (cobra por operação), Railway (incidente de segurança em 21/10/2026), IA paga.

**Ponto de atenção honesto:** os termos da Vercel Hobby falam em uso "pessoal e não comercial". Um portal mantido por voluntário, sem anúncios nem venda, tende a se encaixar; se algum dia houver pagamento a quem desenvolve, deixa de se encaixar. Registrado como risco (seção 18).

---

## 10. Produto

### 10.1 O que o portal é (e o que não é)
- **É:** um portal para acompanhar **todos os vereadores de Pindamonhangaba**, um a um: o que apresentaram, como votaram, quando estiveram presentes, que diárias receberam e para onde indicaram emendas impositivas — com cada número levando à lista que o compõe e cada item levando ao documento oficial.
- **Não é:** um espelho do site da Câmara. Não republica textos integrais, notícias, pautas completas, licitações ou a estrutura institucional. Quando o cidadão quer o documento, o portal manda para o site oficial.

### 10.2 Arquitetura de informação
Menu principal: **Vereadores · Votações · Como funciona** + **Buscar**. Utilitário: **Sobre os dados**. Rodapé: Metodologia · Dados abertos · Correções · Sobre · Reportar erro · "Mantido pelo Observatório Social do Brasil – Pindamonhangaba. Este não é o site oficial da Câmara."

Itens do briefing e onde ficaram:
- **Vereadores:** centro do produto.
- **Proposições:** não são uma seção própria; aparecem como lista filtrável a partir de cada vereador e da busca (`/proposicoes?autor=…`), com página mínima por proposição.
- **Votações:** seção própria porque responde "como cada um votou"; inclui o recorte "votações divididas".
- **Sessões e Câmara:** sem seção espelhada; entram como contexto (data da sessão na votação, presença no perfil) e numa página curta "Como funciona" com o glossário.
- **Temas, Comparar:** filtros e a visão "lado a lado" dentro de Vereadores (ordem alfabética, mesmo período, denominadores — nunca ranking).
- **Explorar dados:** as listas filtráveis são o explorador; downloads em `/dados`.

### 10.3 Mapa do site
```
/                                  Início: os 11 vereadores + o que mudou na semana
/vereadores/{slug}                 Perfil (abas: proposições · votos · presença · diárias e emendas · sobre os dados)
/vereadores/lado-a-lado            Tabela neutra, ordem alfabética
/proposicoes                       Lista filtrável (destino dos números clicáveis e da busca)
/proposicoes/{tipo}/{ano}/{numero} Página mínima: ementa, autores, situação, votos, link oficial
/votacoes                          Votações nominais (?divididas=1)
/como-funciona                     Câmara em 2 minutos + glossário (/glossario/{termo})
/dados                             Downloads, dicionário, calendário de coleta, status das fontes
/metodologia/{topico}              Presença, votações, natureza das proposições, limites
/correcoes                         Histórico público de correções
/sobre                             Observatório Social do Brasil – Pindamonhangaba, princípios, contato
```

### 10.4 Páginas-chave
- **Início:** os 11 vereadores em ordem alfabética (foto, nome parlamentar, partido); "nesta semana: N proposições novas, M votações nominais"; votações divididas recentes; busca; selo "dados até dd/mm".
- **Vereador:** foto com crédito, nome parlamentar e civil, partido, mandato, cargos; "Em resumo" com 3–4 frases factuais (ex.: "Entre 01/01/2025 e 23/10/2026, foi autora ou coautora de **241 requerimentos**…", cada número é link); atividade recente; abas.
- **Proposição (mínima):** tipo, número, ano, ementa, autores, situação atual com data, votações, natureza, link "ver documento completo no site da Câmara". Sem texto integral.
- **Votação:** resultado em texto ("Aprovado · 7 sim, 3 não, 1 ausente"), 11 marcadores com nome agrupados por voto, quórum com link ao glossário; votação simbólica escrita como tal.

### 10.5 Fluxos principais
1. "O que meu vereador fez?" → Início → vereador → clique no número → lista filtrada → item → documento oficial.
2. "O que pediram para o meu bairro?" → Buscar "Araretama" → filtro de bairro (classificação da própria Câmara) → lista → compartilhar URL no WhatsApp.
3. "Como votaram no projeto X?" → busca "PL 45/2026" → votação → voto de cada um.
4. "De onde vem esse número?" → "Sobre estes dados" → método versionado → download.

### 10.6 Busca
Uma caixa que entende "PL 45/2026", "req 2398/2026", nome de vereador (tolerante a erro via `pg_trgm`), bairro e texto livre (FTS em português sem acento sobre ementas). Filtros na URL.

### 10.7 Uso de IA
Com a decisão "só free tier", **IA paga fica fora**. E, avaliando caso a caso, ela não faz falta na v1:

| Uso | Precisa? | Decisão |
|---|---|---|
| Bairro | Não | A API da Câmara já classifica |
| Tipo, autor, situação | Não | Vêm estruturados da fonte |
| Natureza (rotineira × substantiva) | Não | Regras por tipo + palavras-chave da ementa, revisáveis no admin |
| Tema | Talvez, depois | Regras por palavras-chave na v1; IA só se surgir opção gratuita confiável e com revisão humana |
| Resumo cidadão | Não na v1 | A ementa oficial + nota de contexto por tipo bastam; o documento completo está a um clique |
| Explicar situação de tramitação | Não | Texto fixo por tipo de evento no vocabulário controlado |

---

## 11. UI/UX

Referências e princípios completos em `benchmark-design.md` (12 princípios).

### 11.1 Direção visual: editorial cívico
- Inspiração de produto: OpenParliament.ca (URLs e notas de contexto), HowTheyVote.eu (página de votação e bloco de fonte), TheyWorkForYou (método público de votos), GOV.UK/USWDS (componentes: summary list, inset text, details, tag, collection, step indicator), Our World in Data (ficha técnica de cada gráfico).
- Tom: jornal sério e acolhedor — papel claro, tinta escura, tipografia bem feita, poucos elementos, muito respiro. Nenhum card decorativo, gradiente, sombra grande, ícone aleatório ou animação gratuita.
- Behance e Awwwards não trouxeram referência útil para dados legislativos (análise na pesquisa).

### 11.2 Identidade a partir da marca do OSB
- Marca do OSB: mapa do Brasil em verde-folha, raios amarelos, lupa, e o logotipo "Observatório" em **serifa de alto contraste**. O Power BI já usava `#1C6437`, `#8ABF42` e `#9ABD4F`.
- Tradução para o produto: serifa editorial nos títulos (eco do logotipo) + sans humanista na interface.
- **Tipografia:** Source Serif 4 (títulos, textos) + Source Sans 3 (interface, tabelas). Ambas com algarismos tabulares e bons acentos. Auto-hospedadas, subset latin + latin-ext.

### 11.3 Tokens semânticos (proposta, com contraste medido)
| Token | Claro | Escuro | Regra |
|---|---|---|---|
| `background` | `#FAFAF7` (papel) | `#121512` | — |
| `surface` | `#FFFFFF` | `#1A1F1A` | — |
| `foreground` | `#1A1F1A` (16:1) | `#ECEFEA` | texto |
| `muted` | `#5B635B` (5,9:1) | `#A3AAA3` (7,7:1) | texto secundário |
| `primary` | `#1C6437` (6,9:1) | `#8ABF42` (8,4:1) | links, botões, foco |
| `brand-leaf` | `#8ABF42` (2,1:1) | — | **só decorativo** (marca, ilustração), nunca texto ou borda funcional |
| `accent` | `#8A6A00` (4,9:1) | `#E3D23B` (11,9:1) | destaques pontuais (raios do logo) |
| `border` | neutro de 3:1 contra o fundo | idem | componentes (WCAG 1.4.11) |
| `success` / `warning` / `danger` | só para estado do sistema (coleta ok, atrasada, falhou) | idem | **nunca** para julgar vereador |
| `data-series-*` | paleta categórica neutra validada por contraste e daltonismo | idem | sem cores de partido; sem verde=bom/vermelho=ruim |

Votos codificados por forma e cor ao mesmo tempo: ● sim · ✕ não · ◌ ausente · — não vota por regra.

### 11.4 Mobile, acessibilidade e performance
- Mobile de verdade: listas de registros como lista de cartões semânticos; tabelas reais só para comparação, com primeira coluna fixa e rolagem horizontal dentro de região rotulada; filtros em painel de tela cheia com contagem por opção e botão "Mostrar N resultados"; linha do tempo vertical.
- WCAG 2.2 AA desde o design system: contraste medido nos tokens, foco visível, alvos ≥ 24 px, toggletips (não tooltips de hover) para jargão, gráficos com "ver como tabela" e texto alternativo gerado do mesmo modelo de frase, `prefers-reduced-motion`, testes com axe no CI.
- Orçamentos: LCP < 2,0 s em 4G de celular médio; CLS < 0,05; INP < 200 ms; JS no cliente ≤ 70 KB gzip nas páginas públicas (a maioria com zero); HTML < 150 KB; imagens AVIF/WebP com `sizes`.

### 11.5 SEO e compartilhamento
URLs humanas, canonical, title/description por entidade, Open Graph com imagem gerada por vereador e proposição (estática), sitemap index por tipo, robots, JSON-LD (`Person` com `memberOf`, `Legislation`, `GovernmentOrganization`, `Dataset` para os downloads).

---

## 12. Admin

Pragmático, no mesmo app, com Better Auth (convite, sem cadastro aberto; TOTP ou passkey; papéis `admin` e `editor`).

| Tela | Conteúdo |
|---|---|
| Fontes | status por fonte (ok, atrasada, bloqueada, degradada), última coleta bem-sucedida, próxima prevista |
| Execuções | histórico: duração, itens vistos/novos/alterados, erros, avisos, snapshots; detalhe de falha |
| Pendências | registros reprovados na validação, possíveis duplicatas (ex.: mesmo vereador com dois IDs), conflitos de correção |
| Correções | criar/remover override com motivo; ver valor da fonte × corrigido |
| Identidades | casar apelidos e pessoas; vocabulário de tipos, situações, temas |
| Coleta assistida | enviar PDF de votação/ata; ver o que o parser extraiu antes de publicar |
| Ações | rodar coleta agora (dispara o workflow), reprocessar a partir de snapshots |
| Usuários e auditoria | quem fez o quê e quando (append-only) |

---

## 13. Automação

- **Agendas (semanais, decisão do dono do projeto):** API da Câmara toda quarta de manhã, depois da sessão ordinária de terça; tramitação/votos no mesmo horário, quando liberados; SIAPE semanal; TCE-SP mensal (a fonte só fecha o mês depois); TSE por eleição; reconciliação completa mensal. Disparo manual disponível para correções e para semanas atípicas (sessões extraordinárias).
- **Concorrência:** um coletor por fonte de cada vez (`concurrency` no workflow); timeout por execução.
- **Retries:** backoff exponencial com jitter só para falha de rede e 5xx; 4xx e "Bot Verification" não são repetidos.
- **Checkpoints:** cursor por fonte (última página/ID visto) no banco; uma execução interrompida retoma.
- **Monitoramento:** cada execução grava `execucao_coleta`, faz ping no Healthchecks (início, sucesso, falha) e manda erros ao Sentry; UptimeRobot monitora o site e a página de status das fontes; alerta por e-mail.
- **Pós-coleta:** invalidação de cache só das entidades alteradas; regeneração das exportações e commit dos snapshots/dados abertos no repositório público de dados (o commit semanal também mantém o repositório ativo, evitando a desativação automática do `schedule`).
- **Backups:** `pg_dump` semanal, criptografado (`age`), guardado como artefato em repositório privado no GitHub, com retenção de 12 semanais + 12 mensais; restauração testada todo mês e documentada. O Neon Free ainda oferece restauração pontual curta como segunda linha.

---

## 14. Segurança e privacidade

**Segurança**
- Segredos só em variáveis de ambiente (Vercel, GitHub Actions); `.env.example` sem valores; validação de ambiente na inicialização (Zod).
- Papéis de banco separados: leitura para o site, escrita para a ingestão, migrations com outro usuário.
- Autorização checada no servidor em toda Server Function/rota do admin (nunca só no `proxy.ts`).
- Cabeçalhos: CSP estrita, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; CSRF coberto pelas Server Actions + cookies `SameSite`.
- Rate limiting no login e nos endpoints de exportação filtrada.
- Coletores só acessam hosts de uma lista permitida (anti-SSRF); limites de tamanho e timeout em PDFs.
- Dependências: Renovate/Dependabot com janela semanal (o Next.js teve patches de segurança frequentes em 2026), `pnpm audit` e CodeQL no CI, secret scanning do GitHub.
- Logs sem segredos e sem dados pessoais além do necessário.

**LGPD e responsabilidade editorial**
- Base: dados de agentes públicos no exercício da função são de interesse público; ainda assim, minimizar.
- Não coletar CPF, endereço, bens, dados de familiares.
- **O portal não republica o texto integral das proposições** (não é um espelho do site da Câmara): mostra ementa, metadados e link para o documento oficial. Isso também resolve os **textos de honrarias**, que citam cidadãos comuns (biografia, data de nascimento).
- Fornecedores pessoa física em despesas: mostrar nome só quando a fonte oficial já publica e houver função pública (ex.: diária de vereador); caso contrário, "pessoa física" com link à fonte.
- Distinguir sempre "dado oficial da Câmara" de "dado de outra fonte pública" e de "dado derivado pelo OSB".
- Páginas obrigatórias: política de privacidade (o site não coleta dados do visitante além de métricas agregadas sem cookies), termos de uso, canal de correção com prazo de resposta, e espaço para manifestação do vereador sobre os próprios dados.

---

## 15. Qualidade

| Camada | O que cobrir |
|---|---|
| Parsers | fixtures reais (HTML, JSON, PDF) → saída esperada; um caso por variação conhecida; teste que falha se o layout mudar |
| Plausibilidade | regras sobre o conjunto (volume vs. média móvel, campos obrigatórios, numeração sequencial, datas) |
| Banco | migrations aplicadas do zero num Postgres real (Testcontainers); FTS; triggers de auditoria; view de overrides |
| Unidade | normalização, apelidos, métodos de métricas |
| Contrato número = lista | para cada contagem publicada, teste que compara com o total da lista correspondente |
| E2E | login no admin, correção + auditoria, busca, filtro por URL, exportação |
| Acessibilidade | axe nas páginas principais no CI + revisão manual com leitor de tela antes do lançamento |
| Performance | Lighthouse com orçamentos nas previews |
| Smoke pós-deploy | páginas-chave respondem, últimas coletas recentes, sitemap válido |

Definition of done do briefing adotada como está.

---

## 16. DevOps

```
commit → CI (lint, typecheck, testes, build, migrations num Postgres efêmero)
       → preview na Vercel + branch do Neon por PR
       → revisão → merge na main
       → migrations aplicadas por job com aprovação (environment "production")
       → deploy de produção → smoke test
```

- Repositório: sugiro renomear para **`acompanhe-seu-vereador`** (o GitHub redireciona o nome antigo). Branch `main` protegida (PR obrigatório, CI verde), Conventional Commits, Renovate, CodeQL, templates de issue só para "erro nos dados" e "sugestão".
- Migrations: SQL gerado pelo Drizzle, revisado no PR, aplicado por job — nunca `db push` em produção; seed só com dados fictícios para desenvolvimento, separado de qualquer dado real.
- Vercel: projeto conectado ao GitHub, previews por PR, produção na `main`, variáveis por ambiente, previews protegidas (Vercel Authentication) enquanto houver admin com dados de teste.

---

## 17. Documentação

```
README.md                 o que é, como rodar, como contribuir
CLAUDE.md                 memória para sessões do Claude Code
HANDOFF.md                estado atual e próximos passos
docs/architecture.md      visão geral e diagramas
docs/data-sources.md      fontes, acesso, limites, contatos
docs/data-model.md        entidades, relações, política de correções
docs/ingestion.md         coletores, agendas, plausibilidade, reprocessamento
docs/deployment.md        ambientes, migrations, variáveis
docs/admin.md             manual do administrador
docs/methodology.md       base da página pública de metodologia
docs/troubleshooting.md   o que fazer quando uma fonte quebra
docs/security.md          ameaças, controles, LGPD
docs/adr/NNNN-*.md        decisões (a partir da aprovação deste plano)
docs/research/            esta pesquisa
```

---

## 18. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Câmara não libera o coletor** para tramitação/votos | Média | Alto | Pedido institucional cedo; LAI; coleta assistida por PDF; lançar com o que a API cobre |
| Anti-robô bloquear também a API | Baixa | Alto | Detector + alerta; token identifica o cliente; contato com a TI da Câmara |
| Troca do sistema da Câmara (PHP 7.4 em fim de vida; já trocaram SAPL/Plone → SoftCam) | Média em 2–4 anos | Alto | Snapshots brutos + parsers isolados por fonte + modelo próprio independente do fornecedor |
| Mudança de layout/HTML | Média | Médio | Fixtures, plausibilidade, alerta, reprocessamento |
| API mudar campos sem aviso | Média | Médio | Zod estrito com alerta em campo desconhecido |
| Erro silencioso (200 vazio, página de desafio) | Alta | Alto | Detectores explícitos + disjuntor |
| Inconsistência entre fontes (SIAPE × TCE; apelidos) | Alta | Médio | Reconciliação explícita; divergência vira pendência, não "correção automática" |
| Dados históricos incompletos | Alta | Médio | Rótulo "histórico importado"; lacuna mostrada como lacuna |
| Interpretação legislativa errada (ex.: presidente "ausente") | Média | Alto | Regras do Regimento revisadas por alguém do OSB; vocabulário controlado; notas de papel |
| Leitura de volume como mérito / uso político | Alta | Alto | Sem ranking, natureza da proposição, contexto obrigatório, princípios editoriais publicados |
| Termos da Vercel Hobby (uso institucional) | Média | Médio | Projeto voluntário e não comercial, sem anúncios nem doações no site; perguntar ao suporte da Vercel; plano B gratuito: Oracle Always Free (seção 8.3). Upgrade pago está fora do escopo |
| Neon estourar cota e suspender | Baixa | Alto | Autoscaling limitado, cache agressivo, exportações fora do banco, alerta de uso |
| `schedule` do Actions desativado por inatividade (60 dias sem commit) | Baixa | Médio | Commit semanal de dados mantém o repositório ativo; heartbeat no Healthchecks alerta se a quarta-feira passar sem coleta |
| Token/credencial expirar | Média | Médio | Datas anotadas, heartbeat detecta |
| Sustentabilidade (voluntários saem) | Alta | Alto | Custo zero, documentação, dados abertos no GitHub, "modo arquivo" planejado |
| Um free tier mudar as regras | Média | Médio | Nada depende de um único fornecedor sem saída: Postgres padrão, dados em Git, plano B documentado |
| Fotos oficiais e direitos de imagem | Baixa | Baixo | Usar as fotos oficiais com crédito; pedir autorização formal junto com o pedido do token |

### 18.1 Hipóteses a verificar (primeiras tarefas da implementação)
- **H1** — Campos reais de cada serviço da API (precisa do token).
- **H2** — A API traz situação/tramitação ou só dados básicos?
- **H3** — Profundidade histórica do SoftCam (desde quando há matérias e normas).
- **H4** — Como a coautoria é representada.
- **H5** — Toda votação registra votos individuais ou há votação simbólica sem registro?
- **H6** — Quando o presidente vota (Regimento Interno) — redação da nota de contexto.
- **H7** — Onde ficam ausências justificadas.
- **H8** — Parâmetros das consultas do SIAPE GOV (captura no navegador).
- **H9** — Cobertura do Jornal Oficial de Pindamonhangaba no Querido Diário.
- **H10** — Se o bloqueio anti-robô é por IP, por User-Agent ou por reputação (só a TI da Câmara pode responder; não vamos testar contornos).

---

## 19. Ambiente Claude Code preparado

| Ferramenta | Versão | Origem | Escopo | Função | Observações |
|---|---|---|---|---|---|
| Superpowers | 6.4.2 | obra (Jesse Vincent), diretório oficial Anthropic | Projeto | brainstorming, planos, execução, TDD, debugging sistemático, verificação antes de concluir, code review, subagentes | habilitado em `.claude/settings.json` |
| frontend-design | build 58267944 | Anthropic | Projeto | direção visual de UI | — |
| Playwright MCP | build 7d7dbbd9 | Microsoft | Projeto | navegador para QA e captura de requisições | Chromium já no contêiner |
| security-guidance | 2.0.13 | Anthropic | Conta | alertas de segurança ao editar | já ativo (disparou ao editar o workflow) |
| modern-web-guidance | 0.0.194 | Anthropic | Conta | boas práticas web | já ativo |
| design (accessibility-review, ux-copy) | — | Anthropic | Conta | acessibilidade e microcopy | já ativo |
| code-review, security-review, simplify | — | Claude Code | Nativo | revisão | — |
| MCPs GitHub, Vercel, Supabase, Google Drive, Context7, Brandfetch | — | conectores claude.ai | Conta | integração | Vercel Sandbox usado na pesquisa |
| Memória | — | repositório | Projeto | `CLAUDE.md`, `HANDOFF.md`, `docs/` | memória nativa não persiste em contêiner efêmero |
| Sondagem de fontes | — | repositório | Projeto | `.github/workflows/source-probe.yml` | roda manualmente ou quando o próprio arquivo muda |

Detalhes e o que deliberadamente não foi instalado: `docs/environment.md`.

Limites que respeitei: o classificador de segurança bloqueou o uso de proxy de terceiros, o teste de variação de User-Agent contra o anti-robô e a edição das minhas próprias permissões. Os três bloqueios estavam certos.

---

## 20. Decisões que preciso de você

**Já decididas (24/10/2026):** escopo só de Pindamonhangaba (Observatório e Câmara); só free tier, sem cartão e sem domínio pago (endereço `*.vercel.app`); atualização semanal; portal centrado nos vereadores, que linka para os documentos oficiais em vez de copiar o site da Câmara; sem IA paga (temas só por regras).

Ainda em aberto:

1. **Pedido institucional à Câmara** (o mais importante). O OSB envia ofício pedindo: (a) liberação do User-Agent do coletor no anti-robô; (b) se possível, tramitação, votações e presenças na API; (c) autorização de uso das fotos oficiais. Quem assina e quando?
2. **Token da API:** alguém do OSB cria a conta de cidadão no site da Câmara e me passa o token como secret do GitHub (nunca no chat ou em commit).
3. **Enquanto a Câmara não libera:** aceita a **coleta assistida** (voluntário envia o PDF de votação/ata pelo admin) como ponte? Ou prefere lançar sem votações e presenças?
4. **Licenças:** código **MIT** (máximo reuso) ou **AGPL-3.0** (obriga quem reusar a publicar melhorias)? Dados: **CC BY 4.0**?
5. **Profundidade histórica da v1:** só a legislatura atual (2025–2028) ou também 2021–2024?
6. **Dados pessoais:** mostrar nomes de assessores/servidores (o portal oficial já mostra)? Minha recomendação: não na v1; mostrar só agregados por gabinete se a fonte permitir atribuição.
7. **Temas por regras:** quem do OSB revisa o vocabulário de temas (palavras-chave → tema) antes de publicar?
8. **Governança editorial:** quem são os administradores, quem aprova correções e qual o e-mail público de contato e correção?
9. **GitHub:** posso criar a branch `main` com um commit inicial (README e licença) para abrir o PR desta pesquisa? E renomear o repositório para `acompanhe-seu-vereador`?

---

## 21. Roadmap

Cada fase termina com algo funcionando e verificável. Fases 2–3 dependem só do token; a 7 depende da Câmara.

| # | Fase | Entrega verificável |
|---|---|---|
| 0 | Pré-requisitos (paralelo) | Ofício enviado; token obtido; decisões da seção 20 respondidas |
| 1 | **Foundation** | `main` protegida, README, licença, CI verde (lint, typecheck, testes, build); app Next.js vazio com headers de segurança em preview; Postgres + migrations reproduzíveis; ADRs 0001–0005 |
| 2 | **Ingestão — núcleo + API da Câmara** | Cliente HTTP educado, snapshots no repositório público de dados, `execucao_coleta`, plausibilidade; coletor semanal de vereadores/proposições/normas/pautas/bairros via API no Actions; fixtures; relatório das hipóteses H1–H4 |
| 3 | **Modelo e reconciliação** | Modelo completo (pessoas, mandatos, apelidos, proposições, autoria, normas); importação do baseline do Power BI; relatório de divergências fonte × Power BI |
| 4 | **Admin mínimo** | Login com 2FA; telas de fontes, execuções, pendências, correções e auditoria |
| 5 | **Público — Vereadores e Proposições** | Perfis e páginas de proposição com proveniência; teste "número = lista" no CI; mobile e axe aprovados |
| 6 | **Busca** | FTS + trigramas + filtros na URL + bairro; tempos medidos |
| 7 | **Tramitação, sessões e votações** | Coletor da tramitação (se liberado) ou coleta assistida; páginas de sessão e votação; votações divididas |
| 8 | **Presenças** | Extração das atas com taxa de acerto medida; metodologia de presença publicada |
| 9 | **Transparência** | Despesas da Câmara (SIAPE × TCE reconciliados), diárias, emendas impositivas |
| 10 | **Metodologia e dados abertos** | Páginas de metodologia, glossário, correções; exportações CSV/JSON com dicionário |
| 11 | **Temas por regras** | Vocabulário de temas revisado pelo OSB; classificação por palavras-chave, rotulada como derivada; sem IA paga |
| 12 | **Hardening** | Auditoria de acessibilidade manual, orçamentos de performance, revisão de segurança, alertas, teste de restauração de backup |
| 13 | **Lançamento** | Produção no endereço gratuito `*.vercel.app`, status page, anúncio |

Próximo passo concreto após sua aprovação: Fase 1, começando por `superpowers:writing-plans` para transformar este roadmap em plano de implementação detalhado da Foundation.
