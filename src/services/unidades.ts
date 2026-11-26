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

export async function listarMinhasUnidades() {
  const { data } = await api.get<Unidade[]>('/usuarios/me/unidades');
  return data;
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
