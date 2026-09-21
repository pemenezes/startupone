# Pacote B2 — embarque persistente do motorista

## O que muda

- Ao iniciar uma jornada B1, o banco cria uma lista vinculada àquela execução com os passageiros previstos, respeitando dias da assinatura e exceções de cancelamento ou dia extra.
- O motorista confirma embarque ou ausência com confirmação na interface. As situações e seus horários persistem após recarregar a página.
- Uma correção entre embarcado e ausente cria um novo evento no histórico, sem apagar a decisão anterior.
- O passageiro pode consultar apenas a própria situação no cartão da viagem. O cartão se atualiza ao voltar à aba e periodicamente.
- A conclusão da jornada é recusada pelo banco enquanto existir passageiro aguardando.
- Cancelamentos do dia lançados depois do início atualizam quem ainda aguardava; uma presença já confirmada não é sobrescrita.

## Ativação

Execute primeiro `docs/driver_package_a.sql`, depois `docs/driver_package_b1.sql` e então `docs/driver_package_b2.sql` no **ambiente de desenvolvimento** do Supabase. O arquivo B2 contém uma transação e pode ser aplicado novamente sem duplicar passageiros nem eventos. Ele cria tabelas, índices, políticas RLS, funções, gatilhos e substitui `complete_driver_journey` para validar pendências.

O script não foi aplicado ao projeto remoto nesta entrega. A chave pública usada pelo aplicativo não tem autorização para criar essas estruturas. Não rode a migração na base em produção sem revisar o ambiente de destino e testar primeiro com contas de motorista e passageiro de desenvolvimento.

## Validação manual

1. Entre como motorista de teste com rota assumida e dois passageiros agendados. Inicie a jornada e confirme que a lista persiste depois de atualizar a página.
2. Confirme embarque de um passageiro e ausência de outro. Verifique os totais no início, no mapa e na lista.
3. Corrija uma ausência para embarque. Confira uma nova linha em `driver_passenger_attendance_events`, com `previous_status` e `new_status` corretos.
4. Entre como cada passageiro de teste. Confira somente a própria situação e atualize/retorne à aba para vê-la mudar.
5. Deixe um passageiro aguardando e tente finalizar. A função deve rejeitar; resolva a pendência e finalize.
6. Cancele uma viagem ainda aguardando após o início. O registro deve ficar `cancelled` e sair das paradas. Uma viagem já confirmada não deve mudar com cancelamento tardio.
7. Tente consultar ou registrar a presença de outra jornada com outra conta. RLS e função devem negar o acesso.

As posições e os nomes das paradas no mapa continuam ilustrativos até o B3, quando haverá pontos reais da rota. Os passageiros e seus estados já vêm do banco; sua distribuição visual entre os três pontos ilustrativos não representa endereços reais.
