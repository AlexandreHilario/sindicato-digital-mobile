import axios from 'axios';
import { API_ERROR_MESSAGES, ApiError, toApiError } from './api-error';

import { useSessionStore } from '../store/session-store';

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

api.interceptors.request.use((config) => {
  if (!API_URL) {
    throw new ApiError('config', API_ERROR_MESSAGES.config);
  }
  const { accessToken } = useSessionStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Todo erro que sai do cliente já vem como ApiError com mensagem padronizada.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);
