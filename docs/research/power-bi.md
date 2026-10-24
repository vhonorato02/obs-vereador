# Engenharia reversa do Power BI atual

Relatório público: `app.powerbi.com/view?r=…` (resourceKey `21174870-0467-423b-87ed-9fea7c95271b`).
Extraído em 24/10/2026 pela API pública do "Publicar na Web" (cluster `wabi-brazil-south-api`):
definição do relatório (formato PBIR), esquema conceitual e dados do modelo.

- Conjunto de dados: "Observatório - Final - 240826", modelo de 1 MB, importação (sem DirectQuery), **sem atualização agendada** (`nextRefreshTime = 9999-12-30`).
- Última atualização manual: **24/08/2026 14:20**. Período declarado na capa: "01/01/2025 a 24/08/2026".
- Versões anteriores (.pbix/.xlsx de 2024, legislatura 2021–2024) e o `GLOSSÁRIO.docx` estão no Google Drive do dono.

## 1. Páginas (ordem de navegação)

| Página | Conteúdo |
|---|---|
| **Início** | cabeçalho com logo; filtros ANO e VEREADOR; cartão de identificação (nome, foto, "Nº de Votos – 2024", partido, subsídio); 9 cartões com totais: ausências justificadas e injustificadas, requerimentos, emendas, indicações, moções, PDL, PLO, PR |
| Moções | filtros ANO/VEREADOR; barras por vereador; texto explicativo |
| Emendas | idem |
| Ausências | colunas agrupadas (justificadas × injustificadas) por vereador + 2 cartões |
| Indicações | idem a Moções |
| Projetos de Decreto Legislativo | idem |
| Projetos de Lei Ordinária | idem |
| Projetos de Resolução | idem |
| Requerimentos | idem |
| Glossário | definições dos 7 tipos de proposição |

Cada página tem botão "voltar", botão "limpar filtros", navegação inferior por abas e tela fixa de 1280×720 ("Ajustar à página").

## 2. Modelo de dados

| Tabela | Colunas |
|---|---|
| Vereador | Nome completo, Nome Político, Partido, Salário, Nº de Votos, Nº de Mandatos, Foto (URL do site da Câmara) |
| Totais | ANO, VEREADOR, MOÇÕES, EMENDAS, INDICAÇÕES, AUSÊNCIAS JUSTIFICADAS, AUSÊNCIA INJUSTIFICADAS, PROJETOS DE LEI ORDINÁRIA, PROJETOS DE RESOLUÇÃO, REQUERIMENTOS, PROJETOS DE DECRETO LEGISLATIVO |
| Requerimentos, Indicações, Moções, Emendas, PLO, PR, PDL | ANO, VEREADOR, contagem |
| Ausências | ANO, VEREADOR, justificadas, injustificadas |

Única medida: `FormattedSalary`. **Não há registros individuais** — apenas contagens por vereador e ano, digitadas a partir do site da Câmara.

## 3. Baseline histórico (dados do Power BI em 24/08/2026)

Usado na reconciliação com as fontes oficiais. Não é fonte primária.

Vereadores (2025–2028): 11. Subsídio informado: R$ 9.605,83 para todos. Votos e mandatos informados manualmente.

