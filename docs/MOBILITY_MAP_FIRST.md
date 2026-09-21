# Comfy — roteiro da experiência de mobilidade

As telas de acompanhamento do passageiro e navegação do motorista compartilham o mesmo desenho: mapa em destaque e painel inferior em três posições. A posição padrão ocupa aproximadamente 30% da tela; use as setas ou arraste a alça para subir aos detalhes ou descer e mostrar mais mapa. Quando os dados de jornada existem no Supabase, ambas as telas usam essa jornada. Caso a estrutura nova ainda não esteja instalada, as telas exibem um percurso interativo local compartilhado entre abas do mesmo navegador, com chegada e embarques apresentados sem alterar o banco.

## Preparação no Supabase de desenvolvimento

1. Para apresentar o percurso local, basta entrar com contas dos perfis motorista e passageiro e abrir as telas de mapa. Ações feitas no mapa do motorista aparecem no mapa do passageiro em outra aba do mesmo navegador. Para integrar as ações ao Supabase, confirme no projeto de desenvolvimento que as tabelas e funções dos pacotes A, B1 e B2 estão instaladas.
2. Execute `docs/mobility_map_first.sql`. Ele acrescenta paradas, chegada, posição, atraso e notificações às entidades existentes. Não recria as tabelas de jornada.
3. Execute `docs/company_operations_tcc.sql` para habilitar a leitura do painel corporativo a partir do Supabase.
4. Crie duas contas de apresentação no Supabase Auth e confirme os e-mails: `motorista@movecorp.test` com perfil `driver` e `funcionario@movecorp.test` com perfil `employee`. Para testar o painel corporativo, crie também `admin@movecorp.test` com perfil `admin`. Use senhas próprias do ambiente; não salve senhas no repositório.
5. Execute `docs/seed_mobility_tcc.sql`. O script altera apenas essas contas e os registros relacionados à empresa `Campus Comfy`. Ele deixa uma jornada em andamento para o dia atual em Brasília, inclusive em fins de semana.
6. Entre com motorista e passageiro em navegadores ou sessões separados. O mapa é a tela inicial dos dois perfis. No motorista, inicie a jornada pelo painel inferior e confirme chegada e embarque. Depois aguarde a atualização periódica do passageiro ou volte à tela.

No passageiro, o saldo fica no canto superior direito do mapa e abre Créditos. A navegação fica no rodapé do painel inferior nas posições padrão e expandida; ao recolher o painel, o rodapé se esconde. Em **Perfil → Minha rota fixa**, o passageiro escolhe ida/volta, dias presenciais e um dos trajetos disponíveis. Os trajetos de apresentação são salvos no navegador e atualizam o mapa do passageiro.

No motorista, o rodapé do painel abre Mapa, Passageiros, Histórico e Perfil. **Detalhes da jornada** abre a antiga visão operacional em `/driver/journey`. A lista de passageiros mostra a situação dos embarques; o histórico apresenta três jornadas; o perfil reúne rota, veículo, situação operacional, região e avisos. O início da jornada e a solicitação de região locais permanecem no armazenamento do navegador quando não há operação integrada.

## Estados para apresentação

Execute `docs/scenarios_mobility_tcc.sql` uma vez pelo SQL Editor. Depois escolha um estado com `select public.set_tcc_mobility_scenario('in_progress');`. Os valores aceitos são `planned`, `in_progress`, `at_stop`, `boarded`, `absent`, `delayed`, `completed` e `cancelled`. O cenário altera somente a rota e as contas de apresentação. Para voltar à jornada inicial, execute `docs/reset_mobility_tcc.sql`. Depois de `planned`, use a função com `in_progress` para recriar a jornada.

Em sábados e domingos, o SQL de apresentação prepara a jornada em andamento, mas a função B1 de iniciar uma jornada planejada pelo aplicativo continua limitada a dias úteis. Para apresentar o clique em **Iniciar jornada**, use uma data útil.

## Limites conhecidos

- A linha azul conecta coordenadas preparadas no banco; não segue automaticamente as ruas.
- A posição enviada ao passageiro muda na confirmação de paradas. O GPS do motorista, quando ativado, centraliza somente a tela dele.
- Os mapas usam imagens do OpenStreetMap e precisam de rede.
- O painel corporativo abre com dados locais de apresentação e atualiza automaticamente quando a função de consulta do Supabase está disponível. Distribuição de créditos e reotimização ainda são prévias sem gravação.
- O percurso local usa armazenamento do navegador; não sincroniza entre dispositivos nem substitui a integração com o Supabase.
- Os SQL não foram executados no projeto remoto por esta mudança. Teste o fluxo integrado após instalá-los em um Supabase de desenvolvimento.
