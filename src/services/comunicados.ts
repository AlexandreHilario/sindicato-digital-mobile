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

export async function listarMeusComunicados() {
  const { data } = await api.get<Comunicado[]>('/comunicados/meus');
  return data;
}

export type ComunicadoInput = {
  titulo: string;
  conteudo: string;
};

export async function criarComunicado(input: ComunicadoInput) {
  const { data } = await api.post<Comunicado>('/comunicados', input);
  return data;
}

export async function atualizarComunicado(id: string, input: ComunicadoInput) {
  const { data } = await api.put<Comunicado>(`/comunicados/${id}`, input);
  return data;
}

export async function excluirComunicado(id: string | number) {
  await api.delete(`/comunicados/${id}`);
}

// Mesmas regras do validador do backend (após trim).
export function validarComunicado({ titulo, conteudo }: ComunicadoInput) {
  const erros: { titulo?: string; conteudo?: string } = {};
  const tituloTam = titulo.trim().length;
  const conteudoTam = conteudo.trim().length;

  if (tituloTam < 3 || tituloTam > 150) {
    erros.titulo = 'O título deve ter entre 3 e 150 caracteres.';
  }
  if (conteudoTam < 3 || conteudoTam > 5000) {
    erros.conteudo = 'O conteúdo deve ter entre 3 e 5000 caracteres.';
  }
  return erros;
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
