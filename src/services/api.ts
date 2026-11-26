import axios from 'axios';
import { API_ERROR_MESSAGES, ApiError, toApiError } from './api-error';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Quando true, um 401 desta requisição NÃO encerra a sessão
     * automaticamente (quem chamou trata o erro).
     */
    skipSessionExpiredHandler?: boolean;
  }
}

/**
 * Endereço base do backend, sem o sufixo /api: o Express monta as rotas na
 * raiz (ex.: http://192.168.0.10:3000/health). Barras finais são removidas
 * para evitar URLs como "http://host:3000//health".
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token atual em memória. Quem define é a sessão (src/store/session-store.ts);
// este módulo não importa a store para evitar dependência circular.
let authToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Função chamada quando uma requisição autenticada recebe 401. */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

api.interceptors.request.use((config) => {
  if (!API_URL) {
    throw new ApiError('config', API_ERROR_MESSAGES.config);
  }
  // Envia o token em toda requisição, exceto se ela já definiu o próprio.
  if (authToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Todo erro que sai do cliente já vem como ApiError com mensagem padronizada.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const config = axios.isAxiosError(error) ? error.config : undefined;

    // Token expirado, revogado ou inválido: encerra a sessão local.
    if (
      apiError.status === 401 &&
      config?.headers?.Authorization &&
      !config.skipSessionExpiredHandler
    ) {
      onSessionExpired?.();
    }

    return Promise.reject(apiError);
  },
);

export type HealthResponse = {
  status: 'ok';
  message: string;
};

/** GET /health — confirma que o app consegue alcançar o backend. */
export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health', { timeout: 5000 });
  return data;
}
