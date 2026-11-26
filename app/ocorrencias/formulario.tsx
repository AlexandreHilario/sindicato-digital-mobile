import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Menu,
  Text,
  TextInput,
} from 'react-native-paper';

import {
  listarCategorias,
  mensagemDeErroCategoria,
} from '../../src/services/categorias';
import {
  mensagemDeErroOcorrencia,
  registrarOcorrencia,
} from '../../src/services/ocorrencias';
import {
  listarUnidadesParaOcorrencia,
  type Unidade,
} from '../../src/services/unidades';
import { useSessionStore } from '../../src/store/session-store';
import { useUsuarioLogado } from '../../src/services/usuario';

function rotuloUnidade(unidade: Unidade) {
  const condominio =
    unidade.condominio_nome ??
    (typeof unidade.condominio === 'string'
      ? unidade.condominio
      : unidade.condominio?.nome) ??
    `Condomínio ${unidade.condominio_id}`;
  return `${condominio} • Bloco ${unidade.bloco} • Unidade ${unidade.numero}`;
}

export default function FormularioOcorrenciaScreen() {
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((state) => state.accessToken);
  const usuario = useUsuarioLogado();
  const tipo = usuario.data?.tipo;
  const [unidadeId, setUnidadeId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [unidadeMenuAberto, setUnidadeMenuAberto] = useState(false);
  const [categoriaMenuAberto, setCategoriaMenuAberto] = useState(false);
  const [erros, setErros] = useState<{
    unidade_id?: string;
    categoria_id?: string;
    titulo?: string;
    descricao?: string;
  }>({});

  const categorias = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
    enabled: Boolean(tipo),
  });
  const unidades = useQuery({
    queryKey: ['unidades-ocorrencia', accessToken, tipo],
    queryFn: () => {
      if (!tipo) {
        throw new Error('O perfil do usuário não foi carregado.');
      }
      return listarUnidadesParaOcorrencia(tipo);
    },
    enabled: Boolean(tipo),
  });

  const salvar = useMutation({
    mutationFn: () =>
      registrarOcorrencia({
        unidade_id: unidadeId,
        categoria_id: categoriaId,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
      router.back();
    },
  });

  function enviar() {
    const novosErros: typeof erros = {};
    if (!unidadeId) {
      novosErros.unidade_id = 'Selecione uma unidade.';
    }
    if (!categoriaId) {
      novosErros.categoria_id = 'Selecione uma categoria.';
    }
    if (!titulo.trim()) {
      novosErros.titulo = 'Informe o título da ocorrência.';
    }
    if (!descricao.trim()) {
      novosErros.descricao = 'Informe a descrição da ocorrência.';
    }
    setErros(novosErros);
    if (Object.keys(novosErros).length === 0) {
      salvar.mutate();
    }
  }

  if (!accessToken) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Faça login para registrar uma ocorrência.
        </Text>
      </View>
    );
  }

  if (usuario.isPending || (tipo && (categorias.isPending || unidades.isPending))) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (usuario.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Não foi possível verificar seu perfil.
        </Text>
        <Button mode="contained" onPress={() => usuario.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!tipo) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Faça login para registrar uma ocorrência.
        </Text>
      </View>
    );
  }

  if (categorias.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroCategoria(categorias.error)}
        </Text>
        <Button mode="contained" onPress={() => categorias.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (unidades.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroOcorrencia(unidades.error)}
        </Text>
        <Button mode="contained" onPress={() => unidades.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!categorias.data || !unidades.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const unidadeSelecionada = unidades.data.find(
    (item) => String(item.id) === unidadeId,
  );
  const categoriaSelecionada = categorias.data.find(
    (item) => String(item.id) === categoriaId,
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Menu
          visible={unidadeMenuAberto}
          onDismiss={() => setUnidadeMenuAberto(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setUnidadeMenuAberto(true)}
            >
              {unidadeSelecionada
                ? rotuloUnidade(unidadeSelecionada)
                : 'Selecionar unidade'}
            </Button>
          }
        >
          {unidades.data.map((item) => (
            <Menu.Item
              key={String(item.id)}
              title={rotuloUnidade(item)}
              onPress={() => {
                setUnidadeId(String(item.id));
                setUnidadeMenuAberto(false);
                setErros((atual) => ({ ...atual, unidade_id: undefined }));
              }}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={Boolean(erros.unidade_id)}>
          {erros.unidade_id}
        </HelperText>
        {unidades.data.length === 0 && (
          <HelperText type="info" visible>
            Nenhuma unidade disponível para seu perfil.
          </HelperText>
        )}
      </View>
      <View>
        <Menu
          visible={categoriaMenuAberto}
          onDismiss={() => setCategoriaMenuAberto(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setCategoriaMenuAberto(true)}
              disabled={categorias.data.length === 0}
            >
              {categoriaSelecionada?.nome ?? 'Selecionar categoria'}
            </Button>
          }
        >
          {categorias.data.map((item) => (
            <Menu.Item
              key={String(item.id)}
              title={item.nome}
              onPress={() => {
                setCategoriaId(String(item.id));
                setCategoriaMenuAberto(false);
                setErros((atual) => ({ ...atual, categoria_id: undefined }));
              }}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={Boolean(erros.categoria_id)}>
          {erros.categoria_id}
        </HelperText>
        {categorias.data.length === 0 && (
          <HelperText type="info" visible>
            Nenhuma categoria cadastrada. Peça a um administrador ou síndico
            para cadastrar uma.
          </HelperText>
        )}
      </View>
      <View>
        <TextInput
          label="Título"
          mode="outlined"
          value={titulo}
          onChangeText={(value) => {
            setTitulo(value);
            setErros((atual) => ({ ...atual, titulo: undefined }));
          }}
          error={Boolean(erros.titulo)}
        />
        <HelperText type="error" visible={Boolean(erros.titulo)}>
          {erros.titulo}
        </HelperText>
      </View>
      <View>
        <TextInput
          label="Descrição"
          mode="outlined"
          value={descricao}
          onChangeText={(value) => {
            setDescricao(value);
            setErros((atual) => ({ ...atual, descricao: undefined }));
          }}
          multiline
          numberOfLines={6}
          error={Boolean(erros.descricao)}
        />
        <HelperText type="error" visible={Boolean(erros.descricao)}>
          {erros.descricao}
        </HelperText>
      </View>
      {salvar.isError && (
        <HelperText type="error" visible>
          {mensagemDeErroOcorrencia(salvar.error)}
        </HelperText>
      )}
      <Button
        mode="contained"
        onPress={enviar}
        loading={salvar.isPending}
        disabled={
          salvar.isPending ||
          unidades.data.length === 0 ||
          categorias.data.length === 0
        }
      >
        Registrar ocorrência
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    padding: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});
