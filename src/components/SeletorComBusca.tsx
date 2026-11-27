import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Text, TextInput } from 'react-native-paper';

export type OpcaoSeletor = {
  id: string | number;
  titulo: string;
  subtitulo?: string;
};

type Props = {
  label: string;
  opcoes: OpcaoSeletor[];
  valor?: string | number | null;
  onSelecionar: (id: string | number) => void;
  erro?: boolean;
};

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function SeletorComBusca({
  label,
  opcoes,
  valor,
  onSelecionar,
  erro,
}: Props) {
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);

  const selecionada = opcoes.find((opcao) => String(opcao.id) === String(valor));
  const termo = normalizar(busca.trim());
  const filtradas = opcoes.filter((opcao) =>
    normalizar(`${opcao.titulo} ${opcao.subtitulo ?? ''}`).includes(termo),
  );

  function abrir() {
    setBusca('');
    setAberto(true);
  }

  function selecionar(id: string | number) {
    onSelecionar(id);
    setAberto(false);
  }

  return (
    <View>
      <TextInput
        label={label}
        mode="outlined"
        value={aberto ? busca : (selecionada?.titulo ?? '')}
        onChangeText={setBusca}
        onFocus={abrir}
        error={erro}
        autoCorrect={false}
        right={
          <TextInput.Icon
            icon={aberto ? 'chevron-up' : 'chevron-down'}
            onPress={() => (aberto ? setAberto(false) : abrir())}
          />
        }
      />
      {aberto && (
        <View style={styles.lista}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
          >
            {filtradas.length === 0 ? (
              <Text style={styles.vazio}>Nenhum resultado.</Text>
            ) : (
              filtradas.map((opcao) => (
                <List.Item
                  key={String(opcao.id)}
                  title={opcao.titulo}
                  description={opcao.subtitulo}
                  onPress={() => selecionar(opcao.id)}
                />
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    borderColor: '#d5dde6',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  scroll: {
    maxHeight: 220,
  },
  vazio: {
    color: '#526579',
    padding: 16,
    textAlign: 'center',
  },
});
