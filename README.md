# Sindicato Digital Mobile

Aplicativo mobile em React Native + Expo. O repositório contém apenas a
configuração inicial e telas de navegação demonstrativas; CRUD, autenticação e
integração real com o backend ainda não foram implementados.

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

3. Abra o app: o cartão **Conexão com a API**, na tela inicial, faz `GET /health`
   e mostra o endereço usado e o resultado. Use **Testar novamente** depois de
   corrigir a configuração.

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

- Expo Router com rotas iniciais Início, Sobre e Equipe
- TanStack Query Provider
- Cliente Axios configurável pelo ambiente, com timeout e erros padronizados
- Verificação de conexão com `GET /health` na tela inicial
- Zustand com estado inicial de sessão
- React Native Paper como UI Kit

Os integrantes e respectivos RAs devem ser adicionados ao README antes da
entrega do projeto.
