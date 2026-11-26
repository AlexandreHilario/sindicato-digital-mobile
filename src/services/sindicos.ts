import { isAxiosError } from 'axios';

import { api } from './api';

export type Condominio = {
  id?: number;
  condominio_id?: number;
  nome?: string;
  condominio_nome?: string;
  condominio?: {
    id?: number;
    nome?: string;
  };
};

export async function listarCondominiosDoSindico() {
  const { data } = await api.get<Condominio[]>('/sindicos/me/condominios');
  return data;
}

export function mensagemDeErroCondominio(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Não foi possível carregar os condomínios.';
  }

  return 'Ocorreu um erro inesperado.';
}
