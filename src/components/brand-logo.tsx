import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { palette, radius } from '../theme';

type Props = {
  /** "light" para fundos escuros (marca branca), "dark" para fundos claros. */
  variant?: 'light' | 'dark';
  /** "stacked": símbolo acima do nome. "inline": símbolo ao lado do nome. */
  layout?: 'stacked' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
};

const MARK_SIZE = { sm: 32, md: 44, lg: 64 } as const;
const TEXT_VARIANT = { sm: 'titleMedium', md: 'titleLarge', lg: 'headlineMedium' } as const;

/** Marca do SíndicoDigital: símbolo + nome (+ slogan opcional). */
export function BrandLogo({
  variant = 'dark',
  layout = 'stacked',
  size = 'md',
  showTagline = false,
}: Props) {
  const onDark = variant === 'light';
  const markSize = MARK_SIZE[size];

  return (
    <View style={layout === 'inline' ? styles.inline : styles.stacked}>
      <View
        style={[
          styles.mark,
          {
            width: markSize,
            height: markSize,
            borderRadius: markSize * 0.28,
            backgroundColor: onDark ? palette.textOnPrimary : palette.primary,
          },
        ]}
      >
        <Icon
          source="home-city"
          size={markSize * 0.56}
          color={onDark ? palette.primary : palette.textOnPrimary}
        />
      </View>
      <View style={layout === 'stacked' ? styles.textsStacked : undefined}>
        <Text
          variant={TEXT_VARIANT[size]}
          style={[styles.name, { color: onDark ? palette.textOnPrimary : palette.text }]}
        >
          Síndico
          <Text
            style={[
              styles.nameAccent,
              { color: onDark ? palette.textOnPrimaryMuted : palette.accent },
            ]}
          >
            Digital
          </Text>
        </Text>
        {showTagline ? (
          <Text
            variant="bodyMedium"
            style={[
              styles.tagline,
              { color: onDark ? palette.textOnPrimaryMuted : palette.textMuted },
            ]}
          >
            Gestão do seu condomínio na palma da mão
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: {
    alignItems: 'center',
    gap: 12,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textsStacked: {
    alignItems: 'center',
    gap: 4,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  name: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  nameAccent: {
    fontWeight: '400',
  },
  tagline: {
    textAlign: 'center',
  },
});
