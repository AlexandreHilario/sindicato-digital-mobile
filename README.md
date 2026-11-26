# Sindicato Digital Mobile

Aplicativo mobile em React Native + Expo, integrado ao backend Express do
SíndicoDigital. Login, sessão e logout já funcionam; as telas de CRUD ainda
não foram implementadas.

O owner Expo está configurado como `anacsilvabrs-team`, seguindo os projetos
existentes em `PDmobile2026`. O `projectId` será criado ao vincular este app
como um projeto Expo separado.

## Requisitos

- Node.js e npm
- Expo Go instalado no celular
- Backend Express iniciado e acessível na mesma rede do celular para testar a API

## Executar

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env.local` e ajuste `EXPO_PUBLIC_API_URL`
   (veja [Configurar o endereço da API](#configurar-o-endereço-da-api)).
3. Inicie o Expo com `npm start` e leia o QR code pelo Expo Go.

## Configurar o endereço da API

O app lê o endereço do backend da variável `EXPO_PUBLIC_API_URL`, definida em
`.env.local` (arquivo ignorado pelo Git; cada pessoa tem o seu).

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

- **Sem `/api` no final.** O backend Express monta as rotas na raiz
  (`/health`, `/auth`, `/usuarios`, `/sindicos`, `/unidades`). Com `/api`, toda
  chamada retorna 404.
- **Não use `localhost`.** No celular, `localhost` é o próprio celular. Use o IP
  da máquina que executa o backend na rede Wi-Fi:
  - Windows: `ipconfig` → "Endereço IPv4" do adaptador Wi-Fi.
  - macOS: `ipconfig getifaddr en0`. Linux: `hostname -I`.
- **Mesma rede.** Celular e computador precisam estar no mesmo Wi-Fi. Se não
  conectar, libere a porta do backend (padrão 3000) no firewall do computador.
- **Reinicie o Expo após alterar o `.env.local`** (`npx expo start -c` limpa o
  cache), pois as variáveis `EXPO_PUBLIC_*` são embutidas no bundle.

### Validar a conexão

1. Inicie o backend (`npm run dev` no projeto da API).
2. No navegador **do celular**, abra `http://<IP>:3000/health`. A resposta deve ser:

   ```json
   { "status": "ok", "message": "SindicoDigital API está funcionando" }
   ```

3. Abra o app: o cartão **Conexão com a API**, nas telas de login e de perfil, faz
   `GET /health` e mostra o endereço usado e o resultado. Use **Testar
   novamente** depois de corrigir a configuração.

## Autenticação

| Ação | Endpoint | Onde |
| --- | --- | --- |
| Login | `POST /auth/login` (`email`, `senha`) → `token` e `usuario` | `app/login.tsx` |
| Restaurar sessão | `GET /auth/me` ao abrir o app | `app/_layout.tsx` |
| Logout | `POST /auth/logout` (revoga o token) | botão **Sair da conta** em `app/(app)/perfil.tsx` |

- **Token guardado com segurança** com `expo-secure-store` (Keystore no Android,
  Keychain no iOS), em `src/services/token-storage.ts`. No `npm run web`, que
  não tem SecureStore, usa `localStorage` apenas para testes.
- **Envio do token:** o interceptor do Axios (`src/services/api.ts`) adiciona
  `Authorization: Bearer <token>` em todas as requisições.
- **Sessão:** a store Zustand (`src/store/session-store.ts`) guarda o status, o
  token e o usuário. O `_layout.tsx` usa `Stack.Protected`: sem sessão, só a
  tela de login fica acessível. Com sessão, só as telas internas.
- **Token expirado ou revogado:** qualquer `401` em requisição autenticada
  encerra a sessão e volta ao login com o aviso "Sua sessão expirou".
- **Servidor inacessível ao abrir o app:** o token é mantido e aparecem as
  opções **Tentar novamente** e **Entrar com outra conta**.
- **Logout:** revoga o token no backend e apaga o token salvo, o usuário e o
  cache do TanStack Query (dados da conta). Se o backend não responder, a
  sessão local é limpa mesmo assim.

## Navegação e perfil

As telas internas ficam em `app/(app)/`, com abas inferiores. Só usuários
logados chegam a elas (`Stack.Protected` no `app/_layout.tsx`), e cada aba
específica de um tipo de conta usa `Tabs.Protected` em `app/(app)/_layout.tsx`.
Assim, a aba some do menu e também não abre pela URL.

| Tipo de conta | Abas | Endpoint |
| --- | --- | --- |
| `MORADOR` | Início, **Unidades**, Perfil | `GET /usuarios/me/unidades` |
| `SINDICO` | Início, **Condomínios**, Perfil | `GET /sindicos/me/condominios` |
| `ADMIN` | Início, Perfil | — |

- **Início** (`app/(app)/index.tsx`): saudação e menu do tipo de conta,
  definido em `src/navigation/menu.ts`.
- **Perfil** (`app/(app)/perfil.tsx`): nome, e-mail, tipo de conta e data de
  cadastro, sempre buscados com `GET /auth/me`. Também tem o botão **Sair da
  conta**.
- Listas e perfil têm "puxar para atualizar" e mostram os estados de
  carregando, erro (com **Tentar novamente**) e lista vazia
  (`src/components/query-state.tsx`).

Usuários de demonstração do backend (seed): `morador1@sindicodigital.test`,
`sindica@sindicodigital.test`, `admin@sindicodigital.test`, senha `Demo@123`.

## Tratamento de erros da API

O cliente Axios (`src/services/api.ts`) converte toda falha em um `ApiError`
(`src/services/api-error.ts`) com `kind`, `status` e uma mensagem padronizada.
Nas telas, use `getErrorMessage(error)` para exibir o erro ao usuário.

| Situação | `kind` | Mensagem exibida |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` vazio | `config` | Endereço da API não configurado... |
| Backend desligado, IP errado ou outra rede | `network` | Não foi possível conectar ao servidor... |
| Sem resposta em 10 s (5 s no `/health`) | `timeout` | O servidor demorou demais para responder... |
| 4xx com `message` no corpo | `http` | A mensagem enviada pelo backend |
| 4xx sem `message` (400, 401, 403, 404, 409) | `http` | Mensagem padrão do status |
| 5xx | `http` | Erro interno do servidor. Tente novamente mais tarde. |

## Base configurada

- Expo Router com abas por tipo de conta (Início, Unidades/Condomínios, Perfil)
  e as telas Sobre e Equipe
- TanStack Query Provider
- Cliente Axios configurável pelo ambiente, com timeout e erros padronizados
- Verificação de conexão com `GET /health` na tela inicial
- Login, restauração de sessão e logout integrados ao backend
- Zustand com o estado da sessão e token salvo no `expo-secure-store`
- React Native Paper como UI Kit

Os integrantes e respectivos RAs devem ser adicionados ao README antes da
entrega do projeto.
