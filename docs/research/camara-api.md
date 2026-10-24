# API de Dados Abertos da Câmara — validação com token (24/10/2026)

Consultas feitas com o token de cidadão do projeto, a partir de Vercel Sandbox em `gru1` (São Paulo) e `iad1` (EUA), User-Agent honesto, 2–3 s entre consultas. O token nunca foi gravado no repositório.

## Alcance

| Origem | Resultado |
|---|---|
| Vercel `gru1` (AWS São Paulo) | 200, JSON |
| Vercel `iad1` (EUA — onde rodam os builds) | 200, JSON, ~1 s |
| Contêiner do Claude Code (Google Cloud) | conexão recusada |

Conclusão: o build da Vercel consegue coletar direto da API. Não depende de liberação da Câmara.

## Serviços e campos

| Serviço | Itens | Campos |
|---|---|---|
| `atendimento` | objeto | uf, municipio, logradouro, bairro, cep, endereco, endereco_latlon, telefone, email, horario_atendimento, horario_sessoes |
| `vereadores` | 11 (só em exercício) | nome, partido, funcao (Presidente, 1º Vice…, Vereador), imagem, link |
| `proposicoes_tipos` | 14 | contract, titulo, link |
| `legislacoes_tipos` | 12 | contract, titulo, link |
| `bairros` | **0 (lista vazia)** | — |
| `pautas&pagina=N` | 50 por página | data, titulo, link |
| `proposicoes&tipo=X&pagina=N` | 50 por página, mais nova primeiro | data, titulo, ementa, autoria, link |
| `legislacoes&tipo=X&pagina=N` | 50 por página | data, titulo, ementa, autoria (vazia), link |

- Página além da última devolve `[]`.
- **Coautoria:** `autoria` é texto com nomes separados por `;` (ex.: `Marco Mayor; Felipinho César; Professor Everton`). Nomes = nome parlamentar atual.
- Projetos do prefeito: `autoria = "Poder Executivo"`.
- **Normas não têm autoria**; a ementa costuma trazer “(Projeto de Lei n° 148/2026, de autoria do Vereador …)”.
- Não há: situação, tramitação, votações, presença, bairro por proposição (o serviço `bairros` veio vazio).
- O `id` do documento está só no `link` (`/proposicoes/0/0/0/0/{id}`).

## Profundidade histórica (inventário parcial)

| Tipo | Total na API | Mais antigo |
|---|---:|---|
| Emendas | 3.824 | 1950 |
| Indicações | 42.076 | 1999 |
| Indicações de Projetos de Lei | 457 | 2009 |
| Moções | 8.460 | 2000 |
| Projetos de Decreto Legislativo | 385 | 1971 |
| Projetos de Lei Complementar | 146 | 1998 |
| Projetos de Lei de Iniciativa Popular | 4 | 1974 (último em 1996) |
| Projetos de Lei Ordinária | 8.939 | — (inventário interrompido) |

O inventário foi interrompido por reinício da sessão antes dos demais tipos. O histórico existe e é longo; a v1 cobre só a legislatura 2025–2028.

## Hipóteses do relatório respondidas

- **H1** (campos): respondida acima.
- **H2** (situação/tramitação na API): não há.
- **H3** (profundidade): décadas, ver tabela.
- **H4** (coautoria): lista separada por `;`.
