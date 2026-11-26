import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import type { TipoUsuario } from '../services/auth';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const TIPO_LABEL: Record<TipoUsuario, string> = {
  MORADOR: 'Morador',
  SINDICO: 'Síndico',
  ADMIN: 'Administrador',
};

export const TIPO_ICON: Record<TipoUsuario, IconName> = {
  MORADOR: 'home-account',
  SINDICO: 'account-tie',
  ADMIN: 'shield-account',
};

export type MenuItem = {
  title: string;
  description: string;
  icon: IconName;
  href: Href;
};

const perfil: MenuItem = {
  title: 'Meu perfil',
  description: 'Seus dados e informações da conta',
  icon: 'account-circle-outline',
  href: '/perfil',
};

const mural: MenuItem = {
  title: 'Mural de comunicados',
  description: 'Avisos do condomínio',
  icon: 'bullhorn-outline',
  href: '/comunicados',
};

const ocorrencias: MenuItem = {
  title: 'Ocorrências',
  description: 'Problemas registrados no condomínio',
  icon: 'clipboard-alert-outline',
  href: '/ocorrencias',
};

/**
 * Atalhos da tela inicial para cada tipo de conta. As abas inferiores ficam em
 * app/(app)/_layout.tsx e seguem as mesmas regras (Tabs.Protected).
 */
export const MENU_POR_TIPO: Record<TipoUsuario, MenuItem[]> = {
  MORADOR: [
    {
      title: 'Minhas unidades',
      description: 'Apartamentos vinculados à sua conta',
      icon: 'home-city-outline',
      href: '/unidades',
    },
    mural,
    ocorrencias,
    perfil,
  ],
  SINDICO: [
    {
      title: 'Meus condomínios',
      description: 'Condomínios sob sua administração',
      icon: 'office-building-outline',
      href: '/condominios',
    },
    mural,
    ocorrencias,
    perfil,
  ],
  ADMIN: [mural, ocorrencias, perfil],
};
