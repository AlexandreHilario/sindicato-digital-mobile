import { api } from './api';

export type TipoUsuario = 'MORADOR' | 'SINDICO' | 'ADMIN';

/** Dados públicos do usuário devolvidos pelo backend (sem senha). */
export type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  criado_em: string;
};

export type LoginResponse = {
  token: string;
  usuario: Usuario;
};

/** POST /auth/login — 401 "E-mail ou senha inválidos." em caso de falha. */
export async function login(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    email: email.trim(),
    senha,
  });
  return data;
}

/** POST /auth/signup — cria um MORADOR (201, sem token). */
export async function signup(nome: string, email: string, senha: string): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/signup', {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    senha,
  });
  return data;
}

/** GET /auth/me — devolve o usuário dono do token. */
export async function getMe(token: string): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    // Na restauração da sessão, quem trata o 401 é a própria store.
    skipSessionExpiredHandler: true,
  });
  return data;
}

/**
 * GET /auth/me com o token da sessão atual (enviado pelo interceptor).
 * Diferente de getMe, um 401 aqui encerra a sessão e volta ao login.
 */
export async function fetchCurrentUser(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}

/** POST /auth/logout — revoga o token no servidor (responde 204). */
export async function logout(token: string): Promise<void> {
  // Sem corpo: enviar `null` como JSON faz o express.json() responder 400.
  await api.post('/auth/logout', undefined, {
    headers: { Authorization: `Bearer ${token}` },
    skipSessionExpiredHandler: true,
  });
}
