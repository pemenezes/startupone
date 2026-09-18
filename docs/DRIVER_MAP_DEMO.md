# Mapa e embarque do motorista

Abra Jornada → Abrir mapa interativo, mesmo sem uma rota atribuída.

## Fluxo

- Mapa em destaque, com três paradas de embarque, cinco passageiros e um destino.
- Um cartão de parada por vez: navegar até o local → confirmar chegada → embarque ou ausência.
- Cada registro de passageiro exige confirmação em diálogo com nome e ação. Voltar ou Escape cancela.
- A próxima parada aparece somente após resolver todos os passageiros da atual.
- Confirmar chegada ao destino conclui o percurso e mostra os totais.
- Marcadores permitem consultar os pontos, sem pular etapas. Pontos concluídos recebem um visto.
- Ativar GPS solicita permissão; a primeira posição aproxima a rota do motorista enquanto ela ainda não foi iniciada.
- Navegar ou confirmar a primeira chegada fixa a origem. Sinais posteriores movem apenas o motorista.
- Sair da tela encerra o acompanhamento do GPS.

## Navegação externa

Não há seletor nem persistência de preferência. Android recebe um link geo sem pacote de aplicativo;
iPhone/iPad recebe um link Maps de destino; computadores recebem um link web de direções.
A abertura, os aplicativos elegíveis e eventual seletor dependem do sistema, navegador e configurações.
Não há garantia de um seletor universal, especialmente no iOS. Conferir em aparelhos reais.

Referências:
- https://developer.android.com/guide/components/intents-common#Maps
- https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
- https://developers.google.com/maps/documentation/urls/get-started

## Dados e limites desta entrega

A interface não exibe avisos de protótipo por decisão de produto. Os dados continuam fictícios,
isolados dos passageiros e atribuições reais. Não há gravação no Supabase nem migração SQL.
Chegadas, embarques e ausências existem apenas na memória desta tela; sair ou recarregar reinicia o fluxo.

As coordenadas são deslocamentos a partir da origem, sem geocodificação ou validação viária.
A linha tracejada liga pontos; não representa um cálculo de trajeto pelas ruas. Não há ETA.
Sem GPS, a origem inicial fica em São Paulo. Não usar esta rota em uma operação real.

Tiles do OpenStreetMap exigem internet. Em falha, há nova tentativa e o cartão permanece utilizável.
GPS exige permissão e HTTPS ou localhost. HTTP pelo IP de rede pode impedir localização no celular.
O provedor de mapas recebe requisições de tiles; o link externo transmite o destino ao aplicativo.

## Validação

- `node --test tests/driver-demo.test.mjs tests/driver-schedule.test.mjs`
- ESLint dos arquivos alterados e build de produção.
- Navegador com autenticação/API simuladas: sequência completa, chegada obrigatória, ausência,
  cancelar/confirmar/Escape no diálogo, marcadores sem salto de etapa, contagens finais, GPS permitido,
  movimento e primeira posição tardia sem deslocar paradas iniciadas, GPS negado, falha de tiles,
  largura de 320 px e ausência de gravações na API.
- A abertura efetiva dos aplicativos e o comportamento de retorno precisam de validação em celular.
