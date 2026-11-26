import { useQuery } from '@tanstack/react-query';

import { useSessionStore } from '../store/session-store';
import { api } from './api';

export type Usuario = {
  id: string | number;
  nome: string;
  email: string;
  tipo: 'MORADOR' | 'SINDICO' | 'ADMIN';
  criado_em: string;
};

export async function buscarUsuarioLogado() {
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
