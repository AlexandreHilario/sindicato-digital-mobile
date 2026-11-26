import { isAxiosError } from 'axios';

import { api } from './api';
import { listarMeusCondominios } from './sindicos';

export type Unidade = {
  id: number | string;
  condominio_id: number | string;
  bloco: string;
  numero: string;
  condominio_nome?: string;
  condominio?: string | { id?: number | string; nome?: string };
};

export type UnidadeDoMorador = Unidade & { condominio: string };

export type MoradorVinculado = {
  id: number | string;
  nome: string;
  email: string;
  tipo: 'MORADOR';
};

export async function getMinhasUnidades(): Promise<UnidadeDoMorador[]> {
  const { data } = await api.get<UnidadeDoMorador[]>('/usuarios/me/unidades');
  return data;
}

export async function listarMinhasUnidades(): Promise<Unidade[]> {
  return getMinhasUnidades();
}

export async function listarUnidadesDeGestao(): Promise<Unidade[]> {
  const { data } = await api.get<Unidade[]>('/apartamentos');
  return data;
}

export async function listarUnidadesParaOcorrencia(
  tipo: 'MORADOR' | 'SINDICO' | 'ADMIN',
) {
  if (tipo === 'MORADOR') {
    return listarMinhasUnidades();
  }

  const unidades = await listarUnidadesDeGestao();
  if (tipo === 'ADMIN') {
    return unidades;
  }

  const condominios = await listarMeusCondominios();
  const condominiosPermitidos = new Set(
    condominios
      .map(
        (condominio) =>
          condominio.id ?? condominio.condominio_id ?? condominio.condominio?.id,
      )
      .filter((id): id is number | string => id !== undefined)
      .map(String),
  );
  return unidades.filter((unidade) =>
    condominiosPermitidos.has(String(unidade.condominio_id)),
  );
}

export async function buscarUnidadePorId(unidadeId: number | string) {
  const { data } = await api.get<Unidade>(`/apartamentos/${unidadeId}`);
  return data;
}

export async function listarMoradoresDaUnidade(unidadeId: number | string) {
  const { data } = await api.get<MoradorVinculado[]>(
    `/unidades/${unidadeId}/moradores`,
  );
  return data;
}

export async function associarMorador(unidadeId: number | string, usuarioId: number | string) {
  const { data } = await api.post(
    `/unidades/${unidadeId}/moradores/${usuarioId}`,
  );
  return data;
}

export async function desassociarMorador(unidadeId: number | string, usuarioId: number | string) {
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
