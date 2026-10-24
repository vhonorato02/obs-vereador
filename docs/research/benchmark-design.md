# Acompanhe seu Vereador — benchmark, referências de design e arquitetura de informação

*Pesquisa de produto cívico para o Observatório Social do Brasil – Pindamonhangaba · versão de 24/10/2026*

---

## 0. Resumo executivo: as 8 lições mais importantes

1. **Cada número leva à lista que o compõe.** Os melhores produtos (Chicago Councilmatic, HowTheyVote, Câmara dos Deputados) tratam a contagem como ponto de entrada. "241 requerimentos" é um link para `/proposicoes?tipo=requerimento&autor=…&legislatura=…`, que lista os 241 itens e pode ser baixado em CSV. Um teste automatizado deve garantir que o número exibido é igual ao total da lista. O que o Power BI faz mal (estado não compartilhável, números sem saída) é exatamente o que este produto precisa fazer bem.
2. **Contexto vem antes de qualquer comparação.** Um número bruto engana: o perfil do chanceler alemão no abgeordnetenwatch mostra "0 / 463 perguntas respondidas" e votos "não participou". O NosDéputés virou incentivo para deputados inflarem emendas (efeito Goodhart). Todo número deve trazer **denominador, período, papel institucional** (Presidente da Mesa, licença, suplente) e, quando fizer sentido, **a mediana da Câmara no mesmo período**, como faz o GovTrack com votos perdidos.
3. **Separar o rotineiro do substantivo.** Chicago Councilmatic marca "Non-Routine" porque a maior parte do volume é honraria e licença. A Política por Inteiro classifica atos "sem juízo de valor do impacto". O OSB-SP usa eixos temático e funcional. Em Pindamonhangaba, indicações, moções de congratulação e votos de pesar podem dominar as contagens. Mostrar a **natureza** da proposição é o que impede que volume seja lido como mérito.
4. **Neutralidade é método publicado e versionado, não slogan.** O TheyWorkForYou publica e revisa em público como resume votos: ausência não conta como abstenção, divergência do partido só é sinalizada acima de 60/40, há atualizações trimestrais e formulário de correção. Já o GovTrack retratou em 2024 os boletins anuais de 2013, 2015, 2017 e 2019 depois do uso político de um deles. O Ranking dos Políticos e as listas "Top 10 / Bottom 10" da CalMatters mostram o caminho a evitar: nada de nota, peso, semáforo, "top" ou ordenação padrão por volume.
5. **Proveniência registro a registro, com data, sem poluir a página.** O padrão a copiar é o do HowTheyVote: um bloco "Fontes" com **data e hora de acesso**, mais "Baixar dados" e "Reportar erro". Do Our World in Data vêm "Última atualização" e "Próxima atualização prevista". O Councilmatic linka cada proposição ao site oficial ("View on City Clerk website"). Em resumo: um rodapé de dados discreto e padronizado em toda página-registro, e uma página "Metodologia" para o detalhe.
6. **Mostrar votações divididas e não fingir votação nominal.** Numa casa onde quase tudo passa por unanimidade ou votação simbólica, a página "Divided Votes" do Councilmatic (votações com ao menos um "não") é o recorte de maior valor. O TWFY Votes registra decisões sem votação nominal como "Agreements", e não como "todos votaram sim". Com 11 vereadores, cada voto é mostrado por pessoa (nome, foto e rótulo), nunca em gráfico de pizza.
7. **URLs humanas, estáveis e previsíveis por entidade.** Bons modelos: OpenParliament (`/bills/45-1/C-247/`, `/politicians/elizabeth-may/`), abgeordnetenwatch (`/profile/friedrich-merz/abstimmungen`) e GovTrack (`/congress/bills/119/hr1`). Para nós: `/vereadores/{nome-parlamentar}`, `/proposicoes/{tipo}/{ano}/{numero}`, `/sessoes/{aaaa-mm-dd}-{tipo}`, com filtros em *query string* compartilhável pelo WhatsApp. Hashes e IDs opacos ficam fora (TWFY `/mp/?p=`, HowTheyVote `/votes/198292`).
8. **Sustentabilidade é requisito de produto.** O "cemitério" cívico brasileiro é grande: o domínio do Radar Parlamentar e o do Excelências foram tomados por outros sites; o Achados e Pedidos foi desativado em 31/01/2026; o Jarbas (Serenata de Amor) está fora do ar; o Basômetro parou em 2022; o Monitor da Bancada (O Povo) parou em 2023. Até o "Acompanhe seu Vereador" do OS Campos Gerais tem hoje um subdomínio que não resolve DNS. A resposta passa por domínio próprio renovado a longo prazo, arquitetura barata (estática), dados versionados e depositados em repositório público, esquema de dados reutilizável pela rede OSB e um plano de "modo arquivo".

---

## 1. Método e limites

- **Verificação de status em 24/10/2026** com WebFetch, `curl` e WebSearch. "Ativo" significa que o próprio site exibe conteúdo datado de 2026 (ou repositório, pacote ou publicação de 2026). Cada ficha diz o que foi observado.
- **Bloqueios encontrados:**
  - **GovTrack** bloqueia acesso automatizado (Cloudflare, HTTP 403). O status foi confirmado por posts de ago–set/2026, e a descrição das páginas usa fontes secundárias e conhecimento prévio, marcados com †.
  - **TheyWorkForYou**: a home respondeu com itens de 22/10/2026, mas as páginas de perfil retornaram 503 temporário.
  - **NosDéputés.fr**: 503 ou conexão resetada.
  - **API do Querido Diário**: o *handshake* TLS falhou no ambiente de pesquisa, por isso a cobertura de Pindamonhangaba **não** foi verificada.
- **Fontes tipográficas**: os arquivos originais do repositório `google/fonts` foram lidos em memória para checar as *features* OpenType (`tnum`, `lnum`, `smcp`…), a largura padrão dos algarismos e os glifos do português (ã, õ, ç, Ã, Õ…). Os resultados estão na seção 3.3.
- Regras específicas de Pindamonhangaba (Regimento Interno, Lei Orgânica, quando o Presidente vota, como a presença é registrada) **não** foram pesquisadas aqui e precisam ser confirmadas na fonte oficial antes de virar texto do produto.

---

## 2. Parte A — Benchmark

### 2.1 Quadro geral

| # | Produto | Escopo | Status em 24/10/2026 | Por que importa para nós |
|---|---|---|---|---|
| 1 | Chicago Councilmatic (DataMade) | Câmara municipal, EUA | **Ativo** (eventos de out–dez/2026, © 2026) | Análogo mais próximo: casa municipal, proposições, sessões e vereadores |
| 2 | GovTrack.us | Congresso dos EUA | **Ativo** (posts de ago–set/2026) | Status de tramitação e contexto relativo; alerta sobre escores derivados |
| 3 | TheyWorkForYou + TWFY Votes (mySociety) | Parlamento do Reino Unido | **Ativo** (itens de 22/10/2026; resumos de voto atualizados até abr/2026) | Melhor método público de resumo de votos e votação sem registro nominal |
| 4 | OpenParliament.ca | Parlamento do Canadá | **Ativo** (transcrição de 22/10/2026) | URLs exemplares, notas de contexto, IA rotulada |
| 5 | HowTheyVote.eu | Parlamento Europeu | **Ativo** (votos de 20–22/10/2026) | Página de votação e proteção da fonte exemplares |
| 6 | abgeordnetenwatch.de | Bundestag, Landtage e UE | **Ativo** (perguntas de 19–21/10/2026) | Perfil com abas e URLs humanas; contraexemplo de número sem papel institucional |
| 7 | NosDéputés.fr (Regards Citoyens) | Assembleia Nacional francesa | **Incerto** (503; página fala em nova versão para os eleitos de 2024) | Contraexemplo: métrica de atividade gera efeito Goodhart |
| 8 | Open States / Plural | Legislativos estaduais, EUA | **Dados e API ativos**; site legado com "most tools disabled"; Plural adquirida pela SAI360 (dez/2025) | Padrão de dados (Open Civic Data) e risco de comercialização |
| 9 | CalMatters Digital Democracy | Legislativo da Califórnia | **Ativo** ("California Agenda 2026", © 2026) | Jornalismo com dados; contraexemplo das listas Top/Bottom 10 |
| 10 | Câmara dos Deputados (Dados Abertos + perfil) | Câmara federal | **Ativo** | Vocabulário controlado, "?" de ajuda, separação entre ausência justificada e não justificada |
| 11 | Querido Diário (OKBR) | Diários oficiais municipais | **Ativo** (API v0.22.7 de jul/2026; commits em out/2026) | Proveniência complementar (leis, sanções, vetos); infraestrutura cívica longeva |
| 12 | Rede OSB (OSB-SP, OS Foz, OS Campos Gerais) | Câmaras municipais | OSB-SP **ativo** (Power BI); Foz (2023); Campos Gerais (**DNS não resolve**) | Pares diretos: vocabulário da rede e o padrão Power BI a superar |
| 13 | Ranking dos Políticos | Congresso | **Ativo** (atualizado em 27/07/2026) | Contraexemplo: ranking com juízo de valor |
| 14 | Transparência Brasil · Fiquem Sabendo · Política por Inteiro | Transparência, LAI, monitoramento de atos | **Ativos** (01/10, 17/08 e 23/10/2026) | Taxonomia sem juízo de valor; LAI como fonte; manchete-dado |
| — | "Cemitério cívico" (Radar Parlamentar, Excelências, Achados e Pedidos, Jarbas, Basômetro…) | Vários | **Encerrados, congelados ou com domínio tomado** | Lição de sustentabilidade |

