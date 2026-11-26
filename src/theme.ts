import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

/**
 * Tema fixo claro. Sem passar um tema, o PaperProvider segue o modo escuro do
 * sistema, deixando os campos escuros sobre as telas claras (o rótulo do
 * TextInput "outlined" fica com um fundo de cor diferente cortando a borda).
 *
 * `background` precisa ser a mesma cor do fundo das telas: é a cor usada atrás
 * do rótulo flutuante dos campos.
 */
export const theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#f5f7fa',
  },
};
