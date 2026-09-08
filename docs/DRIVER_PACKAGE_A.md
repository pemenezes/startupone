# Pacote A — área do motorista

## Código

- Perfil consulta a conta autenticada e o cadastro em drivers, sem identidade ou aprovação fictícias.
- Jornada e passageiros compartilham DriverProvider, com consultas canceladas logicamente quando ficam obsoletas.
- Calendário usa America/Sao_Paulo, inclusive nas inscrições compartilhadas com o funcionário, para manter os dois lados no mesmo dia.
- Atribuições futuras e fins de semana não exibem operação do dia.
- Passageiros previstos têm busca por nome, ordenação alfabética e atualização manual.
- Mapa, histórico, documentação, notificações e solicitação de região informam indisponibilidade, sem simular registros.
- Logout é compartilhado entre perfil e cabeçalho. Erros de perfil permitem tentar novamente ou sair.

## Ativação necessária no Supabase

Aplicar docs/driver_package_a.sql depois de docs/recurring_routes_v1.sql, antes de publicar o frontend.
O SQL não foi aplicado automaticamente ao projeto remoto.

A função claim_driver_route obtém o motorista da sessão, verifica cadastro e disponibilidade,
serializa trocas simultâneas do mesmo motorista e troca a atribuição na mesma transação.
O índice exclusivo por rota existente no V1 permanece como proteção adicional.
Tentativas repetidas de assumir a própria rota preservam a data de início.
Gravações diretas dos clientes em driver_route_assignments são revogadas; consultas continuam disponíveis.
Não reexecutar o SQL V1 depois deste sem revisar suas políticas.

Sem a função, o aplicativo informa que a troca ainda não está disponível. Não existe fallback
para a sequência antiga de desativar/inserir, que poderia deixar o motorista sem rota.
Em falhas de rede, o resultado pode ser incerto: a interface orienta conferir a jornada.

Este pacote não corrige as políticas gerais de alteração de profiles.role, créditos ou cadastro
de administradores identificadas na análise. Elas continuam uma pendência separada.

## Verificação

- Calendário e vigência: node --test tests/driver-schedule.test.mjs
- Lint da área: node node_modules/eslint/bin/eslint.js src/pages/driver src/lib/assignments.js src/lib/routes.js src/lib/schedule.js src/lib/driverSchedule.js src/components/ProtectedRoute.jsx src/AuthContext.jsx
- Build: npm run build -- --emptyOutDir false

Verificações executadas neste pacote: cinco testes de calendário/vigência, lint dos arquivos
alterados, build e teste de navegação em Edge headless com respostas de API simuladas.
O teste de interface cobriu identidade, busca sem acentos, telas indisponíveis, falha de RPC,
erro da jornada com nova tentativa, logout/retorno e perfil ausente, em largura de 390 pixels.
As respostas simuladas não validam o banco remoto nem a transação SQL. A validação com
duas contas reais abaixo continua necessária após a instalação da função.
O lint global mantém seis erros preexistentes em AppContext e na área do funcionário.

Após aplicar o SQL em ambiente de teste, validar com duas contas de motorista:
1. Assumir rota livre e verificar a jornada.
2. Tentar uma rota ocupada: a atribuição anterior deve permanecer.
3. Repetir uma solicitação já concluída: manter apenas a atribuição existente e sua data.
4. Enviar solicitações concorrentes para a mesma rota: apenas um motorista deve obtê-la.
5. Enviar duas trocas simultâneas da mesma conta: apenas uma rota deve permanecer ativa.
6. Verificar rejeição para funcionário, usuário sem sessão, rota inativa e cadastro incompleto.
7. Forçar falha de conexão e conferir a atribuição antes de repetir.

Ainda não há execução de viagem, presença, GPS ou histórico persistido. Esses recursos pertencem aos próximos pacotes.
