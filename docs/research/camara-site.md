# Mapeamento do site da Câmara Municipal de Pindamonhangaba

Pesquisa feita em 24/10/2026. Fonte primária: `https://www.pindamonhangaba.sp.leg.br`.
Coleta exploratória: ~20 requisições manuais, espaçadas (≥ 12 s), a partir de um Vercel Sandbox na região `gru1` (São Paulo), sem disfarce de User-Agent.

## 1. Plataforma

| Item | Observação |
|---|---|
| Sistema | **SoftCam** (caminhos `/softcam/...`, `/jsonweb/...`, `keysoft=`) — CMS legislativo comercial, PHP |
| Servidor | LiteSpeed, `x-powered-by: PHP/7.4.33` (PHP 7.4 sem suporte desde nov/2022) |
| Anti-robô | LiteSpeed reCAPTCHA ("Bot Verification", `/.lsrecap/recaptcha`). Disparou em uma requisição do script exploratório |
| CORS | `access-control-allow-origin: *` |
| Cache HTTP | `cache-control: no-store` em tudo — sem ETag/Last-Modified úteis para requisição condicional |
| Sistemas antigos | `sapl.pindamonhangaba.sp.leg.br` (SAPL/Interlegis) ainda resolve DNS, mas **derruba o TLS**; páginas `/institucional/noticias/...` são do portal Plone anterior (ainda indexadas pelo Google) |
| Alcance de rede | Recusa conexões de alguns datacenters (Google Cloud: timeout de TCP). Responde da AWS São Paulo (Vercel `gru1`) e de ~35 países via check-host.net |

## 2. API oficial de Dados Abertos

Documentada em `/dadosabertos`.

```
GET https://www.pindamonhangaba.sp.leg.br/jsonweb/web-aplicativo.php?keysoft=<TOKEN>&call=<serviço>[&params]
```

- Token: gratuito, obtido com login/cadastro de cidadão em `/cidadao`.
- **Sem token: HTTP 200 com corpo vazio** (`content-length: 0`). O coletor deve tratar corpo vazio como erro, nunca como "zero registros".
- Termos: acesso livre para qualquer finalidade, responsabilidade do usuário pelo uso; dúvidas via ouvidoria.

| Serviço | Parâmetros | Conteúdo |
|---|---|---|
| `atendimento` | — | dados de atendimento |
| `vereadores` | — | vereadores **em exercício** (não traz histórico) |
| `proposicoes_tipos` | — | tipos de proposição (com `contract`) |
| `proposicoes` | `tipo=<contract>`, `pagina=N` | proposições por tipo |
| `proposicoes` | `bairro=<legenda>`, `pagina=N` | proposições por **bairro** |
| `legislacoes_tipos` | — | tipos de norma |
| `legislacoes` | `tipo=<contract>`, `pagina=N` | normas por tipo |
| `bairros` | — | bairros do município |
| `pautas` | `pagina=N` | pautas das sessões |
| `publicacoes_tipos` | `menu=<contract>` | tipos de publicação por menu |
| `publicacoes` | `menu=` ou `tipo=`, `pagina=N` | publicações (notícias, atos, licitações, transparência…) |

RSS (sem token): `/jsonweb/web-rss.php` — 50 últimas notícias.

**Não estão na API:** tramitação detalhada, votações nominais, presença, comissões, Mesa Diretora, legislaturas anteriores. Precisam vir de HTML/PDF.

## 3. Rotas HTML relevantes

| Rota | Conteúdo |
|---|---|
| `/tramitacoes` e `/tramitacoes/{pagina}/0/0` | feed de "Matérias em Tramitação": data/hora, tipo+número/ano, ementa, autoria, situação atual |
| `/tramitacoes/1/{id}/0` | página da matéria (mesmo documento de `/proposicoes/{Tipo}/0/1/0/{id}`) |
| `/proposicoes/{Tipo}` | listas por tipo: `Requerimentos`, `Indicacoes`, `Mocoes`, `Emendas`, `Vetos`, `Projetos-de-Lei-Ordinaria`, `Atos`… |
| `/proposicoes/{Tipo}/0/{pagina}` | paginação da lista |
| `/proposicoes/{Tipo}/0/1/0/{id}` | página da proposição |
| `/proposicoes/Leis-Ordinarias/{ano}`, `/proposicoes/Lei-Organica-Municipal/...` | legislação |
| `/proposicoes/pesquisa?tipo=&number=&ano=&data_ini=&data_fim=&autoria=&situacao=&palavras_chave=` | pesquisa (GET) |
| `/ajax/tramitacao/proposicao/{id}` | **fragmento AJAX** com a linha do tempo e as votações |
| `/camara/membros/exercicio/0` | vereadores em exercício (nome parlamentar + partido) |
| `/camara/membros/show/{id}` | perfil do vereador |
| `/pautas`, `/pautas/sessao_ordinaria/{ano}`, `/pautas/sessao_extraordinaria/{ano}`, `/pautas/sessao_solene/{ano}`, `/pautas/sessao_especial/{ano}`, `/pautas/audiencia_publica/{ano}` | pautas de plenário |
| `/pautas/comissao/0/1/{id}` | pautas das 7 comissões permanentes (ids 58–64) |
| `/calendario`, `/ajax/calendario/{ano}/{mes}/{categoria}` | agenda de sessões e eventos |
| `/softcam/votacao_print_pdf.php?topico={id}` | PDF da votação |
| `/softcam/pautas_print_pdf.php?item={id}` | PDF da pauta |
| `/assinatura/assinado/{ano}/{mes}/{chave}.pdf?vh=` | documento assinado digitalmente (PDF oficial) |
| `/softcam/documento_print_doc.php?documento_tipo=proposicao&documento={id}` | DOC do documento |

