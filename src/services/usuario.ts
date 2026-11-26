
import { useQuery } from '@tanstack/react-query';

import { useSessionStore } from '../store/session-store';
import { api } from './api';
import type { TipoUsuario, Usuario } from './auth';

export type { TipoUsuario, Usuario } from './auth';

export type CriarUsuarioDTO = {
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  unidadeId?: string;
};

export type AtualizarUsuarioDTO = {
  nome?: string;
  email?: string;
  senha?: string;
};

/** GET /usuarios — lista usuários (SINDICO e ADMIN). */
export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/usuarios');
  return data;
}

/** GET /usuarios/:id — consulta um usuário. */
export async function buscarUsuario(id: string | number): Promise<Usuario> {
  const { data } = await api.get<Usuario>(`/usuarios/${id}`);
  return data;
}

/** POST /usuarios — cria um usuário. */
export async function criarUsuario(
  usuario: CriarUsuarioDTO,
): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/usuarios', usuario);
  return data;
}

/** PUT /usuarios/:id — atualiza somente os campos enviados. */
export async function atualizarUsuario(
  id: string | number,
  usuario: AtualizarUsuarioDTO,
): Promise<Usuario> {
  const { data } = await api.put<Usuario>(`/usuarios/${id}`, usuario);
  return data;
}

/** DELETE /usuarios/:id — exclui um usuário. */
export async function excluirUsuario(id: string | number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}

export async function buscarUsuarioLogado(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}

export function useUsuarioLogado() {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['usuario', accessToken],
    queryFn: buscarUsuarioLogado,
    enabled: Boolean(accessToken),
  });
}

export function podeGerenciar(usuario?: Usuario) {
  return usuario?.tipo === 'SINDICO' || usuario?.tipo === 'ADMIN';
}
