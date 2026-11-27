import { isAxiosError } from 'axios';

import { api } from './api';

export type Condominio = {
  id: string;
  codigo: string;
  nome: string;
};

export type CondominioInput = {
  codigo: string;
  nome: string;
};

/** GET /condominios — somente ADMIN. */
export async function listarTodosCondominios(): Promise<Condominio[]> {
  const { data } = await api.get<Condominio[]>('/condominios');
  return data;
}

/** POST /condominios — somente ADMIN. */
export async function criarCondominio(input: CondominioInput) {
  const { data } = await api.post<{ message: string; condominio: Condominio }>(
    '/condominios',
    input,
  );
  return data.condominio;
}

/** GET /sindicos/me/condominios — somente SINDICO (outros tipos recebem 403). */
export async function getMeusCondominios(): Promise<Condominio[]> {
  const { data } = await api.get<Condominio[]>('/sindicos/me/condominios');
  return data;
}

export function validarCondominio(input: CondominioInput) {
  const erros: { codigo?: string; nome?: string } = {};
  if (!input.nome.trim()) {
    erros.nome = 'Informe o nome do condomínio.';
  }
  if (!input.codigo.trim()) {
    erros.codigo = 'Informe o código do condomínio.';
  }
  return erros;
}

export function mensagemDeErroCondominio(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    const mensagem = error.response?.data?.message;

    switch (error.response?.status) {
      case 403:
        return 'Somente administradores podem gerenciar condomínios.';
      case 409:
        return mensagem ?? 'Já existe um condomínio com este código.';
      default:
        return mensagem ?? 'Não foi possível conectar ao servidor.';
    }
  }

  return 'Ocorreu um erro inesperado.';
}
