import { api } from './api';

export type Condominio = {
  id: number | string;
  nome: string;
};

export async function listarMeusCondominios() {
  const { data } = await api.get<Condominio[]>('/sindicos/me/condominios');
  return data;
}
