import { isAxiosError } from 'axios';

import { api } from './api';

export type Unidade = {
  id: number;
  condominio_id: number;
  bloco: string;
  numero: string;
  condominio_nome?: string;
  condominio?: {
    id?: number;
    nome?: string;
  };
};

export type MoradorVinculado = {
  id: number;
  nome: string;
  email: string;
  tipo: 'MORADOR';
};

export async function buscarUnidadePorId(unidadeId: number) {
  const { data } = await api.get<Unidade>(`/apartamentos/${unidadeId}`);
  return data;
}

export async function listarMinhasUnidades() {
  const { data } = await api.get<Unidade[]>('/usuarios/me/unidades');
  return data;
}

export async function listarMoradoresDaUnidade(unidadeId: number) {
  const { data } = await api.get<MoradorVinculado[]>(
    `/unidades/${unidadeId}/moradores`,
  );
  return data;
}

export async function associarMorador(unidadeId: number, usuarioId: number) {
  const { data } = await api.post(
    `/unidades/${unidadeId}/moradores/${usuarioId}`,
  );
  return data;
}

export async function desassociarMorador(unidadeId: number, usuarioId: number) {
  await api.delete(`/unidades/${unidadeId}/moradores/${usuarioId}`);
}

export function mensagemDeErroVinculo(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    switch (error.response?.status) {
      case 400:
        return 'Informe IDs válidos.';
      case 403:
        return 'Você não tem permissão para essa operação.';
      case 404:
        return 'Usuário, unidade ou vínculo não encontrado.';
      case 409:
        return 'Esse vínculo já existe.';
      default:
        return (
          error.response?.data?.message ??
          'Não foi possível concluir a operação.'
        );
    }
  }

  return 'Ocorreu um erro inesperado.';
}
