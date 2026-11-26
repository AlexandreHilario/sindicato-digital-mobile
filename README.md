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
2. Copie `.env.example` para `.env.local` e ajuste `EXPO_PUBLIC_API_URL` para o
   IP e a porta da máquina que executa o backend. Não use `localhost` ao testar
   pelo celular.
3. Inicie o Expo com `npm start` e leia o QR code pelo Expo Go.

## Base configurada

- Expo Router com rotas iniciais Início, Sobre e Equipe
- TanStack Query Provider
- Cliente Axios configurável pelo ambiente
- Zustand com estado inicial de sessão
- React Native Paper como UI Kit

Os integrantes e respectivos RAs devem ser adicionados ao README antes da
entrega do projeto.