| Ano | Vereador (nome no PBI) | Moç | Emd | Ind | AusJ | AusI | PLO | PR | Req | PDL |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2025 | Ana Paula Goffi | 35 | 96 | 233 | 0 | 0 | 75 | 18 | 637 | 2 |
| 2025 | Carlos Moura - Magrão | 86 | 64 | 283 | 0 | 0 | 35 | 5 | 299 | 11 |
| 2025 | Felipe César Filho - FC | 17 | 38 | 638 | 0 | 0 | 17 | 3 | 113 | 0 |
| 2025 | Gari Abençoado | 20 | 65 | 474 | 0 | 0 | 22 | 2 | 127 | 2 |
| 2025 | Gilson Nagrin | 15 | 71 | 57 | 0 | 0 | 11 | 2 | 130 | 0 |
| 2025 | Marco Mayor | 71 | 43 | 394 | 0 | 0 | 38 | 3 | 319 | 4 |
| 2025 | Norbertinho | 31 | 62 | 547 | 0 | 0 | 24 | 3 | 245 | 4 |
| 2025 | Professor Everton | 37 | 35 | 149 | 0 | 0 | 32 | 3 | 216 | 5 |
| 2025 | Professor Felipe Guimarães | 74 | 58 | 873 | 0 | 0 | 32 | 4 | 314 | 3 |
| 2025 | Renato Cebola | 35 | 45 | 801 | 0 | 0 | 49 | 7 | 326 | 5 |
| 2025 | Rogério Ramos | 16 | 47 | 50 | 0 | 0 | 12 | 4 | 420 | 2 |
| 2026 | Ana Paula Goffi | 18 | 20 | 237 | 0 | 2 | 26 | 2 | 458 | 0 |
| 2026 | Carlos Moura - Magrão | 42 | 6 | 223 | 0 | 0 | 27 | 2 | 128 | 2 |
| 2026 | Felipe César Filho - FC | 9 | 2 | 378 | 0 | 0 | 19 | 1 | 97 | 1 |
| 2026 | Gari Abençoado | 3 | 7 | 361 | 0 | 0 | 18 | 1 | 84 | 0 |
| 2026 | Gilson Nagrin | 7 | 7 | 34 | 0 | 0 | 10 | 1 | 84 | 1 |
| 2026 | Marco Mayor | 21 | 8 | 205 | 0 | 0 | 17 | 1 | 155 | 2 |
| 2026 | Norbertinho | 21 | 3 | 499 | 0 | 0 | 11 | 2 | 184 | 3 |
| 2026 | Professor Everton | 13 | 3 | 163 | 0 | 0 | 8 | 2 | 147 | 0 |
| 2026 | Professor Felipe Guimarães | 65 | 2 | 883 | 0 | 0 | 19 | 2 | 219 | 1 |
| 2026 | Renato Cebola | 18 | 9 | 691 | 0 | 2 | 19 | 1 | 207 | 2 |
| 2026 | Rogério Ramos | 9 | 1 | 99 | 0 | 0 | 8 | 1 | 201 | 1 |
| **2025** | **Soma** | **437** | **624** | **4499** | **0** | **0** | **347** | **54** | **3146** | **38** |
| **2026** | **Soma** | **226** | **68** | **3773** | **0** | **4** | **182** | **16** | **1964** | **13** |

Legenda: Moç = moções; Emd = emendas; Ind = indicações; AusJ/AusI = ausências justificadas/injustificadas; PLO = projetos de lei ordinária; PR = projetos de resolução; Req = requerimentos; PDL = projetos de decreto legislativo.

Hipóteses a verificar na reconciliação:
- A soma de PLO por vereador (347 em 2025) provavelmente conta coautoria para cada autor. Se confirmado, **soma por vereador ≠ número de projetos**, e a nova plataforma precisa mostrar as duas coisas.
- Ausências quase todas zeradas: indício de coleta incompleta, não de presença perfeita.
- "Nº de Votos – 2024" e "Nº de Mandatos" não têm fonte declarada (provável TSE).

## 4. O que funciona

- Glossário em linguagem simples (reaproveitável, com revisão).
- Filtro por vereador + ano é a pergunta certa do cidadão.
- Foto, partido e subsídio no topo humanizam e contextualizam.

## 5. Problemas

| Tipo | Problema |
|---|---|
| Confiança | Nenhum número leva aos registros que o compõem ("número mágico"); sem fonte, data de coleta ou método |
| Atualização | Manual, com defasagem de meses; sem indicação de "dados até" além da capa |
| Dados | Só 7 tipos + ausências; sem tramitação, resultado, votações, temas, bairros, comissões, sessões |
| Neutralidade | Gráficos de barras ranqueiam vereadores por volume, sugerindo mérito por quantidade |
| UX | 10 páginas quase idênticas (uma por tipo) em vez de uma visão filtrável; navegação por abas sem hierarquia |
| Mobile | Tela fixa 1280×720 encolhida; texto e filtros ilegíveis no celular |
| Acessibilidade | Visual Power BI com navegação por teclado limitada, sem alternativa textual; cores sem verificação de contraste |
| SEO/compartilhamento | Nada indexável; impossível compartilhar link de um vereador ou de uma proposição |
| Histórico | Cada legislatura vira um arquivo .pbix novo; comparação entre legislaturas inexistente |

## 6. O que preservar na v1

- Todos os indicadores atuais (os 7 tipos + presença), por vereador e por ano, agora clicáveis até o registro.
- O glossário, revisado e expandido.
- Identificação do vereador (foto, partido, mandato, subsídio, votos — com fonte).
- O baseline acima, importado como **dado histórico**, marcado como tal, até ser reconciliado.
