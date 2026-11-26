import { isAxiosError } from 'axios';
import { api } from './api';

export type Condominio = {
  id: number | string;
  nome: string;
};

export async function listarMeusCondominios() {
  const { data } = await api.get<Condominio[]>('/sindicos/me/condominios');
  return data;
}
export async function associarSindico(
  sindicoId: number,
  condominioId: number,
) {
  const { data } = await api.post(
    `/sindicos/${sindicoId}/condominios/${condominioId}`,
  );
  return data;
}

export async function desassociarSindico(
  sindicoId: number,
  condominioId: number,
) {
  await api.delete(`/sindicos/${sindicoId}/condominios/${condominioId}`);
}

export function mensagemDeErroSindico(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    switch (error.response?.status) {
      case 400:
        return 'Informe IDs válidos.';
      case 403:
        return 'Somente administradores podem gerenciar esses vínculos.';
      case 404:
        return 'Síndico, condomínio ou vínculo não encontrado.';
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
