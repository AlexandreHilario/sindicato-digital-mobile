import axios from 'axios';

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
  const { accessToken } = useSessionStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
