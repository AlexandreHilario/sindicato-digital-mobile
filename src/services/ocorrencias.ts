import { isAxiosError } from 'axios';

import { api } from './api';

export type StatusOcorrencia = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export type Ocorrencia = {
  id: string | number;
  categoria_id?: string | number;
  categoria_nome?: string;
  titulo: string;
  descricao: string;
  status: StatusOcorrencia;
  usuario_id: string | number;
  unidade_id: string | number;
  bloco?: string | null;
  unidade_numero?: string | number | null;
  criado_em: string;
  atualizado_em: string;
};

export type OcorrenciaInput = {
  titulo: string;
  descricao: string;
};

export type RegistrarOcorrenciaInput = OcorrenciaInput & {
  unidade_id: string | number;
  categoria_id: string | number;
};

export type ListaOcorrenciasResponse = {
  total: number;
  ocorrencias: Ocorrencia[];
};

type RegistrarOcorrenciaResponse = {
  message: string;
  ocorrencia: Ocorrencia;
};

type AtualizarOcorrenciaResponse = {
  message: string;
  ocorrencia: Ocorrencia;
};

export type AtualizarStatusInput = {
  status: StatusOcorrencia;
};

export async function listarOcorrencias() {
  const { data } = await api.get<ListaOcorrenciasResponse>('/ocorrencias');
  return data;
}

export async function registrarOcorrencia(input: RegistrarOcorrenciaInput) {
  const { data } = await api.post<RegistrarOcorrenciaResponse>(
    '/ocorrencias',
    input,
  );
  return data.ocorrencia;
}

export async function buscarOcorrencia(id: string | number) {
  const { data } = await api.get<{ ocorrencia: Ocorrencia }>(
    `/ocorrencias/${id}`,
  );
  return data.ocorrencia;
}

export async function atualizarOcorrencia(
  id: string | number,
  input: OcorrenciaInput,
) {
  const { data } = await api.put<AtualizarOcorrenciaResponse>(
    `/ocorrencias/${id}`,
    input,
  );
  return data.ocorrencia;
}

export async function atualizarStatusOcorrencia(
  id: string | number,
  input: AtualizarStatusInput,
) {
  const { data } = await api.put<AtualizarOcorrenciaResponse>(
    `/ocorrencias/${id}`,
    input,
  );
  return data.ocorrencia;
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