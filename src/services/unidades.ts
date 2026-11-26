import { api } from './api';
import { listarMeusCondominios } from './sindicos';

export type Unidade = {
  id: number | string;
  condominio_id: number | string;
  bloco: string;
  numero: string;
  condominio?: string;
  condominio_nome?: string;
};

export type UnidadeDoMorador = Unidade & { condominio: string };

export async function getMinhasUnidades(): Promise<UnidadeDoMorador[]> {
  const { data } = await api.get<UnidadeDoMorador[]>('/usuarios/me/unidades');
  return data;
}

export async function listarMinhasUnidades(): Promise<Unidade[]> {
  return getMinhasUnidades();
}

export async function listarUnidadesDeGestao() {
  const { data } = await api.get<Unidade[]>('/apartamentos');
  return data;
}

export async function listarUnidadesParaOcorrencia(
  tipo: 'MORADOR' | 'SINDICO' | 'ADMIN',
) {
  if (tipo === 'MORADOR') {
    return listarMinhasUnidades();
  }

  const unidades = await listarUnidadesDeGestao();
  if (tipo === 'ADMIN') {
    return unidades;
  }

  const condominios = await listarMeusCondominios();
  const condominiosPermitidos = new Set(
    condominios.map((condominio) => String(condominio.id)),
  );
  return unidades.filter((unidade) =>
    condominiosPermitidos.has(String(unidade.condominio_id)),
  );
}