## 4. Anatomia de uma proposição (ex.: Requerimento 2398/2026, id 153972)

- Data/hora de publicação, título ("REQUERIMENTO N.º 2398/2026"), texto integral em HTML, autor e partido na assinatura ("Norberto Moraes (PP)").
- Links: PDF assinado, DOC, "pasta digital", verificação de assinatura, consulta pública (quando houver).
- "Protocolos desta Publicação": criado em/por (nome civil do vereador), alterado em/por (servidor da Câmara).
- "Relacionamentos desta Matéria" (ex.: Providência Administrativa nº 143/2025).

## 5. Anatomia da tramitação (fragmento AJAX)

Exemplo real (Requerimento 2398/2026):

```
15/10/2026 09:18  Encaminhada para Protocolo
15/10/2026 09:55  Apresentada — Redação Original — Protocolo [11324/2026] — Regime: Ordinário
15/10/2026 09:55  Entrada na Pauta — Pauta da 37ª Sessão Ordinária de 2026 — Sessão 20/10/2026 17:00
20/10/2026 18:30  Votação — Única — APROVADO — Quórum: Maioria Absoluta
                  Votos: Favoráveis (10): Ana Paula Goffi, Carlos Moura - Magrão, Felipinho César,
                  Gari Abençoado, Gilson Nagrin, Norberto Moraes, Professor Everton,
                  Professor Felipe Guimarães, Renato Cebola, Rogério Ramos
20/10/2026 18:30  Tramitação Concluída
21/10/2026 13:58  Encaminhada para Consulta Pública
```

Implicações:
- Votação nominal por matéria é coletável (HTML) e conferível (PDF de votação).
- 10 votos para 11 vereadores: o presidente normalmente não vota em matéria comum. **"Não votou" não é "ausente"** — a metodologia precisa distinguir.
- Nomes nas votações usam o nome parlamentar do momento ("Felipinho César", "Norberto Moraes"), diferente do Power BI ("Felipe César Filho - FC", "Norbertinho") e do nome civil. Exige tabela de apelidos com identidade canônica.

## 6. Volume observado

- Indicação nº 4.676/2026 e Requerimento nº 2.490/2026 em 23/10/2026 → ordem de **8–10 mil proposições por ano**, ~40 mil por legislatura. Pequeno para Postgres.
- O seletor de autoria lista ~200 vereadores históricos com IDs internos, **com duplicatas** (ex.: "Adilson Macedo" com IDs 92 e 187; "Anibal/Aníbal Leite De Abreu").

## 7. Presença em sessão

Não há página de presença por sessão identificada. As **atas em PDF** registram chamada nominal (ex.: Ata nº 01/2024). Presença precisará de extração de PDF, com validação manual no início.

## 8. Transparência e sistemas externos (links do próprio site)

| Link | Sistema | Uso provável |
|---|---|---|
| `siapegov.pindamonhangaba.sp.gov.br/portal-transparencia/home` | SIAPE GOV | portal da transparência (despesas, folha, contratos) |
| `dsiapp.pindamonhangaba.sp.gov.br/emendas/` | DSI | emendas impositivas |
| `radardatransparencia.atricon.org.br` | Atricon | avaliação externa de transparência |
| `falabr.cgu.gov.br`, `informabr.cgu.gov.br` | CGU | ouvidoria e pedidos de acesso à informação |
| `bllcompras.com` | BLL | pregões eletrônicos |
| `/imprensa/transparencia/Contas-do-Legislativo/` | SoftCam | prestação de contas da Câmara |

## 9. Riscos específicos desta fonte

- Anti-robô pode bloquear coleta legítima a qualquer momento → pedir liberação formal (lista de permissão por IP ou User-Agent) à TI da Câmara, apoiado pelo token da API.
- Ausência de cabeçalhos de cache → detectar mudança por hash do conteúdo normalizado.
- PHP 7.4 em fim de vida → probabilidade de troca de sistema/fornecedor nos próximos anos (aconteceu antes: Plone/SAPL → SoftCam).
- Erros silenciosos (HTTP 200 vazio) → validação de plausibilidade obrigatória.

## 10. Teste a partir do GitHub Actions (24/10/2026, User-Agent honesto)

Workflow `.github/workflows/source-probe.yml`, runner `ubuntu-latest` (Azure, EUA).

| Endpoint | Resultado |
|---|---|
| Página inicial (HTML) | página "Bot Verification" |
| `/jsonweb/web-rss.php` (API) | 200, conteúdo real |
| `/ajax/tramitacao/proposicao/153972` | página "Bot Verification" |
| `/softcam/votacao_print_pdf.php?topico=88553` | página "Bot Verification" |
| SIAPE GOV `/portal-transparencia/api/sis_entidade` | 200 |
| TCE-SP `/api/json/municipios` | 200 |
