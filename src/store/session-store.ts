import { create } from 'zustand';
import { setAuthToken, setSessionExpiredHandler } from '../services/api';
import { getErrorMessage, toApiError } from '../services/api-error';
import * as authService from '../services/auth';
import type { Usuario } from '../services/auth';
import { queryClient } from '../services/query-client';
import { deleteToken, getStoredToken, saveToken } from '../services/token-storage';

/**
 * - restoring: lendo o token salvo e validando com GET /auth/me.
 * - restoreError: há token salvo, mas o servidor não respondeu (sem rede).
 * - authenticated / unauthenticated: estados finais.
 */
export type SessionStatus = 'restoring' | 'restoreError' | 'authenticated' | 'unauthenticated';

export const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Faça login novamente.';

type SessionState = {
  status: SessionStatus;
  accessToken: string | null;
  usuario: Usuario | null;
  /** Aviso exibido na tela de login (ex.: sessão expirada). */
  notice: string | null;
  /** Erro da restauração da sessão (ex.: servidor inacessível). */
  restoreError: string | null;

  restoreSession: () => Promise<void>;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  expireSession: () => Promise<void>;
  clearNotice: () => void;
  /** Atualiza os dados do usuário (ex.: após GET /auth/me no perfil). */
  setUsuario: (usuario: Usuario) => void;
};

/** Apaga token, usuário e todos os dados da conta em cache. */
async function clearLocalSession() {
  setAuthToken(null);
  queryClient.clear();
  await deleteToken();
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'restoring',
  accessToken: null,
  usuario: null,
  notice: null,
  restoreError: null,

  restoreSession: async () => {
    set({ status: 'restoring', restoreError: null });

    const token = await getStoredToken();
    if (!token) {
      set({ status: 'unauthenticated' });
      return;
    }

    try {
      const usuario = await authService.getMe(token);
      setAuthToken(token);
      set({ status: 'authenticated', accessToken: token, usuario });
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.status === 401) {
        // Token expirado ou revogado: volta para o login.
        await clearLocalSession();
        set({ status: 'unauthenticated', notice: SESSION_EXPIRED_MESSAGE });
      } else {
        // Servidor fora do ar / sem rede: mantém o token para tentar de novo.
        set({ status: 'restoreError', restoreError: apiError.message });
      }
    }
  },

  signIn: async (email, senha) => {
    const { token, usuario } = await authService.login(email, senha);
    await saveToken(token);
    setAuthToken(token);
    set({ status: 'authenticated', accessToken: token, usuario, notice: null });
  },

  signOut: async () => {
    const token = get().accessToken;
    if (token) {
      try {
        await authService.logout(token);
      } catch (error) {
        // Mesmo sem conseguir revogar no servidor, o usuário sai do app.
        console.warn('Falha ao revogar o token no logout:', getErrorMessage(error));
      }
    }
    await clearLocalSession();
    set({ status: 'unauthenticated', accessToken: null, usuario: null, notice: null });
  },

  expireSession: async () => {
    // Várias requisições podem receber 401 ao mesmo tempo: só a primeira age.
    if (get().status !== 'authenticated') return;
    set({
      status: 'unauthenticated',
      accessToken: null,
      usuario: null,
      notice: SESSION_EXPIRED_MESSAGE,
    });
    await clearLocalSession();
  },

  clearNotice: () => set({ notice: null }),

  setUsuario: (usuario) => {
    if (get().status === 'authenticated') set({ usuario });
  },
}));

// Qualquer 401 em requisição autenticada encerra a sessão e volta ao login.
setSessionExpiredHandler(() => {
  void useSessionStore.getState().expireSession();
});
