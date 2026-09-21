# Comfy

Aplicação web de mobilidade corporativa desenvolvida como protótipo de TCC. A Comfy reúne, em uma interface responsiva, o acompanhamento do fretado pelo **funcionário**, a operação diária do **motorista** e a visão da **empresa**. O fluxo principal coloca o mapa em destaque e usa um painel inferior expansível para as ações de cada perfil.

O projeto combina uma apresentação interativa com dados locais e funcionalidades integradas ao Supabase. O acesso rápido permite percorrer os três perfis sem criar contas ou configurar o banco; o acesso com conta continua disponível para testar autenticação e dados persistidos. As ações demonstrativas não substituem autenticação, regras de acesso ou operações reais de transporte.

## Começar

**Pré-requisitos:** Node.js e npm compatíveis com as versões do Vite e das dependências declaradas em [`package.json`](package.json). Um navegador moderno e acesso à internet são necessários para carregar os mapas. O Supabase é necessário para testar o login real e as funções persistidas, mas não para percorrer o acesso rápido.

```bash
npm ci
```

Copie [`.env.example`](.env.example) para `.env` e preencha a URL e a chave **pública** do seu projeto Supabase, se quiser testar o acesso com conta:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

O código também aceita `VITE_SUPABASE_ANON_KEY` no lugar de `VITE_SUPABASE_PUBLISHABLE_KEY`, conforme o modelo atual de `.env.example`. Variáveis `VITE_` são incluídas no bundle do navegador: **nunca coloque `service_role`, senha ou chave secreta nelas**. O arquivo `.env` é ignorado pelo Git. Reinicie o servidor após mudar as variáveis.

```bash
npm run dev
```

Abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`). Na tela inicial, escolha funcionário, motorista ou administrador e clique em **Entrar**. Para uma conta Supabase, use **Entrar com minha conta** na tela do perfil escolhido.

### Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor local com atualização automática. |
| `npm run build` | Gera o bundle de produção em `dist/`. |
| `npm run preview` | Serve localmente o bundle gerado. |
| `npm run lint` | Executa ESLint no repositório. |
| `node --test tests/*.test.mjs` | Executa os testes automatizados de estado, rotas e apresentação. |

## Perfis e funcionalidades

| Perfil | O que pode ser apresentado |
| --- | --- |
| **Funcionário** | Mapa da viagem e posição ilustrativa da van, próximas paradas e situação do embarque; saldo e créditos; rota fixa de ida/volta e dias presenciais; notificações; perfil, suporte e configurações. No acesso real, há inscrição em rotas, cancelamento do dia, avaliação do motorista e operações de crédito conforme a estrutura instalada no Supabase. |
| **Motorista** | Mapa da jornada, uma parada por vez, link para navegação externa, confirmação de chegada e de embarque/ausência com diálogo de confirmação; lista e busca de passageiros; resumo da jornada; três registros visuais de histórico; perfil, veículo, documentação, situação operacional, solicitação de região e preferências de aviso. O fluxo integrado pode iniciar/retomar/concluir jornadas e persistir presença com os pacotes SQL correspondentes. |
| **Administrador** | Visão geral da operação; rotas no mapa com filtros, progresso e passageiros; funcionários; créditos e extrato; simulador. O painel usa um cenário local coerente entre telas e pode ler uma visão operacional do Supabase quando a função correspondente está disponível. Prévia de otimização e distribuição de créditos não fazem alterações no banco. |

O mapa do funcionário e o do motorista usam o mesmo padrão visual: área principal com mapa e painel inferior que pode subir para mostrar detalhes ou descer para ampliar a visualização. No celular, o link **Navegar** entrega o destino ao sistema para abrir um aplicativo de mapas compatível; a escolha do aplicativo ocorre fora da Comfy.

### Tecnologias e identidade visual

O frontend usa React 19, Vite 8, React Router 7, Leaflet/React Leaflet com MapLibre para mapas vetoriais, Lucide para ícones e CSS com variáveis de tema. O cliente de dados e autenticação é `@supabase/supabase-js`. A cor principal é **#004aad**, acompanhada de azul profundo **#002f6c**, azul de apoio **#a8c6eb**, destaque **#dff373** e superfícies claras. Os tokens estão em [`src/index.css`](src/index.css); as telas de mapa usam [`src/mobility.css`](src/mobility.css), e cada área possui estilos próprios. A pilha tipográfica prefere PP Neue Montreal quando disponível e recorre a fontes de sistema; o repositório não inclui arquivos dessa fonte. A logo horizontal e o símbolo da van estão em [`public/brand/`](public/brand/) e são usados pelo componente [`ComfyBrand`](src/components/ComfyBrand.jsx); o símbolo também é o favicon e o marcador de localização da van.

## Acesso rápido e dados de apresentação

O botão **Entrar** cria uma identidade local para o perfil escolhido, sem usar senhas de teste nem autenticar no Supabase. Essa escolha permanece na aba por `sessionStorage`; **Sair** volta à seleção de perfis. O botão **Reiniciar apresentação** restaura o percurso e as preferências locais de apresentação conhecidas pelo aplicativo.

O percurso **Centro → Campus Comfy** e seus passageiros são compartilhados entre as visões de funcionário, motorista e administrador. Chegadas e decisões de embarque são guardadas no `localStorage` da mesma origem: outra aba do **mesmo navegador e endereço** pode refletir as mudanças. Isso não sincroniza aparelhos diferentes. As opções de rota do funcionário, avisos lidos e algumas configurações também usam armazenamento local. Sete percursos de apresentação têm geometrias viárias pré-calculadas em [`src/data/presentationRouteGeometry.json`](src/data/presentationRouteGeometry.json), obtidas do OSRM sobre dados do OpenStreetMap; não há consulta de roteamento durante o uso. Uma rota sem geometria cadastrada exibe suas paradas sem inventar um trajeto. Os mapas usam um estilo local de ruas sem a camada de prédios, baseado no Positron do OpenFreeMap, e carregam blocos vetoriais externos; se eles não carregarem, o app recorre aos blocos padrão do OpenStreetMap. É necessário acesso à internet mesmo no acesso rápido.

O acesso rápido serve para apresentar a interface e os fluxos. Ele **não é uma barreira de segurança**: a identidade local não concede acesso legítimo a dados do Supabase, e as telas nesse modo evitam as operações remotas previstas para contas reais. Antes de usar este ramo em um ambiente com dados reais, remova ou restrinja o acesso rápido e valide as políticas RLS e permissões do backend.

## Autenticação e Supabase

Em **Entrar com minha conta**, o aplicativo usa `supabase.auth.signInWithPassword`. O [`AuthProvider`](src/AuthContext.jsx) carrega a linha correspondente em `profiles`, verifica `profiles.role` e disponibiliza sessão e perfil à aplicação. O caminho `/login/company` corresponde ao papel `admin`. [`ProtectedRoute`](src/components/ProtectedRoute.jsx) impede a navegação entre áreas de perfis diferentes; o banco deve aplicar suas próprias políticas RLS, independentemente da interface.

Funcionários e motoristas podem se cadastrar. O `signUp` envia nome e papel nos metadados; o gatilho de [`handle_new_user_trigger.sql`](docs/handle_new_user_trigger.sql) cria o perfil. Quando a confirmação de e-mail está ativa no Supabase, o usuário precisa confirmar o endereço antes de entrar. Administradores são criados separadamente. A recuperação de senha usa `/reset-password` como URL de retorno.

Para configurar e validar esse fluxo, leia [`docs/SUPABASE_AUTH.md`](docs/SUPABASE_AUTH.md). Configure a URL do site e os redirecionamentos de desenvolvimento e produção em **Authentication → URL Configuration** do projeto Supabase. Use um projeto de desenvolvimento separado para experimentar migrações e dados de teste; o frontend não executa scripts SQL automaticamente.

### Migrações e dados integrados

Os arquivos em `docs/` são scripts SQL e notas de implementação, **não um sistema automático de migrações**. Em um projeto Supabase de desenvolvimento, confira as dependências e aplique apenas os scripts necessários, nesta ordem geral:

1. Estrutura inicial de `profiles` e autenticação descrita em [`SUPABASE_AUTH.md`](docs/SUPABASE_AUTH.md), seguida de [`handle_new_user_trigger.sql`](docs/handle_new_user_trigger.sql).
2. [`drivers_and_reviews.sql`](docs/drivers_and_reviews.sql) e [`employee_onboarding_and_trips.sql`](docs/employee_onboarding_and_trips.sql): motoristas, avaliações, empresas, rotas e cadastro do funcionário.
3. [`recurring_routes_v1.sql`](docs/recurring_routes_v1.sql): regiões, atribuições do motorista, inscrições por dia da semana e exceções do dia.
4. [`driver_package_a.sql`](docs/driver_package_a.sql), [`driver_package_b1.sql`](docs/driver_package_b1.sql) e [`driver_package_b2.sql`](docs/driver_package_b2.sql), **nessa sequência**: atribuição segura, execução da jornada e presença persistida. Consulte os guias [A](docs/DRIVER_PACKAGE_A.md), [B1](docs/DRIVER_PACKAGE_B1.md) e [B2](docs/DRIVER_PACKAGE_B2.md).
5. [`mobility_map_first.sql`](docs/mobility_map_first.sql): paradas, chegadas, posição e avisos relacionados à mobilidade; depois [`company_operations_tcc.sql`](docs/company_operations_tcc.sql), se desejar a leitura integrada do painel.
6. Conforme o recurso desejado, [`employee_credits.sql`](docs/employee_credits.sql), [`employee_notification_prefs.sql`](docs/employee_notification_prefs.sql) e [`employee_profile_fields.sql`](docs/employee_profile_fields.sql).

Os scripts `seed_*`, `scenarios_*` e `reset_*` alteram dados para ensaios; leia seu conteúdo e confirme o projeto de destino antes de executá-los. Em especial, não aplique usuários e senhas de teste a uma base de produção. O roteiro mais recente do mapa e dos cenários está em [`MOBILITY_MAP_FIRST.md`](docs/MOBILITY_MAP_FIRST.md).

## Organização do código

```text
src/
├── App.jsx, main.jsx             # roteador e composição dos providers
├── AuthContext.jsx               # sessão Supabase e acesso local
├── AppContext.jsx                # estado de funcionário/motorista e carteira
├── TripContext.jsx               # inscrições e viagens do funcionário
├── components/                   # navegação, mapa compartilhado, painel inferior, avisos
├── data/                         # cenário e dados visuais do painel
├── lib/                          # clientes, regras de jornada, API, preferências e estado local
└── pages/
    ├── employee/                 # área do funcionário
    ├── driver/                   # área do motorista e DriverProvider
    └── company/                  # painel administrativo e CompanyProvider
docs/                            # SQL e documentação por etapa
tests/                           # testes Node para as regras sem interface
public/                          # ícones estáticos
```

[`src/main.jsx`](src/main.jsx) envolve a aplicação em `AuthProvider` e `AppProvider`. [`src/App.jsx`](src/App.jsx) define as rotas; cada área tem seu layout e estado próprio. `DriverProvider` reúne atribuição, jornada, passageiros, chegadas e ações da operação real; no acesso rápido usa recursos locais. `TripProvider` fornece a viagem do funcionário. `CompanyProvider` combina os dados locais do painel com a jornada compartilhada e, quando disponível, com a consulta remota.

| Caminho | Tela |
| --- | --- |
| `/login`, `/login/:role` | Seleção e entrada como `employee`, `driver` ou `company`. |
| `/register`, `/register/:role` | Cadastro de funcionário ou motorista. |
| `/forgot-password/:role`, `/reset-password` | Recuperação de senha. |
| `/employee` | Mapa principal do funcionário; `/employee/profile`, `/employee/route-settings` e `/employee/credits` abrem suas áreas principais. |
| `/driver` | Mapa principal do motorista; `/driver/journey`, `/driver/passengers`, `/driver/history` e `/driver/profile` completam a navegação. |
| `/company` | Painel; `/company/routes`, `/company/employees`, `/company/credits` e `/company/simulator` abrem as demais seções. |

As rotas internas de funcionário e motorista incluem páginas auxiliares de configuração, suporte, notificações e operação. `/driver/map` redireciona para `/driver` e `/employee/track` para `/employee`.

## Estado atual e limites

- O histórico do motorista mostra **três viagens definidas no frontend**; não é uma consulta histórica ao banco.
- A documentação e a situação operacional do motorista são conteúdo visual; a solicitação de região e suas preferências ficam no navegador.
- A rota desenhada no mapa liga pontos cadastrados/ilustrativos; não calcula um trajeto viário nem garante ETA ou GPS compartilhado em tempo real. O GPS do aparelho exige permissão e contexto seguro (HTTPS ou localhost).
- O painel administrativo pode ler dados via função `company_operations`, mas suas simulações, prévias de otimização e operações de crédito não persistem alterações.
- Nem toda tela secundária tem um fluxo local completo fora de sua navegação principal; integração end-to-end, autorização e regras operacionais exigem validação com contas reais e as migrações instaladas.

O propósito é demonstrar um produto navegável para o TCC e manter uma base para evolução; não se deve tratar estimativas, registros visuais ou ações locais como dados de uma operação de transporte em produção.

## Testes e publicação

Execute `node --test tests/*.test.mjs`, `npm run lint` e `npm run build` antes de publicar mudanças. Os testes automatizados verificam principalmente regras de estado e cenários locais; não substituem testes de navegador, aparelhos móveis nem validação do SQL/RLS no Supabase. Caso o lint global aponte regras em arquivos legados, confira os resultados antes de atribuí-los à alteração atual.

O arquivo [`vercel.json`](vercel.json) redireciona caminhos para `index.html`, permitindo abrir URLs internas diretamente em uma publicação Vercel. Configure as variáveis públicas no ambiente de deploy e os redirecionamentos de autenticação no Supabase. Não publique o modo de acesso rápido como mecanismo de login de uma aplicação com dados privados.
