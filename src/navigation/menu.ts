import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import type { TipoUsuario } from '../services/auth';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const TIPO_LABEL: Record<TipoUsuario, string> = {
  MORADOR: 'Morador(a)',
  SINDICO: 'Síndico(a)',
  ADMIN: 'Administrador(a)',
};

export type MenuItem = {
  title: string;
  description: string;
  icon: IconName;
  href: Href;
};

const perfil: MenuItem = {
  title: 'Meu perfil',
  description: 'Nome, e-mail e tipo de conta',
  icon: 'account-circle',
  href: '/perfil',
};

const sobre: MenuItem = {
  title: 'Sobre o projeto',
  description: 'Propósito do aplicativo',
  icon: 'information',
  href: '/sobre',
};

const equipe: MenuItem = {
  title: 'Equipe',
  description: 'Integrantes do projeto',
  icon: 'account-group',
  href: '/equipe',
};

/**
 * Menu da tela inicial para cada tipo de conta. As abas inferiores ficam em
 * app/(app)/_layout.tsx e usam as mesmas regras (Tabs.Protected).
 */
export const MENU_POR_TIPO: Record<TipoUsuario, MenuItem[]> = {
  MORADOR: [
    {
      title: 'Minhas unidades',
      description: 'Apartamentos e condomínios vinculados a você',
      icon: 'home-city',
      href: '/unidades',
    },
    perfil,
    sobre,
    equipe,
  ],
  SINDICO: [
    {
      title: 'Meus condomínios',
      description: 'Condomínios que você administra',
      icon: 'office-building',
      href: '/condominios',
    },
    perfil,
    sobre,
    equipe,
  ],
  ADMIN: [perfil, sobre, equipe],
};
