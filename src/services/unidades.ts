import { api } from './api';

/** Unidade vinculada ao morador, com o condomínio a que pertence. */
export type UnidadeDoMorador = {
  id: string;
  bloco: string;
  numero: string;
  condominio_id: string;
  condominio: string;
};

/** GET /usuarios/me/unidades — somente MORADOR (outros tipos recebem 403). */
export async function getMinhasUnidades(): Promise<UnidadeDoMorador[]> {
  const { data } = await api.get<UnidadeDoMorador[]>('/usuarios/me/unidades');
  return data;
}
