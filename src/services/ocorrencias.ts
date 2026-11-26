import { isAxiosError } from 'axios';

import { api } from './api';

export type StatusOcorrencia = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export type Ocorrencia = {
  id: string | number;
  titulo: string;
  descricao: string;
  status: StatusOcorrencia;
  usuario_id: string | number;
  unidade_id: string | number;
  criado_em: string;
  atualizado_em: string;
};

export type OcorrenciaInput = {
  titulo: string;
  descricao: string;
};

export type AtualizarStatusInput = {
  status: StatusOcorrencia;
};

export async function listarOcorrencias() {
  const { data } = await api.get<Ocorrencia[]>('/ocorrencias');
  return data;
}

export async function buscarOcorrencia(id: string | number) {
  const { data } = await api.get<Ocorrencia>(`/ocorrencias/${id}`);
  return data;
}

export async function atualizarOcorrencia(
  id: string | number,
  input: OcorrenciaInput,
) {
  const { data } = await api.put<Ocorrencia>(`/ocorrencias/${id}`, input);
  return data;
}

export async function atualizarStatusOcorrencia(
  id: string | number,
  input: AtualizarStatusInput,
) {
  const { data } = await api.put<Ocorrencia>(`/ocorrencias/${id}`, input);
  return data;
}

export async function excluirOcorrencia(id: string | number) {
  await api.delete(`/ocorrencias/${id}`);
}

export function mensagemDeErroOcorrencia(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Não foi possível conectar ao servidor.';
  }

  return 'Ocorreu um erro inesperado.';
}

export function formatarStatusOcorrencia(status: StatusOcorrencia) {
  switch (status) {
    case 'ABERTA':
      return 'Aberta';
    case 'EM_ANDAMENTO':
      return 'Em andamento';
    case 'CONCLUIDA':
      return 'Concluída';
  }
}