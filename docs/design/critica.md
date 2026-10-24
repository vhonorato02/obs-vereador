# Crítica de design e produto (24/10/2026)

Registro honesto do que estava errado nas duas primeiras versões e do que mudou na v2. Serve para não repetir.

## v1 — "relatório no navegador"

- Estrutura de documento: título, parágrafo, tabela. Nenhuma resposta visual.
- Ponto de partida errado: a fonte (tipos de proposição da Câmara), não a pergunta do cidadão.
- Números corretos mas mudos: "873 indicações" não diz o que foi pedido, para onde, nem como isso se compara.
- Na prática, um espelho organizado do site da Câmara.

## v1.1 — "app de busca"

- Melhorou a forma (barra de abas, busca ao vivo, transição de foto), mas continuou sendo um **buscador**: o usuário precisava saber o que procurar.
- Gráficos mínimos (barras mensais de um vereador) sem contexto, sem comparação e sem leitura.
- Nenhuma síntese: o portal não dizia nada que o cidadão não pudesse achar sozinho no site oficial.

## v2 — experiência com os dados

O que mudou, a partir de uma análise real das 16.822 proposições:

| Antes | Agora |
|---|---|
| Lista de vereadores + busca | **Panorama** em histórias: 9 em cada 10 proposições são pedidos; o ritmo mês a mês; do que tratam os pedidos; bairros mais citados; a quem se pede; do projeto à lei; quem assina junto |
| Perfil = tabela de contagens | **Raio-X**: fatos em uma linha, ritmo empilhado por tipo, assuntos com a proporção da Câmara como referência (comparação sem ranking), bairros, rede de coautoria, projetos que viraram lei |
| Sem comparação | **Comparar** até 3 vereadores, mesma escala em todos os gráficos |
| Busca por bairro textual | **Bairros**: índice com filtro instantâneo e uma página por bairro (assuntos, quem pediu, linha do tempo) |
| Só dados brutos | Informações **derivadas** e rotuladas como tal: assuntos (regras públicas), bairros citados, destinatários, origem das leis |

Princípios mantidos: sem ranking, ordem alfabética para pessoas, número sempre igual à lista que abre (testado), fonte e data em toda página, paleta validada para daltonismo (claro e escuro).

## Autocrítica durante a v2

- Publicaria "Projetos do Executivo: 0 de 138 viraram lei". Era limite do método (as leis do Executivo não citam o projeto de origem), não fato. Removido e explicado na página.
- Três agregados quebravam "número = lista" (assuntos contados num subconjunto diferente do link; mês de publicação × ano do número; "projetos de lei" × grupo "projetos"). Corrigidos com filtros novos e testes.
- Tooltips invisíveis e itens de grade sem `min-width: 0` faziam a página transbordar no celular. Corrigido e verificado em 390 px.

## Ainda não é padrão ouro

- Mapa dos bairros: falta geometria oficial dos bairros de Pindamonhangaba (não inventamos coordenadas).
- Classificação por assunto é por palavras-chave: ~10% dos pedidos ficam sem assunto, e há falsos positivos possíveis.
- Votações e presença dependem de a Câmara publicar esses dados na API.
- Instalação como app (PWA), compartilhamento nativo e navegação por teclado nas sugestões da busca.