### 2.2 Fichas

#### 1. Chicago Councilmatic (DataMade) — o análogo mais próximo
- **O que é:** portal da Câmara de Chicago com proposições desde 2011, 50 vereadores (*alders*), comissões e reuniões. Os dados vêm diariamente do sistema do City Clerk, no padrão Open Civic Data, e há um banco SQLite para download atualizado toda noite.
- **URL:** https://chicago.councilmatic.org · família: https://councilmatic.org (hoje lista só Chicago e LA Metro, https://boardagendas.metro.net; NYC e Filadélfia, presentes em 2016, não aparecem mais).
- **Status 2026:** ativo. Próxima sessão em 08/12/2026, comissões em 26–28/10, © 2026.
- **O que faz excepcionalmente bem:**
  - **"Non-Routine"**: a página Sobre admite que a maior parte das proposições mensais é rotineira (licenças de placas, indenizações, honrarias) e marca o resto como não rotineiro. A home mostra "Since the last council meeting" com o total e o número de itens não rotineiros.
  - **"Divided Votes"**: lista as votações com ao menos um "não" (181 no período 2023–2027). Fica explícito que o restante passou por unanimidade ou ficou parado em comissão.
  - **Glossário de tipos na página Sobre**, por exemplo *Resolution*: "symbolic, non-binding document that urges action… or honors someone". Há também uma explicação de como a Câmara funciona (o que é pauta citywide, o que é pauta local).
  - **Página de proposição:** tags clicáveis que levam a buscas filtradas, tabela de histórico (data, órgão, ação), PDF, link "View on the Chicago City Clerk website" e RSS por proposição.
- **O que evitar:**
  - **"Compare Alders"** põe lado a lado "non-routine bills sponsored" e "attendance" sem definir as métricas, sem normalizar pelo tempo de mandato e sem metodologia. Na prática, é um ranking informal.
  - A página da proposição não traz explicação em linguagem simples, o histórico é uma tabela crua e os URLs de pessoas e eventos usam hash (`/person/{nome}-{hash}/`).
  - Inconsistências visíveis nos dados (uma data "Signed 12/27/2030") sem botão para reportar o erro.
- **Lição para Pindamonhangaba:** adotar a dupla **"rotineiro × substantivo"**, com critérios publicados, e uma página **"Votações divididas"**. Copiar a anatomia da proposição (tags que viram filtros, histórico, link oficial, feed). **Não** copiar o Compare sem método.

#### 2. GovTrack.us
- **O que é:** rastreador independente do Congresso dos EUA desde 2004 (Civic Impulse / Joshua Tauberer).
- **URL:** https://www.govtrack.us
- **Status 2026:** ativo (posts de 11/08/2026 e newsletter de 21/09/2026). Encerrou bulk data e API em 2017, com o argumento de que o Congresso já publicava dados estruturados: "the end of our bulk data and API is a recognition that it worked".
- **O que faz excepcionalmente bem (†):**
  - Status de tramitação em passos (apresentado → aprovado numa casa → aprovado na outra → sancionado), com *prognosis* ("X% de chance de ser aprovado").
  - Explicadores do processo legislativo e *trackers* por proposição.
  - **Votos perdidos em % com mediana de referência**: jornais e checadores citam a taxa do GovTrack comparada à mediana da casa. Checadores de 2026 também alertam para comparar **o mesmo período** (uma taxa de 1 ano contra uma de 6 anos é injusta).
  - URLs legíveis: `/congress/bills/119/hr1`, `/congress/members/{nome}/{id}`, `/congress/votes/119-2026/h123`.
- **O que evitar:** **escores derivados** (ideologia, liderança, *report cards*). Em julho de 2024, o GovTrack **retratou** os boletins de ano único (2013, 2015, 2017 e 2019) por "dados insuficientes num único ano", depois que o de 2019 foi usado politicamente ("a senadora mais liberal"). A *prognosis* também é um modelo preditivo opinável.
- **Lição:** contexto relativo é útil e neutro. Por exemplo: *"Esteve presente em 38 de 40 sessões ordinárias (95%). Mediana dos 11 vereadores no mesmo período: 97%."* Índice sintético não é. Previsão de aprovação também não: a amostra municipal é pequena e o risco de leitura política é alto.

#### 3. TheyWorkForYou + TheyWorkForYou Votes (mySociety)
- **O que é:** o site cidadão de referência sobre o Parlamento britânico (debates, votos, registro de interesses, alertas). O **TWFY Votes** (lançado em 19/05/2025) é a camada de dados de votação.
- **URL:** https://www.theyworkforyou.com · https://votes.theyworkforyou.com
- **Status 2026:** ativo. A home tem itens de 22/10/2026 e agenda até 2027. Os resumos de voto foram atualizados até abr/2026 (post de 01/07/2026).
- **O que faz excepcionalmente bem:**
  - **Frases factuais por voto**: "On 14 Jan 2026: Keir Starmer voted yes on Draft Public Order Act 2023 … Regulations 2025".
  - **Método público e revisado em público**:
    - desde 2024, ausência **não** conta como abstenção;
    - os votos se dividem em "scoring" (entram no resumo) e "informative" (aparecem, mas não pontuam);
    - a divergência em relação ao partido só é sinalizada acima de 60/40;
    - há meta de atualização "at least quarterly" e formulário para reportar votos mal classificados.
  - **TWFY Votes**:
    - classifica cada votação em 8 "dinâmicas parlamentares" (quem propôs, divisão da oposição, participação);
    - registra decisões tomadas sem votação nominal como **"Agreements"**;
    - permite anotações, inclusive declarações públicas do parlamentar sobre o próprio voto (teste em out/2025);
    - oferece API e download em massa.
  - Alertas por e-mail por termo e busca do parlamentar por CEP (†).
- **O que evitar:** URLs de debate com ID técnico (`/debates/?id=2026-10-22a.1288.0`, `/mp/?p=24827`). O perfil usa o padrão `/mp/25353/keir_starmer/holborn_and_st_pancras`, mais legível. A navegação tem 8 itens e um seletor de casa, o que funciona para Westminster mas seria excessivo para 11 vereadores.
- **Lição:**
  - (a) Registrar a **votação simbólica como "aprovado sem votação nominal"**, nunca como "11 votos sim".
  - (b) Diferenciar *ausente*, *presente sem votar*, *abstenção* e *não vota por regra regimental* (Presidente).
  - (c) Deixar o vereador anexar declaração sobre o próprio voto, com rótulo de que é declaração dele.
  - (d) Metodologia com versão e data.

#### 4. OpenParliament.ca
- **O que é:** projeto independente (com apoio da Open North) sobre a Câmara dos Comuns do Canadá.
- **URL:** https://openparliament.ca
- **Status 2026:** ativo (transcrição de 22/10/2026).
- **O que faz excepcionalmente bem:**
  - **URLs modelo**: `/politicians/elizabeth-may/`, `/bills/45-1/C-247/`, `/votes/45-1/180/`, `/debates/2026/10/22/…`.
  - **Página do projeto de lei**:
    - status em uma linha com data ("Second reading (House), as of Oct. 22, 2026");
    - **nota de contexto fixa por tipo** ("private member's bills… rarely become law");
    - resumo oficial rotulado "This is from the published bill";
    - resumo de debate **gerado por IA rotulado** (ícone de robô, aviso de possíveis erros e pergunta "Was this summary helpful and accurate?");
    - lista de **projetos com o mesmo número em sessões anteriores**, para desambiguar.
  - Busca do parlamentar por código postal logo na home e link para JSON de desenvolvedor em cada página.
- **O que evitar:** a lista de parlamentares não mostra o partido, que só aparece no *hover*. Isso falha no mobile e no teclado.
- **Lição:**
  - **Nota de contexto por tipo de proposição**, por exemplo: *"Indicações são sugestões ao Executivo e não obrigam a Prefeitura a agir."* (verificar a redação no Regimento).
  - Status em uma linha com data.
  - IA só com rótulo explícito e mecanismo de feedback.
  - Chave de URL `{tipo}/{ano}/{número}`, a mesma que o cidadão vê no documento oficial.

#### 5. HowTheyVote.eu
- **O que é:** votações nominais do Parlamento Europeu, em código aberto. Nasceu em 2021 e ocupou o espaço do VoteWatch Europe, encerrado em jun/2022 (dados arquivados no EUI).
- **URL:** https://howtheyvote.eu
- **Status 2026:** ativo. Votos de 20–22/10/2026 e apoio do MIZ Babelsberg em 2025–2026.
- **O que faz excepcionalmente bem:** a melhor página de votação do benchmark. Em ordem:
  1. resultado com contagens e %, incluindo quantos não votaram;
  2. lista dos eurodeputados com filtros por grupo, país e posição;
  3. resultado por grupo político e por país;
  4. links para o texto oficial e para o procedimento;
  5. **"Open data" CSV/JSON da votação**;
  6. *embeds* via Datawrapper;
  7. **"Sources"**: três fontes oficiais, **cada uma com data e hora de acesso**;
  8. link "reportar erro".

  O FAQ explica que "Did not vote" geralmente significa ausência e declara o que **não** cobre (votos secretos, por levantamento de mão, emendas).
