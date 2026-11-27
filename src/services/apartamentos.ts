import { isAxiosError } from 'axios';

import { api } from './api';

export type Apartamento = {
  id: number | string;
  condominio_id: number | string;
  bloco: string;
  numero: string;
  condominio_nome?: string;
  condominio?: {
    id?: number | string;
    nome?: string;
  };
};

export type ApartamentoInput = {
  condominio_id: number | string;
  bloco: string;
  numero: string;
};

export type MoradorApartamento = {
  id: string | number;
  nome: string;
  email: string;
};

export type ApartamentoUpdate = {
  condominio_id?: number | string;
  bloco?: string;
  numero?: string;
};

export async function listarApartamentos(): Promise<Apartamento[]> {
  const { data } = await api.get<Apartamento[]>('/apartamentos');
  return data;
}

export async function listarMoradoresApartamento(
  id: string | number,
): Promise<MoradorApartamento[]> {
  const { data } = await api.get<MoradorApartamento[]>(
    `/apartamentos/${id}/moradores`,
  );
  return data;
}

/** POST /apartamentos/:id/moradores — associa um morador existente. */
export async function associarMoradorApartamento(
  apartamentoId: string | number,
  moradorId: string | number,
): Promise<void> {
  await api.post(`/apartamentos/${apartamentoId}/moradores`, {
    morador_id: moradorId,
  });
}

/** DELETE /apartamentos/:id/moradores/:moradorId — remove associação. */
export async function desassociarMoradorApartamento(
  apartamentoId: string | number,
  moradorId: string | number,
): Promise<void> {
  await api.delete(
    `/apartamentos/${apartamentoId}/moradores/${moradorId}`,
  );
}

export async function buscarApartamentoPorId(id: number | string) {
  const { data } = await api.get<Apartamento>(`/apartamentos/${id}`);
  return data;
}

export async function criarApartamento(dados: ApartamentoInput) {
  const { data } = await api.post<Apartamento>('/apartamentos', dados);
  return data;
}

export async function atualizarApartamento(
  id: number | string,
  dados: ApartamentoUpdate,
) {
  const { data } = await api.put<Apartamento>(`/apartamentos/${id}`, dados);
  return data;
}

export async function excluirApartamento(id: number | string) {
  await api.delete(`/apartamentos/${id}`);
}

export function validarApartamento(
  dados: { condominio_id?: number | string; bloco: string; numero: string },
  exigeCondominio = true,
) {
  const erros: {
    condominio_id?: string;
    bloco?: string;
    numero?: string;
  } = {};

  if (exigeCondominio) {
    if (
      dados.condominio_id === undefined ||
      !Number.isInteger(Number(dados.condominio_id)) ||
      Number(dados.condominio_id) <= 0
    ) {
      erros.condominio_id = 'Selecione um condomínio.';
    }
  }

  if (!dados.bloco.trim()) {
    erros.bloco = 'Informe o bloco.';
  }

  if (!dados.numero.trim()) {
    erros.numero = 'Informe o número.';
  }

  return erros;
}

export function mensagemDeErroApartamento(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 409) {
      return 'Já existe um apartamento com este bloco e número no condomínio.';
    }
    if (error.response?.status === 404) {
      return 'O apartamento não foi encontrado.';
    }
    if (error.response?.status === 403) {
      return 'Você não tem permissão para realizar esta ação.';
    }
    return error.response?.data?.message ?? 'Não foi possível conectar ao servidor.';
  }

  return 'Ocorreu um erro inesperado.';
}
