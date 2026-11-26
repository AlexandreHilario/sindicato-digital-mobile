import { isAxiosError } from 'axios';

import { api } from './api';

export type Comunicado = {
  id: string | number;
  titulo: string;
  conteudo: string;
  autor_id: string | number;
  autor_nome: string;
  criado_em: string;
  atualizado_em: string;
};

export async function listarComunicados() {
  const { data } = await api.get<Comunicado[]>('/comunicados');
  return data;
}

export async function buscarComunicado(id: string) {
  const { data } = await api.get<Comunicado>(`/comunicados/${id}`);
  return data;
}

export function mensagemDeErro(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Não foi possível conectar ao servidor.';
  }
  return 'Ocorreu um erro inesperado.';
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}
