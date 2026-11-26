import { isAxiosError } from 'axios';

/**
 * Tipos de falha que o app sabe tratar:
 * - config: EXPO_PUBLIC_API_URL não foi definido.
 * - network: a requisição não chegou ao servidor (backend desligado, IP errado,
 *   celular em outra rede, firewall).
 * - timeout: o servidor não respondeu dentro do tempo limite.
 * - http: o servidor respondeu com status de erro (4xx/5xx).
 * - unknown: qualquer outra falha inesperada.
 */
export type ApiErrorKind = 'config' | 'network' | 'timeout' | 'http' | 'unknown';

export const API_ERROR_MESSAGES = {
  config:
    'Endereço da API não configurado. Defina EXPO_PUBLIC_API_URL no arquivo .env.local.',
  network:
    'Não foi possível conectar ao servidor. Verifique se o backend está em execução e se o celular está na mesma rede.',
  timeout:
    'O servidor demorou demais para responder. Verifique sua conexão e tente novamente.',
  badRequest: 'Dados inválidos. Revise as informações e tente novamente.',
  unauthorized: 'Sessão expirada. Faça login novamente.',
  forbidden: 'Você não tem permissão para acessar este recurso.',
  notFound: 'Recurso não encontrado.',
  conflict: 'Este registro já existe ou está em conflito com outro.',
  server: 'Erro interno do servidor. Tente novamente mais tarde.',
  unknown: 'Ocorreu um erro inesperado. Tente novamente.',
} as const;

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** Formato de erro devolvido pelo error.middleware do backend. */
type BackendErrorBody = {
  status?: string;
  message?: unknown;
};

function messageForStatus(status: number): string {
  if (status >= 500) return API_ERROR_MESSAGES.server;
  switch (status) {
    case 400:
    case 422:
      return API_ERROR_MESSAGES.badRequest;
    case 401:
      return API_ERROR_MESSAGES.unauthorized;
    case 403:
      return API_ERROR_MESSAGES.forbidden;
    case 404:
      return API_ERROR_MESSAGES.notFound;
    case 409:
      return API_ERROR_MESSAGES.conflict;
    default:
      return API_ERROR_MESSAGES.unknown;
  }
}

/** Converte qualquer erro (Axios ou não) em um ApiError com mensagem padronizada. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (!isAxiosError(error)) {
    return new ApiError('unknown', API_ERROR_MESSAGES.unknown);
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError('timeout', API_ERROR_MESSAGES.timeout);
  }

  if (!error.response) {
    return new ApiError('network', API_ERROR_MESSAGES.network);
  }

  const { status, data } = error.response;

  // Para 4xx o backend envia mensagens pensadas para o usuário
  // (ex.: "Faça login para acessar este recurso."). Para 5xx usamos sempre
  // a mensagem genérica, sem expor detalhes internos.
  const body = data as BackendErrorBody | undefined;
  const backendMessage =
    status < 500 && typeof body?.message === 'string' && body.message.trim()
      ? body.message
      : null;

  return new ApiError('http', backendMessage ?? messageForStatus(status), status);
}

/** Atalho para exibir a mensagem de qualquer erro na interface. */
export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
