import { api } from './api';

export type Condominio = {
  id: string;
  codigo: string;
  nome: string;
};

/** GET /condominios — somente ADMIN. */
export async function listarTodosCondominios(): Promise<Condominio[]> {
  const { data } = await api.get<Condominio[]>('/condominios');
  return data;
}

/** GET /sindicos/me/condominios — somente SINDICO (outros tipos recebem 403). */
export async function getMeusCondominios(): Promise<Condominio[]> {
  const { data } = await api.get<Condominio[]>('/sindicos/me/condominios');
  return data;
}
