# Painel administrativo — cenário integrado de exemplo

O painel normal contém um cenário ilustrativo único para Visão Geral, Rotas, Funcionários e Créditos. Os registros ficam em `src/data/adminDemo.js`; nenhuma ação grava no Supabase.

## O que pode ser apresentado

1. Na **Visão Geral**, conferir a empresa e o plano de exemplo, contagem de funcionários, ocupação calculada, situações das rotas e ocorrências. Selecionar rotas críticas para comparar uma prévia de reotimização ou unificação. As prévias não mudam a operação.
2. Em **Rotas Operacionais**, filtrar por região, status, ID, motorista ou placa. Selecionar uma rota na lista ou no mapa para ver veículo, embarques, progresso, próxima parada, passageiros e ocupação ilustrativa nos últimos 30 dias. O link “Ver detalhes” da Visão Geral abre a rota correspondente.
3. Em **Funcionários**, filtrar os 12 colaboradores do mesmo cenário, selecionar linhas, abrir um perfil resumido e exportar a lista filtrada em CSV.
4. Em **Créditos Corporativos**, consultar o plano, o valor ilustrativo do contrato, os saldos do cenário e as movimentações. Filtrar e exportar o extrato; informar um valor para ver a quantidade de colaboradores afetados e o total antes de qualquer distribuição. A prévia não movimenta saldo.
5. No **Simulador**, variar a quantidade de colaboradores e o VT médio. Veículos e ocupação teórica são calculados; o custo Comfy não é estimado até a definição da fórmula contratual.

## Limites e próxima integração

Os horários, trajetos, posições, ETA, progresso e histórico de ocupação são ilustrativos; o mapa não recebe GPS do motorista. O plano Business e o contrato exibidos são dados de exemplo, não uma proposta comercial. Para integrar o painel ao Supabase, primeiro vincular o administrador à sua empresa, aplicar leitura restrita por empresa e criar operações auditáveis para cadastro, troca de rota e créditos. A regra dos 80% e os preços dos planos ainda precisam de definição comercial antes de calcular consumo do contrato ou economia.