- **O que evitar:** URL numérica (`/votes/198292`) e títulos técnicos na lista, sem resumo em linguagem simples.
- **Lição:** copiar literalmente o bloco **"Fonte · acessado em dd/mm/aaaa hh:mm · Baixar dados · Reportar erro"** e a seção de **limites de cobertura**, por exemplo: *"Votações simbólicas não têm registro individual de voto."*

#### 6. abgeordnetenwatch.de
- **O que é:** plataforma alemã de perguntas públicas a parlamentares, votações nominais, atividades remuneradas paralelas e lobby.
- **URL:** https://www.abgeordnetenwatch.de
- **Status 2026:** ativo (perguntas de 19–21/10/2026, votos de 08–16/10/2026).
- **O que faz excepcionalmente bem:**
  - URLs humanas e consistentes: `/profile/friedrich-merz`, `/profile/friedrich-merz/abstimmungen`, `/bundestag/21/abstimmungen/{slug-do-tema}`. O filtro de legislatura vai em parâmetro (`?parliament_period=161`).
  - Perfil com abas claras: Visão geral, Perguntas e respostas, Atividades paralelas, Votações, Comissões.
  - Registros com **"Erfasst am" (registrado em) e "Letzte Änderung" (última alteração)**.
  - Dados abertos por político e código de moderação publicado.
- **O que evitar:**
  - A lista de votações mostra **dois números sem rótulo** e **fotos de banco de imagem decorativas**.
  - O perfil do chanceler exibe "0 / 463 perguntas respondidas" e votos "Nicht beteiligt". É verdade, mas engana sem uma nota de que o chefe de governo raramente participa.
- **Lição:** toda métrica de perfil precisa de **nota de papel institucional** (Presidente da Mesa, licença, suplência, mudança de partido) e de rótulos sempre visíveis. Perguntas públicas a vereadores podem entrar numa fase 2, porque exigem moderação e equipe.

#### 7. NosDéputés.fr (Regards Citoyens) — contraexemplo instrutivo
- **O que é:** pioneiro na medição da atividade parlamentar (presença, intervenções, emendas, propostas), com gráfico semanal por deputado.
- **URL:** https://www.nosdeputes.fr · https://www.regardscitoyens.org
- **Status 2026:** incerto. O site estava fora do ar (503 / conexão resetada) em 24/10/2026. Uma página do próprio site diz que ele apresenta a legislatura anterior e que a versão para os eleitos de 2024 viria "em alguns meses". O Civic Tech Field Guide lista a Regards Citoyens como ativa (mar/2026).
- **O que fez bem:** visualização semanal de presença e atividade, além de dados abertos. Isso pressionou a Assembleia a publicar mais.
- **O que evitar:** **classificação por métricas de atividade.** Pesquisadores (Abel François e Olivier Rozenberg, citados pela Public Sénat) apontam incentivo a apresentar muitas emendas e fazer intervenções curtas para subir nas métricas. Um ministro chamou os efeitos de "pernicieux", e deputados processaram o site.
- **Lição:** se o produto destacar "nº de indicações/requerimentos", o sistema passa a premiar o volume. Indicações já costumam ser o tipo mais numeroso: em Foz do Iguaçu, em 2022, foram 2.465 indicações contra 216 projetos de lei. Por isso: **mostrar por natureza, não ordenar por volume, declarar que quantidade não mede qualidade**.

#### 8. Open States / Plural
- **O que é:** dados padronizados dos 50 legislativos estaduais dos EUA, com *scrapers* abertos, API v3 e bulk.
- **URL:** https://open.pluralpolicy.com (openstates.org redireciona para https://pluralpolicy.com/open)
- **Status 2026:** dados e API ativos. O site legado avisa "Open States is now Plural / SAI360!" e diz que a maioria das ferramentas foi desativada, restando busca de projetos e "find your legislator". A Plural foi adquirida pela SAI360 (anúncio de 01/12/2025).
- **O que faz excepcionalmente bem:** o **esquema Open Civic Data** (Person, Organization, Membership, Bill, Action, VoteEvent, Event), que o Councilmatic também usa.
- **O que evitar:** dependência de um mantenedor comercial. O produto público encolheu depois da aquisição.
- **Lição:** modelar os dados de Pindamonhangaba num esquema próximo de OCD/Popolo. Isso permite que outros observatórios da rede (mais de 150) reutilizem o código, facilita exportar e reduz o custo de manutenção.

#### 9. CalMatters Digital Democracy
- **O que é:** banco de dados jornalístico do Legislativo da Califórnia, com transcrições de audiências, doações, projetos e votos.
- **URL:** https://calmatters.digitaldemocracy.org
- **Status 2026:** ativo ("California Agenda 2026", © 2026). Emmy em 2025 e, segundo o Civic Tech Field Guide, doação de US$ 9 milhões em abr/2026.
- **O que faz excepcionalmente bem:** "Legislature at a Glance" (composição por partido, gênero, idade e outros recortes), temas (Issues) como porta de entrada, URLs `/legislators/{nome}-{id}` e integração entre reportagem e dados.
- **O que evitar:** listas **"Top 10 and Bottom 10"** (votos perdidos, "most talkative", presentes recebidos). É legítimo para uma redação, mas incompatível com a neutralidade do OSB.
- **Lição:** uma página factual "A Câmara em resumo" (composição, partidos, mandatos, gênero) funciona bem. Top e Bottom, não.

#### 10. Câmara dos Deputados — Dados Abertos e perfil do deputado
- **URL:** https://dadosabertos.camara.leg.br · perfil, por exemplo, https://www.camara.leg.br/deputados/204554
- **Status 2026:** ativo.
- **O que faz excepcionalmente bem:**
  - Perfil por **ano com seletor**, e cada bloco tem **ícone "?" de ajuda** e link para o detalhamento.
  - Presença separando **ausências justificadas e não justificadas**.
  - Cota com % gasta e não utilizada, mais um quadro mensal.
  - **"Comunicar erro"** no rodapé.
  - Na API, a coleção **"Referências"** (tipos de proposição, situações de tramitação) e documentação Swagger.
- **O que evitar:** contagens de proposições, votações e discursos **sem link**, isto é, números que não podem ser explorados. A estética é de portal, com muitos cartões densos.
- **Lição:** montar um **vocabulário controlado** (tipos, situações e eventos de tramitação) como base única de filtros, glossário e linha do tempo. Adotar o "?" contextual e a distinção "justificada / não justificada", se a Câmara de Pindamonhangaba registrar isso.

#### 11. Querido Diário (Open Knowledge Brasil)
- **O que é:** busca e API sobre diários oficiais municipais.
- **URL:** https://queridodiario.ok.org.br (redireciona para queridodiario.org.br) · documentação: https://docs.queridodiario.ok.org.br
- **Status 2026:** ativo. API v0.22.7 de 10/07/2026, atividade no GitHub em out/2026 e mais de 500 cidades segundo campanha recente. **A cobertura de Pindamonhangaba não foi verificada.**
- **O que faz excepcionalmente bem:** infraestrutura aberta mantida por uma instituição com comunidade de voluntários, API pública e atraso de indexação documentado (cerca de 6 dias, segundo integradores).
- **Lição:** usar como **proveniência complementar**. Leis sancionadas, vetos e promulgações saem no diário do Executivo, então o produto pode mostrar *"Publicada no Jornal Oficial em dd/mm"* com link. É também prova de que um projeto cívico brasileiro sobrevive quando é infraestrutura reutilizável, e não um site isolado.

