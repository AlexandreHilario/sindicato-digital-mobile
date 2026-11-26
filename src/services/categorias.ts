import { isAxiosError } from 'axios';

import { api } from './api';

export type Categoria = {
  id: number | string;
  nome: string;
  descricao: string | null;
  criado_em: string;
};

export type CategoriaInput = {
  nome: string;
  descricao?: string | null;
};

type CategoriaResponse = {
  message: string;
  categoria: Categoria;
};

export async function listarCategorias() {
  const { data } = await api.get<Categoria[]>('/categorias');
  return data;
}

export async function buscarCategoriaPorId(id: string | number) {
  const { data } = await api.get<Categoria>(`/categorias/${id}`);
  return data;
}

export async function criarCategoria(input: CategoriaInput) {
  const { data } = await api.post<CategoriaResponse>('/categorias', input);
  return data.categoria;
}

export async function atualizarCategoria(
  id: string | number,
  input: CategoriaInput,
) {
  const { data } = await api.put<CategoriaResponse>(
    `/categorias/${id}`,
    input,
  );
  return data.categoria;
}

export async function excluirCategoria(id: string | number) {
  const { data } = await api.delete<{ message: string }>(`/categorias/${id}`);
  return data;
}

export function validarCategoria(input: CategoriaInput) {
  const erros: { nome?: string } = {};
  if (!input.nome.trim()) {
    erros.nome = 'Informe o nome da categoria.';
  }
  return erros;
}

export function mensagemDeErroCategoria(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    const mensagem = error.response?.data?.message;

    if (error.response?.status === 409) {
      if (mensagem?.toLowerCase().includes('vinculada')) {
        return 'Esta categoria está vinculada a ocorrências e não pode ser excluída.';
      }
      if (mensagem?.toLowerCase().includes('já existe')) {
        return 'Já existe uma categoria com este nome.';
      }
      return mensagem ?? 'Não foi possível concluir a operação.';
    }

    if (error.response?.status === 400) {
      return mensagem ?? 'Informe um nome válido para a categoria.';
    }

    if (error.response?.status === 403) {
      return 'Você não tem permissão para gerenciar categorias.';
    }

    if (error.response?.status === 404) {
      return 'A categoria não foi encontrada.';
    }

    return mensagem ?? 'Não foi possível conectar ao servidor.';
  }

  return 'Ocorreu um erro inesperado.';
}
