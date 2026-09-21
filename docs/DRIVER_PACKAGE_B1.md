# Pacote B1 — jornada persistente do motorista

## Resultado

- A rota prevista passa a ter uma execução diária própria em `driver_journeys`.
- O motorista inicia, retoma e finaliza a jornada sem perder o estado após atualizar a página.
- Início, conclusão, rota, atribuição, sentido e dados básicos do veículo ficam registrados.
- A interface diferencia jornada prevista, em andamento, concluída e cancelada.
- Repetir início ou conclusão não cria duplicidade.
- Uma rota não pode ser trocada enquanto existir jornada em andamento.

## Ativação no Supabase

Aplicar `docs/driver_package_b1.sql` depois de `docs/driver_package_a.sql` no ambiente de desenvolvimento.
Não aplicar diretamente na produção sem validar primeiro com uma conta de motorista de teste.

As gravações diretas na tabela ficam bloqueadas. As funções `start_driver_journey` e
`complete_driver_journey` obtêm o motorista pela sessão, validam a atribuição ativa e
serializam as transições. A aplicação usa somente leitura direta com RLS e essas funções.

## Limite do B1 e preparação para o B2

O B1 não grava chegada, embarque ou ausência. Essas ações continuam locais na tela de mapa.
O B2 poderá criar tabelas filhas ligadas a `driver_journeys.id`, sem alterar a identidade
ou o ciclo de vida da jornada implementado aqui.

## Validação após instalar o SQL

1. Entrar com um motorista que possua rota ativa para o dia.
2. Iniciar a jornada e conferir o horário registrado.
3. Atualizar e fechar a página; a ação deve mudar para “Retomar jornada”.
4. Repetir a chamada de início; não deve existir uma segunda linha.
5. Finalizar e atualizar; a jornada deve permanecer concluída.
6. Repetir a conclusão; o horário original deve ser preservado.
7. Confirmar rejeição para outro motorista, funcionário, fim de semana e rota não atribuída.
