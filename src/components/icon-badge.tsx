import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import type { IconName } from '../navigation/menu';
import { palette, radius } from '../theme';

type Props = {
  icon: IconName;
  size?: number;
  color?: string;
  background?: string;
};

/** Ícone dentro de um quadrado arredondado, usado em cartões e listas. */
export function IconBadge({
  icon,
  size = 44,
  color = palette.primary,
  background = palette.primarySoft,
}: Props) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: background },
      ]}
    >
      <Icon source={icon} size={size * 0.52} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
});
