import { QueryClient } from '@tanstack/react-query';

/**
 * Instância única do TanStack Query. Fica fora do _layout para que a sessão
 * consiga limpar o cache (dados da conta) no logout ou quando o token expira.
 */
export const queryClient = new QueryClient();
