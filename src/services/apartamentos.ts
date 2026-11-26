
import { api } from './api';

export type Apartamento = {
  id: string;
  condominio_id: string;
  bloco: string;
  numero: string;
};

export type MoradorApartamento = {
  id: string;
  nome: string;
  email: string;
};

/** GET /apartamentos — lista apartamentos disponíveis para gestores. */
export async function listarApartamentos(): Promise<Apartamento[]> {
  const { data } = await api.get<Apartamento[]>('/apartamentos');
  return data;
}

/** GET /apartamentos/:id/moradores — lista moradores do apartamento. */
export async function listarMoradoresApartamento(
  id: string,
): Promise<MoradorApartamento[]> {
  const { data } = await api.get<MoradorApartamento[]>(
    `/apartamentos/${id}/moradores`,
  );
  return data;
}

/** POST /apartamentos/:id/moradores — associa um morador existente. */
export async function associarMoradorApartamento(
  apartamentoId: string,
  moradorId: string,
): Promise<void> {
  await api.post(`/apartamentos/${apartamentoId}/moradores`, {
    morador_id: moradorId,
  });
}

/** DELETE /apartamentos/:id/moradores/:moradorId — remove associação. */
export async function desassociarMoradorApartamento(
  apartamentoId: string,
  moradorId: string,
): Promise<void> {
  await api.delete(
    `/apartamentos/${apartamentoId}/moradores/${moradorId}`,
  );
}