#### 12. Rede Observatório Social do Brasil — os pares diretos
- **OSB São Paulo** (https://www.osb-saopaulo.org.br/monitoramento-do-legislativo-2021-2024/):
  - monitora os 55 vereadores com voluntários e usa a metodologia Insper de Humberto Dantas e Luciana Yeung;
  - classifica proposições em dois eixos: **temático** (saúde, educação, urbanismo, honrarias…) e **funcional** (transparência, propositura, cooperação com o Executivo, fiscalização);
  - publica painéis em **Power BI incorporado** ("Painel Conheça seu vereador", gastos de gabinete, emendas 2025) e relatórios anuais apresentados em plenário;
  - integra a plataforma nacional **MonitLegis** (GT da rede, com dados do SAPL).
- **OS Foz do Iguaçu** (dez/2023): plataforma em BI com projetos, indicações, requerimentos, moções e assiduidade. O presidente declarou: *"A plataforma não é ranking nem apresenta juízo de valor, análise que cabe ao iguaçuense."*
- **OS Campos Gerais (Ponta Grossa)**: projeto também chamado **"Acompanhe seu Vereador"** (2022, atualização mensal). Em 24/10/2026, o subdomínio `pontagrossa-camposgerais.osbrasil.org.br` **não resolve DNS**.
- **Lição:**
  - (a) Alinhar a taxonomia ao **eixo temático × funcional da rede**, para comparar entre cidades sem ranquear.
  - (b) O ganho sobre o Power BI precisa ser concreto: URLs compartilháveis, acessibilidade (o *embed* do Power BI é fraco com leitor de tela e no mobile), proveniência por registro, indexação por buscadores e download.
  - (c) Publicar o código para que outros observatórios repliquem.

#### 13. Ranking dos Políticos — contraexemplo (e uma correção sobre o Legisla Brasil)
- **Ranking dos Políticos** (https://www.ranking.org.br):
  - ativo, com "Última atualização: 27/07/2026";
  - parlamentares recebem pontos positivos ou negativos definidos por um conselho, com pilares "anticorrupção, antiprivilégios, antidesperdício" e votações com peso 3;
  - a imprensa transforma isso em manchetes como "X é o pior político, segundo ranking";
  - críticos apontam viés econômico liberal nos critérios (por exemplo, votos a favor da reforma trabalhista no topo).

  Mesmo com critérios publicados, **atribuir peso positivo ou negativo a votos é juízo de valor**.
- **Legisla Brasil** (https://legislabrasil.org) **não** é ranking. É uma organização suprapartidária que capacita gabinetes e equipes (site atualizado em ago/2026), e não serve como contraexemplo.
- **Lição:** proibir no produto nota, peso, selo, cor de semáforo (verde = bom), "top", "campeão" e ordenação padrão por volume ou desempenho.

#### 14. Transparência Brasil · Fiquem Sabendo · Política por Inteiro — lições pontuais
- **Transparência Brasil** (https://www.transparencia.org.br): ativa (publicação sobre emendas Pix de 01/10/2026). Faz **manchete-dado com base explícita** ("Menos de 1% das emendas Pix… identificam o destino"). O Excelências e o Achados e Pedidos estão encerrados (ver 2.2.15).
- **Fiquem Sabendo** (https://fiquemsabendo.com.br): ativa (17/08/2026; nova interface da WikiLAI em mai/2026). Lição: quando a Câmara não publica um dado, **o pedido LAI vira fonte citável**, no formato *"Fonte: resposta ao pedido LAI nº …, recebida em …"*, com o documento anexado.
- **Política por Inteiro** (https://politicaporinteiro.org/metodologia/): ativa (23/10/2026). A taxonomia de "sinal público" tem 10 classes e **14 temas, com um tema por ato em ordem hierárquica**, e o documento afirma: *"Não há juízo de valor do impacto da norma."* É o modelo mais direto para classificar proposições por tema sem opinar.

#### 15. O cemitério cívico — lição de sustentabilidade

| Projeto | O que era | Situação observada em 24/10/2026 |
|---|---|---|
| Radar Parlamentar (PoliGNU/USP) | Similaridade entre partidos a partir de votações, incluindo a Câmara de SP | O domínio `radarparlamentar.polignu.org` hoje serve "Speaklar Account Access" |
| Excelências (Transparência Brasil) | Pioneiro em perfis de parlamentares | O domínio `excelencias.org.br` virou blog de conteúdo genérico |
| Achados e Pedidos (TB + Abraji) | Base de pedidos LAI | "Desativada em 31 de janeiro de 2026", com aviso "Missão cumprida"; relatórios mantidos |
| Jarbas / Serenata de Amor | Despesas da cota parlamentar e robô Rosie | `jarbas.serenata.ai` retorna HTTP 521 |
| Basômetro (Estadão Dados) | Governismo por votação desde 2003 | Online, mas a série termina no governo 2019–2022 |
| Monitor da Bancada (O Povo) | Votos e despesas de deputados cearenses | "Atualizado… Ago 31.2023" |
| OS Campos Gerais — "Acompanhe seu Vereador" | Painel municipal | Subdomínio sem DNS |
| ProPublica Represent | Rastreador do Congresso | Snapshot arquivado de jul/2024, API encerrada |
| VoteWatch Europe | Votos do Parlamento Europeu | Encerrado em jun/2022; dataset preservado no EUI |
| Media Election 2020 (AREA 17) | Menção honrosa no Awwwards | Fora do ar |

**O que fazer com isso:**
- Domínio próprio no CNPJ do OSB, renovado por muitos anos e com mais de um responsável.
- Arquitetura estática ou quase estática, de custo baixo.
- Dados versionados e depositados (Zenodo, Base dos Dados, Internet Archive).
- Plano de "modo arquivo": quando não houver mais equipe, congelar com aviso datado, como fez o Achados e Pedidos, em vez de deixar o site apodrecer.
- Pipeline documentado para que outro observatório assuma.

### 2.3 Jornalismo de dados — o que extrair de cada um

| Referência | Status | O que extrair | O que não copiar |
|---|---|---|---|
| **Our World in Data** (https://ourworldindata.org) | Ativo (página com "próxima atualização" em 24/11/2026) | **Ficha técnica por gráfico**: descrição, fonte, unidade, cobertura temporal, *Last updated*, ***Next expected update***, notas de processamento, citação sugerida (longa e curta), licença, download CSV/API. Abas Gráfico / Mapa / Tabela. | Volume de metadados à mostra o tempo todo; usar *disclosure* |
| **The Pudding** (https://pudding.cool) | Ativo (#226, out/2026) | Tom humano e explicativo; ensaios visuais pontuais para **explicadores** ("Como uma indicação vira obra?", "O caminho de um projeto de lei") | Layout experimental e *scrollytelling* no produto principal: custo alto, frágil no mobile |
| **Nexo Gráfico** (https://www.nexojornal.com.br/grafico) | Ativo (peças de 16–23/10/2026 sobre as eleições de 2026) | **Título que afirma o achado factual** ("Maioria dos deputados que votaram contra o fim da 6 por 1 foi eleita"), um gráfico por ideia, fonte no rodapé | Títulos com inferência causal; nos nossos, só constatação |
| **Folha / Estadão / g1** | Interativos pontuais; Basômetro sem atualização pós-2022 | Placar "como votou cada um" (foto, nome, voto); Basômetro como modelo visual de dispersão | O padrão da imprensa é o interativo por evento, que decai sem pipeline. Índice de "governismo" é métrica interpretativa e não deve entrar na v1 |
| **FT Visual Vocabulary** (https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) | Disponível no GitHub | Escolher o gráfico pela relação: magnitude (barras, eixo começando em zero), mudança no tempo, parte-todo, distribuição. Para nós: barras horizontais com rótulo direto, colunas mensais, barra 100% empilhada | A categoria *Ranking* como enquadramento editorial |
| **USAFacts** (https://usafacts.org) | Ativo (referência a mai/2026) | Princípios editoriais: *"No one at USAFacts is trying to convince you of anything"*; só dados governamentais; *"A stat without context is no better than an opinion"*. Modelo para a página "Princípios editoriais" | — |
| **Data USA** (https://datausa.io) | Ativo (dados de 2024) | Perfis com **frases geradas por modelo** a partir dos dados; por gráfico, "View data", "Save image", "Share/Embed"; navegação numerada por seções | Excesso de gráficos por página |

### 2.4 Design systems governamentais — o que extrair

| Sistema | Versão e status | Extrair | Não extrair |
|---|---|---|---|
| **GOV.UK Design System** (https://design-system.service.gov.uk) | `govuk-frontend` **6.6.0** (15/10/2026); a v6 (fev/2026) revisou a escala tipográfica para telas pequenas | **Summary list** (ficha da proposição: tipo, número, autoria, situação, datas); **Details** (glossário inline, com a regra "não esconda o que a maioria precisa"); **Inset text** (nota de contexto por tipo); **Tag** (situação); **Table** (números à direita, `<caption>`, `scope`; com muitos dados, dividir em tabelas menores); **Notification banner** (dados desatualizados ou coleta com falha); **Phase banner** ("Beta"); **Pagination**; **Feedback** (componente *trial* de 2026); a disciplina de linguagem simples | A identidade visual (é marca do governo britânico) |
| **USWDS** (https://designsystem.digital.gov) | `@uswds/uswds` **3.14.0** (18/08/2026) | **Collection** (lista de itens com metadados, ideal para o feed de proposições); **Process list / Step indicator** (tramitação); **Summary box** ("Em resumo" no perfil); **Identifier** (quem mantém o site; para nós, *"Mantido pelo OSB Pindamonhangaba. Este não é o site oficial da Câmara."*); **In-page navigation** (perfil longo); fonte **Public Sans** | Tooltip ao passar o mouse como única forma de acessar informação |
| **Padrão Digital de Governo / DSGov** (https://www.gov.br/ds) | `@govbr-ds/core` **3.7.0** estável; **4.0** em pré-lançamento (4.0.0-next.11, 06/05/2026); obrigatório só para o governo federal (Portaria 540/2020) | Familiaridade de padrões que o brasileiro já conhece: breadcrumb, mensagens, *tags*, comportamento de formulários | **O visual gov.br**: o produto é de uma ONG apartidária e não deve parecer site oficial (risco de confusão institucional, e é a estética de "portal burocrático" a evitar). A tipografia do DSGov é Rawline com *fallback* Raleway, e a **Raleway tem algarismos de estilo antigo e proporcionais por padrão** (verificado), ruins para tabelas |
| **MoJ Design System — Filter** (https://design-patterns.service.justice.gov.uk/components/filter/) | Status "To be reviewed" | Filtros selecionados como **tags removíveis** (texto oculto "Remove this filter"), "Limpar filtros", botão "Aplicar", autocomplete para listas longas. Achado de pesquisa: **usuários não percebem que podem filtrar e tentam filtrar clicando no cabeçalho da tabela** | — |

---

## 3. Parte B — Referências de design e UI

### 3.1 Awwwards e Behance — veredito franco

- **Awwwards** premia novidade visual e *motion*, o oposto do que um produto cívico mobile e acessível precisa. O único caso pertinente é o **Data USA** (Menção Honrosa em 23/04/2016, https://www.awwwards.com/sites/data-usa; ainda no ar), pelos perfis gerados a partir de dados. O **Media Election 2020** (AREA 17, Menção Honrosa em 01/10/2020, https://www.awwwards.com/sites/media-election-2020) é editorial de dados, mas **está fora do ar**: mais um projeto premiado e efêmero. Não encontrei projeto legislativo premiado que valha como referência. A coleção https://www.awwwards.com/websites/data-visualization/ serve no máximo para inspiração de detalhes.
- **Behance**: buscas por "câmara municipal", "vereadores" e "vereador" (https://www.behance.net/search/projects?search=C%C3%A2mara+dos+Vereadores) retornam quase só **identidade visual, campanhas e posts de redes sociais**. Não encontrei nenhum caso de interface de dados legislativos que eu recomende. **Recomendo não usar o Behance como referência** para este produto.
- **Referências de UI que valem mais do que as duas plataformas:**
  - o texto da ProPublica sobre o redesenho do Represent (2018, https://www.propublica.org/nerds/represent-design-renovation): as páginas de projeto tinham pouco uso, então viraram seções em cartões, com só os eventos principais da tramitação visíveis por padrão; o perfil passou a ter um **feed de atividade** como eixo; foram criadas tabelas ordenáveis e páginas por bancada;
  - o **Chartability** (https://chartability.github.io/POUR-CAF/);
  - a **Datawrapper Academy** (acessibilidade de gráficos);
  - o **GOV.UK** (padrões);
  - **Adrian Roselli** sobre tabelas acessíveis.

### 3.2 Doze princípios concretos de UI/UX e dataviz

**P1 — Hierarquia editorial em três níveis: resumo → lista → registro.**
- Toda área segue *Frase-resumo factual* → *lista filtrável* → *página do registro*.
- Na home e no perfil, no máximo 3–5 números por bloco, cada um com rótulo, período e link.
- **Não há página de gráfico sem saída**: todo gráfico leva à lista dos itens que o compõem (o recorte por barra é um filtro).

**P2 — Frases geradas por modelo, com vocabulário controlado (estilo Data USA / TWFY).**
- Exemplo: *"Entre 01/01/2025 e 23/10/2026, Fulana foi autora ou coautora de **241 requerimentos**: **180** pedem informações à Prefeitura, **41** são votos de pesar ou congratulação, **20** têm outras finalidades."* Cada número é um link.
- **Verbos permitidos:** apresentou, protocolou, foi autor(a), votou sim/não, esteve presente, registrou ausência, relatou, presidiu.
- **Palavras proibidas:** produtivo, produtividade, desempenho, eficiente, assíduo/faltoso, omisso, "trabalhou mais", melhor/pior, ranking, top, campeão, "líder em", destaque.
- Revisar os modelos de frase como se revisa código.

**P3 — Contexto obrigatório: denominador, período, papel e natureza.**
- Nunca "38 presenças" sozinho, e sim *"38 de 40 sessões ordinárias (95%) · 01/01–23/10/2026"*.
- Quando aplicável, a **mediana dos 11 no mesmo período**, em cinza, sem destacar quem está acima ou abaixo.
- Notas automáticas de papel:
  - *"Presidente da Câmara: vota apenas nos casos previstos no Regimento Interno"* (confirmar o artigo);
  - *"Em licença de dd/mm a dd/mm; o suplente X exerceu o mandato"*;
  - *"Mudou do partido A para o B em dd/mm"*.
- Toda contagem de proposições aparece **desdobrada por natureza** (rotineira/honorífica × substantiva, ou o eixo funcional do OSB).

**P4 — Ordem neutra por padrão.**
- Listas de vereadores em **ordem alfabética do nome parlamentar**. A ordenação por coluna é escolha do usuário e fica indicada ("ordenado por: nome").
- Sem cores de partido: 11 vereadores de poucos partidos com cores parecidas confundem e partidarizam. Partido em texto (sigla) com histórico.
- Sem verde/vermelho valorativo.

**P5 — Tabelas no mobile: cartão para registros, tabela de verdade para comparações.**
- **Listas de registros** (proposições, sessões, votos de um vereador) são **lista de cartões** em HTML semântico (`<ol>` de `<article>`), com tipo + número em destaque, título, autoria, situação (tag) e data. É o padrão "Collection" do USWDS.
- **Comparações** (11 vereadores × 3–4 métricas, presenças por sessão) usam `<table>` real, com `<caption>`, `scope`, números **alinhados à direita** com algarismos tabulares, **primeira coluna fixa** (`position: sticky`), no máximo 3 colunas visíveis a 360 px e o restante com rolagem horizontal **dentro** de uma região rotulada e focável (`role="region"`, `aria-labelledby`, `tabindex="0"`). O critério de Reflow da WCAG (1.4.10) aceita rolagem bidimensional para tabelas.
- **Não** transformar `<table>` em `display:block` sem restaurar a semântica (Roselli). Preferir oferecer "Ver como lista".
- Sempre "Baixar CSV" junto da tabela.

**P6 — Filtros no mobile: botão "Filtrar (n)", painel de tela cheia, estado na URL.**
- No mobile, a barra superior da lista tem **busca**, **"Filtrar (2)"** e **"Ordenar"**. O botão de filtro abre um painel de tela cheia (diálogo modal acessível, foco preso e devolvido) com facetas: tipo, autoria, situação, ano/período, tema, natureza.
- **Cada opção mostra quantos itens tem** ("Requerimento (1.204)").
- O rodapé fixo do painel mostra **"Mostrar 241 resultados"**: o botão já diz o resultado.
- Fora do painel, os filtros ativos aparecem como **tags removíveis** (padrão MoJ), mais "Limpar tudo".
- No desktop, a coluna lateral fica sempre visível e a lista atualiza **sem recarregar**, anunciando a nova contagem numa região `aria-live="polite"`.
- O estado vai **sempre** para a URL, para compartilhar e voltar.
- Como as pessoas tentam filtrar clicando no cabeçalho, o cabeçalho deve, sim, ordenar, e isso precisa ser visível.

**P7 — Linha do tempo de tramitação: status no topo, passos simplificados, histórico completo sob demanda.**
- No topo da proposição: **status em uma linha com data** ("Aprovado em 2ª discussão · 20/10/2026") como Tag + texto.
- Abaixo, um **indicador de etapas por tipo** (estilo Congress.gov / USWDS Step indicator).
  - Projeto de lei: *Protocolado → Lido em sessão → Comissões → Em pauta → Votado → Sancionado / Promulgado / Vetado*.
  - Indicação: *Protocolada → Lida → Encaminhada ao Executivo → Resposta recebida?*
  - Etapas que não se aplicam não aparecem. Os nomes vêm do vocabulário controlado da Câmara.
- Depois, a **lista vertical de eventos** (data à esquerda, órgão e ação à direita), mostrando por padrão só os eventos principais e o restante em "Mostrar 7 movimentações internas" (lição do Represent).
- Cada evento tem link para o documento (parecer, ata, autógrafo).
- Nada de linha do tempo horizontal no mobile.

**P8 — Perfil do vereador: identidade, resumo factual, atividade recente, abas por tipo de dado.**
- **Cabeçalho:** foto (com crédito), **nome parlamentar** e nome civil, partido atual (com histórico), mandatos, cargos (Mesa, comissões) e contato oficial.
- **"Em resumo"** (Summary box): 3–4 frases do P2 sobre a legislatura atual, com o seletor de período visível.
- **"Atividade recente"**: feed cronológico de proposições, votos nominais e presenças (lição do Represent).
- **Abas com URL própria:** Proposições · Votos · Presenças · Despesas (só se houver dado atribuível ao vereador) · Sobre os dados.
- **Sem nota, sem medalha, sem "posição entre os 11".**
- Espaço rotulado para a manifestação do vereador sobre dados e votos (modelo TWFY Votes), com data e indicação de que é declaração dele.

**P9 — Jargão explicado onde aparece, em três camadas.**
- (1) **Nota de contexto fixa por tipo** (Inset text), por exemplo: *"Moção é uma manifestação da Câmara, como aplauso, pesar ou repúdio. Não cria obrigação legal."*
- (2) **Termos sublinhados com pontilhado** que abrem um ***toggletip*** (botão que mostra a definição curta ao clicar ou tocar, acessível por teclado e leitor de tela) com o link "Ver no glossário". Nada de *tooltip* só por *hover*, que não existe no toque.
- (3) **Glossário com URL por termo** (`/glossario/indicacao`), com definição curta, explicação longa e base legal (artigo do Regimento ou da Lei Orgânica).
- O mesmo dicionário alimenta filtros, tags e notas, para que haja uma só definição de cada termo.
- Linguagem simples, nível de leitura de ensino fundamental II.

**P10 — Proveniência sem poluir: rodapé de dados padronizado e "Sobre estes dados" recolhível.**
- Todo bloco de dado ou página-registro termina com uma linha discreta (corpo 14 px, cor secundária): **"Fonte: Câmara Municipal de Pindamonhangaba — [registro oficial] · coletado em 23/10/2026 06:10 · [Baixar CSV] · [Reportar erro]"**.
- Um `<details>` "Sobre estes dados" traz o que conta, o que não conta, a regra de cálculo, o link para a Metodologia e a "próxima atualização prevista" (modelo OWID).
- Página **/correcoes** pública, com histórico datado de erros corrigidos.
- Um **banner** aparece **só quando** a coleta falhou ou os dados estão atrasados ("Última coleta bem-sucedida: …").

**P11 — Gráficos acessíveis e poucos tipos.**
- **Cinco formas no máximo:** barras horizontais com rótulo direto; colunas mensais; barra 100% empilhada para natureza; **unit chart de 11 pessoas** para votações; pontos ou faixas para presença por sessão.
- Pizza, donut, radar, 3D e "medidor" (*gauge*) estão vetados.
- **O título afirma o fato** ("A maioria das proposições de 2026 é de indicações"), e o subtítulo dá base e período.
- Cada gráfico tem **"Ver como tabela"** (Chartability: *No table* é falha crítica), **texto alternativo** gerado a partir do mesmo modelo de frase, **contraste ≥ 3:1** para marcas (WCAG 1.4.11) e ≥ 4,5:1 para texto, e **cor nunca sozinha**: a forma também codifica (● sim, ✕ não, ◌ ausente, — não vota por regra).
- Interação por teclado, alvos de ≥ 24×24 px (WCAG 2.5.8) e `prefers-reduced-motion` respeitado.
- Gráficos em SVG leve ou HTML/CSS, sem bibliotecas pesadas.

**P12 — Votação nominal com 11 pessoas: mostrar cada um, destacar as divididas.**
- Página de votação:
  - resultado em texto ("Aprovado · 7 sim, 3 não, 1 ausente");
  - **fila de 11 marcadores com nome** agrupados por voto;
  - quórum exigido e regra (maioria simples, absoluta, 2/3), com link para o glossário;
  - o objeto votado (proposição e etapa);
  - o rodapé de fonte.
- Na lista de votações, o filtro **"Só votações divididas"**, que é também um bloco na home.
- Votação simbólica aparece como **"Aprovado em votação simbólica (sem registro individual de voto)"**.

### 3.3 Pares tipográficos (Google Fonts, open source)

Verifiquei nos arquivos originais do `google/fonts`: todas as fontes abaixo têm os glifos do português (ã õ ç é ê á â í ó ô ú Ã Ç Õ).

| Fonte | Algarismos padrão | `tnum` | Outros recursos |
|---|---|---|---|
| Source Serif 4 | **tabulares** | sim | `lnum`/`onum`, `smcp`, `case`, eixo `opsz` |
| Source Sans 3 | **tabulares** | (padrão; `pnum` disponível) | `onum`, `smcp`, `zero`, `case` |
| Newsreader | **tabulares** | sim | `pnum`, `case`, eixo `opsz` |
| Public Sans | proporcionais | **sim** | `lnum`/`onum`, `frac` |
| Literata | proporcionais | **sim** | `lnum`/`onum`, `smcp`, `zero`, eixo `opsz` |
| IBM Plex Sans | **tabulares** | (padrão) | `onum`, `zero` (zero com barra), largura variável |
| Atkinson Hyperlegible Next | proporcionais | **sim** | `case`, `frac` |
| Inter | proporcionais | sim | `zero`, `cv01`, `ss01/02` |
| *Raleway (fallback do DSGov)* | *estilo antigo e proporcionais* | **não** | evitar em dados |
| *Fraunces* | — | **não** | evitar (excêntrica, sem `tnum`) |

**Par 1 — Source Serif 4 (títulos e textos editoriais) + Source Sans 3 (interface, tabelas, rótulos).** *Recomendado.*
Superfamília da Adobe com proporções compatíveis por desenho. As duas têm **algarismos tabulares por padrão**, o que alinha tabelas e contagens sem CSS extra. O versalete (`smcp`) serve para siglas (PL, REQ, PDL) sem gritar. O eixo óptico da Serif 4 dá títulos elegantes e corpo robusto em telas pequenas. O tom é editorial e sóbrio, sem cara de startup. Os acentos são bem desenhados, inclusive o til em caixa-alta.

**Par 2 — Newsreader (editorial) + Public Sans (interface).**
A Newsreader (Production Type, encomendada pelo Google) foi feita para leitura de notícias em tela e tem eixo óptico de 6 a 72, o que dá títulos com personalidade de jornal. A Public Sans é a fonte do USWDS, o que dá linhagem cívica, neutralidade e boa legibilidade. **Atenção:** os algarismos da Public Sans são proporcionais por padrão, então tabelas e números precisam de `font-variant-numeric: tabular-nums`.

**Par 3 — Literata (editorial) + IBM Plex Sans (dados e interface), opcionalmente com IBM Plex Mono para números de protocolo.**
A Literata (TypeTogether, criada para leitura longa no Google Play Livros) acolhe bem textos explicativos e o glossário. A Plex Sans tem **algarismos tabulares por padrão**, zero com barra (`zero`) e largura variável (útil em tabelas estreitas no mobile). O conjunto soa mais "técnico e de dados". Alternativa com foco em acessibilidade para a interface: **Atkinson Hyperlegible Next** (Braille Institute; distingue 0/O e 1/l/I; tem `tnum`).

**Regras de uso:**
- No máximo 2 famílias e 4 estilos carregados.
- WOFF2 hospedado localmente, com *subset* `latin` + `latin-ext`.
- `font-display: swap` e *fallback* métrico (`size-adjust`) para evitar salto de layout.
- `font-variant-numeric: tabular-nums lining-nums` em tabelas, contagens e datas.
- Corpo de texto com 17–18 px no mobile, entrelinha 1,5, medida de 60–72 caracteres.
- Títulos com entrelinha ≥ 1,15, para que til e acento agudo em caixa-alta (Ã, Õ, É) não colidam.
- Não usar a Raleway em dados.

---

## 4. Parte C — Arquitetura de informação

### 4.1 O que os melhores fazem na navegação

| Produto | Navegação principal | Padrão |
|---|---|---|
| Chicago Councilmatic | About · Notes · Find Your Ward · Compare Alders · Divided Votes · Committees · Meetings · Legislation | Entidades + 2 recortes editoriais |
| OpenParliament.ca | MPs · Bills · Debates · Committees · About · Labs | **4 entidades** + Sobre |
| TheyWorkForYou | MPs · Lords · Debates · Register of Interests · Written Answers · Bill Committees · Recent Votes · Upcoming | Entidades de uma casa complexa |
| HowTheyVote.eu | All Votes · About & FAQ | 1 entidade, com a busca como protagonista |
| abgeordnetenwatch | Busca de políticos · Investigações · Petições · parlamentos | Pessoas no centro |
| CalMatters DD | Issues · Directories · Data & Methodology | Temas + diretórios + método |

**Padrão dominante:** de 3 a 5 **entidades** no menu (pessoas, proposições, reuniões/votações, órgãos), mais Sobre e Método. **Ferramentas** (comparar, alertas, dados abertos) e **recortes** (temas, votações divididas) ficam *dentro* das entidades ou na home, e não no menu principal.

### 4.2 Avaliação dos itens candidatos

| Item | Veredito | Onde fica | Justificativa |
|---|---|---|---|
| **Início** | Sim, como logo e link (não como item de menu) | `/` | Convenção |
| **Vereadores** | **Menu principal** | `/vereadores` | É a entidade-âncora e a razão do nome do produto |
| **Proposições** | **Menu principal** | `/proposicoes` | É onde está o volume e onde ficam as "contagens exploráveis" |
| **Sessões** | **Menu principal** | `/sessoes` | Unidade de evento: pauta, presenças e votações. A presença só existe por sessão |
| **Votações** | **Condicional**: dentro de Sessões na v1 (com URL própria `/votacoes`) | `/votacoes` | Numa câmara de 11, com muita votação simbólica, o volume de votações nominais deve ser pequeno. Promover ao menu se houver ≥ ~10 votações nominais por mês. Decidir com o inventário de dados |
| **Câmara** | **Menu principal** ("A Câmara") | `/camara` | Hub de "como funciona": Mesa, comissões, composição, regras de votação, glossário. Responde ao déficit de alfabetização legislativa |
| **Temas** | **Não** no menu da v1; aparece como filtro, *chips* na home e páginas `/temas/{slug}` | `/temas/…` | Depende de classificação confiável e documentada (modelo Política por Inteiro: um tema por item, hierarquia, sem juízo). Promover quando a cobertura e a revisão estiverem validadas. Se houver classificação por IA, rotular (modelo OpenParliament) |
| **Comparar** | **Não** como item de menu. Vira a visão **"Lado a lado"** dentro de Vereadores | `/vereadores/lado-a-lado` | Comparação é onde nasce o ranking informal (vide Councilmatic). Só com mesmo período, mesmo papel, ordem alfabética padrão, denominadores e link de método por coluna, e suplentes à parte |
| **Explorar dados** | **Não** como explorador estilo BI. As próprias listas filtráveis *são* o explorador; downloads e API ficam em "Dados abertos" | `/dados` | Recriar um painel BI seria recriar o problema do Power BI |
| **Metodologia** | **Rodapé + links contextuais** em cada "Sobre estes dados" + item utilitário no cabeçalho ("Sobre os dados") | `/metodologia/{tópico}` | Essencial para a neutralidade, mas a maioria chega por contexto e não pelo menu |
| **Sobre** | Rodapé | `/sobre` | Quem mantém, princípios editoriais (modelo USAFacts), "não é site oficial", contato e financiamento |

### 4.3 Mapa do site proposto

```
/                                   Início
├── /vereadores                     Vereadores (11 atuais; legislaturas anteriores por filtro)
│   ├── /vereadores/{slug}          Perfil (ex.: /vereadores/maria-silva)
│   │   ├── /proposicoes            = lista filtrada por autoria
│   │   ├── /votos
│   │   ├── /presencas
│   │   └── /despesas               (só se houver dado atribuível ao vereador)
│   └── /vereadores/lado-a-lado     Visão tabular neutra (ordem alfabética)
├── /proposicoes                    Lista + busca + filtros (tipo, autoria, situação, período, tema, natureza)
│   ├── /proposicoes/{tipo}/{ano}/{numero}            ex.: /proposicoes/projeto-de-lei/2026/45
│   │   └── /emendas/{n}                              emendas presas ao projeto-pai
│   └── /temas/{slug}               Página de tema = filtro salvo + texto explicativo
├── /sessoes                        Calendário e lista de sessões
│   ├── /sessoes/{aaaa-mm-dd}-{tipo}                  ex.: /sessoes/2026-10-20-ordinaria
│   │   └── /votacoes/{n}           votação dentro da sessão
│   └── /votacoes                   Todas as votações nominais (?divididas=1)
├── /camara                         A Câmara
│   ├── /camara/como-funciona
│   ├── /camara/mesa-diretora
│   ├── /camara/comissoes/{slug}
│   ├── /camara/composicao          partidos, gênero, mandatos (factual)
│   └── /glossario/{termo}
├── /dados                          Sobre os dados: downloads, API, dicionário, calendário de coleta
│   ├── /metodologia/{topico}       presenca, votacoes, natureza-das-proposicoes, temas, limites
│   └── /correcoes                  histórico público de correções
└── /sobre                          OSB Pindamonhangaba, princípios editoriais, contato
```

- **Menu principal:** **Vereadores · Proposições · Sessões · A Câmara**, mais **Buscar**. Utilitário à direita: "Sobre os dados".
- **Mobile:** cabeçalho com marca, ícone de busca e "Menu". O menu abre com os 4 itens mais "Sobre os dados". Breadcrumb em páginas profundas. Barra inferior de abas não é recomendada (é site de conteúdo, e as barras do navegador já ocupam espaço).
- **Rodapé:** Metodologia · Dados abertos · Correções · Sobre · Contato · Reportar erro, além de *"Mantido pelo OSB Pindamonhangaba. Este não é o site oficial da Câmara Municipal."* (modelo Identifier do USWDS / OpenParliament).

### 4.4 Composição da página inicial (não é painel de totais)

1. **"O que aconteceu na Câmara"**: última sessão (data, o que foi votado, quem esteve presente), próxima sessão (data e pauta, se publicada) e o selo "dados até dd/mm hh:mm".
2. **Os 11 vereadores**: grade de rostos com nome parlamentar e partido, em ordem alfabética, levando ao perfil (equivale ao "Find your MP").
3. **"Desde a última sessão"** (modelo Councilmatic): *"34 novas proposições, das quais 9 substantivas"*, com cada número clicável.
4. **"Votações divididas recentes"**.
5. **Busca única**: aceita "PL 45/2026", "req 1234/2026", nome de vereador, termo livre e, numa fase 2, **rua ou bairro**.
6. **Explicador fixo** "Como funciona uma câmara municipal em 2 minutos", levando a `/camara/como-funciona`.

> **Observação de contexto:** os vereadores de Pindamonhangaba são eleitos de forma proporcional, para o município inteiro, sem distritos. O "Find your ward" do Councilmatic e o CEP do TWFY não se aplicam. O equivalente útil, para uma fase 2, é **"Pedidos para o seu bairro"**, a partir do endereço citado em indicações e requerimentos. Isso exige extrair a localização do texto, com rótulo de precisão.

### 4.5 Padrões de URL

| Entidade | Padrão proposto | Inspiração | Notas |
|---|---|---|---|
| Vereador | `/vereadores/{nome-parlamentar}` | OpenParliament `/politicians/elizabeth-may/`; abgeordnetenwatch `/profile/friedrich-merz` | O slug vem do **nome parlamentar** (como o cidadão conhece). Em caso de homônimo, acrescentar o 2º nome. **Nunca reutilizar slug**; redirecionamento 301 permanente se o nome mudar |
| Abas do perfil | `/vereadores/{slug}/{proposicoes\|votos\|presencas\|despesas}` | abgeordnetenwatch `/profile/{slug}/abstimmungen` | Abas com URL própria, compartilháveis |
| Proposição | `/proposicoes/{tipo}/{ano}/{numero}` | GovTrack `/congress/bills/119/hr1`; OpenParliament `/bills/45-1/C-247/` | Chave natural da Câmara (a numeração costuma reiniciar por tipo e ano; confirmar). Tipos por extenso, sem acento: `projeto-de-lei`, `projeto-de-lei-complementar`, `projeto-de-resolucao`, `projeto-de-decreto-legislativo`, `requerimento`, `indicacao`, `mocao`. Atalhos que redirecionam: `/pl/2026/45`, `/req/2026/1234` |
| Emenda | `/proposicoes/projeto-de-lei/2026/45/emendas/1` | — | Emenda pendurada no projeto-pai |
| Sessão | `/sessoes/2026-10-20-ordinaria` | OpenParliament `/debates/2026/10/22/` | Data ISO + tipo (`ordinaria`, `extraordinaria`, `solene`); sufixo `-2` se houver duas no mesmo dia |
| Votação | `/sessoes/2026-10-20-ordinaria/votacoes/3` | OpenParliament `/votes/45-1/180/` | Ordem dentro da sessão; listagem geral em `/votacoes` |
| Listas filtradas | `/proposicoes?tipo=requerimento&autor=maria-silva&legislatura=2025-2028&natureza=substantiva` | GOV.UK *finders*; abgeordnetenwatch `?parliament_period=` | Nomes de parâmetro estáveis e documentados, em ordem canônica. **É o destino de todo número clicável.** Período sempre explícito no URL compartilhado |
| Formatos | mesmo URL + `.csv` / `.json` (ex.: `/proposicoes.csv?autor=maria-silva`) | link JSON do OpenParliament; download por votação do HowTheyVote | "Baixar estes 241 itens" gera exatamente o que está na tela |
| Tema | `/temas/saude` | CalMatters `/issues/education` | Slug estável; o tema é uma faceta |
| Glossário | `/glossario/indicacao` | — | Um URL por termo, linkável a partir de qualquer página |
| Método | `/metodologia/presenca` | CalMatters `/data-sources-methodology` | Uma página por regra de cálculo, com versão e data |

**Regras:**
- Minúsculas, hífen, sem acento no URL (com acento na tela).
- Nada de hashes, IDs opacos ou estado só em `#fragmento`.
- Barra final consistente e `<link rel="canonical">`.
- **URLs são permanentes**: registrar redirecionamentos, nunca quebrar.
- Cada página tem imagem Open Graph própria (nome, número, situação) para circular bem no **WhatsApp**, que é o principal canal de compartilhamento no Brasil.

### 4.6 Esqueletos das páginas-chave

**Proposição**
1. Tipo + número (`Requerimento nº 1.234/2026`) e título ou ementa.
2. Status em uma linha com data (Tag).
3. Nota de contexto do tipo (Inset text).
4. Ficha (Summary list): autoria (com links), data de protocolo, natureza, tema, regime de tramitação.
5. Etapas e histórico (P7).
6. Votações associadas (P12).
7. Documentos (texto original, pareceres, autógrafo, publicação no Jornal Oficial via Querido Diário, quando houver).
8. Proposições relacionadas e homônimas.
9. Rodapé de dados (P10).

**Vereador**
1. Cabeçalho (P8).
2. Em resumo, com seletor de período.
3. Atividade recente.
4. Abas.
5. Manifestação do vereador (se houver).
6. Rodapé de dados.

**Sessão**
1. Data, tipo e situação (realizada / prevista / cancelada).
2. Presenças (11 marcadores com nome, mais justificativas).
3. Pauta e ordem do dia, com o resultado de cada item (nominal ou simbólica).
4. Documentos (pauta, ata, vídeo).
5. Rodapé de dados.

**Votação**
1. Objeto e etapa.
2. Regra de quórum.
3. Resultado em texto.
4. Marcadores por voto.
5. Notas de papel (Presidente, licenças).
6. Rodapé de dados, com download do voto a voto.

---

## 5. Fontes

**Legislativos e plataformas cívicas (internacionais)**
- https://councilmatic.org
- https://chicago.councilmatic.org
- https://chicago.councilmatic.org/about/
- https://chicago.councilmatic.org/compare-council-members/
- https://chicago.councilmatic.org/divided-votes/
- https://chicago.councilmatic.org/legislation/o2026-0029645/
- https://boardagendas.metro.net
- https://datamade.us/our-work/councilmatic/chicago-councilmatic/
- https://github.com/datamade/councilmatic-starter-template
- https://participatorypolitics.org/bring-councilmatic-to-your-city/
- https://www.govtrack.us (bloqueado por Cloudflare) · https://www.govtrack.us/posts/news · https://substack.govtrack.us/archive
- https://en.wikipedia.org/wiki/GovTrack
- https://leadstories.com/hoax-alert/2024/07/fact-check-govtrack-did-not-delete-only-kamala-harris-2019-report-card-all-from-2019-were-consolidated-deleted.html
- https://congressionaldata.org/ending-govtracks-bulk-data-and-api/
- https://www.edegan.com/wiki/How_to_Search_for_Bills_using_govtrack.us
- https://thebadgerproject.org/2026/05/05/percentage-of-missed-votes-by-wisconsin-members-of-congress-in-2023-24/
- https://www.wowt.com/2026/08/26/checking-josh-turek-ashley-hinsons-missed-votes-claims-against-each-other/
- https://www.theyworkforyou.com
- https://www.theyworkforyou.com/mp/25353/keir_starmer/holborn_and_st_pancras (e `/recent`)
- https://www.theyworkforyou.com/voting-information/ (503 na consulta)
- https://www.mysociety.org/2024/04/23/improving-the-focus-of-theyworkforyous-voting-summaries/
- https://www.mysociety.org/2025/03/13/updating-theyworkforyous-voting-summaries/
- https://www.mysociety.org/2025/05/19/theyworkforyou-votes/
- https://www.mysociety.org/2025/10/22/voting-summaries-update-october-2025/
- https://www.mysociety.org/2026/07/01/theyworkforyou-voting-summaries-update-july-2026/
- https://openparliament.ca · https://openparliament.ca/politicians/ · https://openparliament.ca/bills/45-1/C-247/
- https://howtheyvote.eu · https://howtheyvote.eu/votes · https://howtheyvote.eu/votes/198292 · https://howtheyvote.eu/about
- https://en.wikipedia.org/wiki/VoteWatch_Europe · https://cadmus.eui.eu/handle/1814/74918
- https://www.abgeordnetenwatch.de · https://www.abgeordnetenwatch.de/profile/friedrich-merz · https://www.abgeordnetenwatch.de/bundestag/abstimmungen
- https://www.nosdeputes.fr (indisponível) · https://www.regardscitoyens.org · https://directory.civictech.guide/listing/regards-citoyens
- https://www.publicsenat.fr/actualites/non-classe/releves-de-presence-agenda-public-pistes-pour-mesurer-l-activite-des-deputes
- https://next.ink/9240/104958-accuse-dantiparlementarisme-nosdeputes-fr-pris-en-grippe-par-deputes/
- https://open.pluralpolicy.com/ · https://pluralpolicy.com/open · https://openstates.org
- https://pluralpolicy.com/blog/plural-acquires-open-states-and-invests-in-the-future-of-civic-data/
- https://www.themiddlemarket.com/latest-news/stg-backed-sai360-acquires-plural-policy
- https://directory.civictech.guide/listing/plural-previously-openstatesorg
- https://calmatters.digitaldemocracy.org/ · https://directory.civictech.guide/listing/digital-democracy-at-cal-matters · https://calmatters.org/inside-the-newsroom/2025/06/digital-democracy-emmy-win/
- https://www.propublica.org/nerds/represent-design-renovation · https://projects.propublica.org/represent/
- https://www.europarl.europa.eu/legislative-train/ (conteúdo não renderizado na consulta)

**Brasil**
- https://dadosabertos.camara.leg.br · https://www.camara.leg.br/deputados/204554
- https://queridodiario.ok.org.br · https://docs.queridodiario.ok.org.br/pt-br/latest/ · https://github.com/okfn-brasil/querido-diario-api · https://github.com/okfn-brasil · https://ok.org.br/projetos/querido-diario/
- https://radarparlamentar.polignu.org · https://ccsl.ime.usp.br/en/news/2013/06/legislative-radar-project-wins-prize-mario-covas-award-2013
- https://www.transparencia.org.br/projetos · https://www.transparencia.org.br/projetos/emendas-parlamentares
- https://excelencias.org.br/ · https://www.achadosepedidos.org.br/
- https://fiquemsabendo.com.br
- https://www.politicaporinteiro.org · https://politicaporinteiro.org/metodologia/
- https://www.ranking.org.br · https://static.poder360.com.br/2025/12/Excelencia-Parlamentar-2025.pdf · https://www.infomoney.com.br/?p=237907
- https://legislabrasil.org
- https://www.osb-saopaulo.org.br/monitoramento-do-legislativo-2021-2024/ · https://www.osb-saopaulo.org.br/paineis-interativos/painel-conheca-seu-vereador/
- https://latinno.net/en/case/3335/
- https://media.h2foz.com.br/2023/12/0e5acfc7-osb.docx (OS Foz do Iguaçu)
- https://dpontanews.com.br/campos-gerais/projeto-do-observatorio-social-dos-campos-gerais-disponibiliza-historico-de-atuacao-dos-vereadores-de-pg-saiba-como-acessar/ · https://pontagrossa-camposgerais.osbrasil.org.br/ (DNS não resolve)
- https://serenata.ai · https://jarbas.serenata.ai (HTTP 521) · https://en.wikipedia.org/wiki/Operation_Serenata_de_Amor
- https://arte.estadao.com.br/politica/basometro/ · https://www.congressoemfoco.com.br/noticia/60512/jornais-nucleo-duro-de-dilma-na-camara-encolhe-em-2012
- https://mais.opovo.com.br/interativos/monitor-da-bancada/index.php
- https://www.nexojornal.com.br/grafico

**Jornalismo de dados, dataviz e acessibilidade**
- https://ourworldindata.org/grapher/life-expectancy
- https://pudding.cool
- https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- https://usafacts.org/about-usafacts/
- https://datausa.io · https://datausa.io/profile/geo/chicago-il
- https://chartability.github.io/POUR-CAF/
- https://www.datawrapper.de/academy/how-we-make-sure-our-charts-maps-and-tables-are-accessible · https://www.datawrapper.de/blog/colorblindness-part2
- https://adrianroselli.com/2018/02/tables-css-display-properties-and-aria.html
- https://www.nngroup.com/topic/mobile-web/?page=2

**Design systems**
- https://design-system.service.gov.uk/components/ · https://design-system.service.gov.uk/components/details/ · https://design-system.service.gov.uk/components/table/ · https://design-system.service.gov.uk/community/whats-new
- https://registry.npmjs.org/govuk-frontend (6.6.0, 15/10/2026)
- https://designsystem.digital.gov/components/overview/ · https://registry.npmjs.org/@uswds/uswds (3.14.0, 18/08/2026)
- https://www.gov.br/ds/home · https://www.gov.br/ds/fundamentos-visuais/tipografia · https://registry.npmjs.org/@govbr-ds/core (3.7.0; 4.0.0-next.11 de 06/05/2026)
- https://convergenciadigital.com.br/governo/gov-br-e-servicos-digitais-vao-ganhar-cara-nova · https://www.serpro.gov.br/menu/noticias/noticias-2024/design-system-4.0
- https://design-patterns.service.justice.gov.uk/components/filter/
- https://www.gov.uk/search/news-and-communications

**Awwwards e Behance**
- https://www.awwwards.com/sites/data-usa · https://www.awwwards.com/sites/media-election-2020 · https://www.awwwards.com/websites/data-visualization/
- https://www.behance.net/search/projects?search=C%C3%A2mara+dos+Vereadores

**Tipografia (arquivos inspecionados)**
- https://github.com/google/fonts: `ofl/sourceserif4`, `ofl/sourcesans3`, `ofl/newsreader`, `ofl/publicsans`, `ofl/literata`, `ofl/ibmplexsans`, `ofl/ibmplexserif`, `ofl/atkinsonhyperlegiblenext`, `ofl/inter`, `ofl/raleway`, `ofl/merriweather`, `ofl/spectral`, `ofl/instrumentsans`, `ofl/fraunces`
