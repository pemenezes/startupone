# Exemplo interativo para apresentar a Comfy

O exemplo está dentro do app normal. Na página inicial do motorista, abra **Explorar exemplo**. A jornada ilustrativa tem quatro paradas e quatro passageiros. Não depende de uma rota real atribuída nem das migrações B1/B2 para funcionar.

## Roteiro sugerido

1. Clique em **Iniciar jornada de exemplo** e mostre o mapa e a primeira parada.
2. Clique em **Finalizar jornada** antes de registrar todos os passageiros para mostrar o bloqueio.
3. Confirme a chegada à primeira parada; registre o embarque de Ana Silva e a ausência de Bruno Costa.
4. Abra **Ver visão do passageiro**. O cartão de Ana mostrará o embarque confirmado.
5. Volte, corrija o registro de Ana e mostre a nova situação e o histórico da correção. A visão do passageiro acompanha a mudança.
6. Resolva os passageiros das outras paradas, confirme a chegada ao destino e finalize.
7. Use **Reiniciar exemplo** para repetir a apresentação.

Um funcionário autenticado também encontra um cartão de exemplo na página inicial, com acesso à mesma visão de Ana. O estado é salvo em `localStorage` e compartilhado apenas entre abas do **mesmo navegador e origem**. Ações de exemplo não alteram o Supabase, não aparecem em outro dispositivo e não representam rastreamento GPS em tempo real. Os mapas usam imagens do OpenStreetMap, que precisam de conexão para carregar.
