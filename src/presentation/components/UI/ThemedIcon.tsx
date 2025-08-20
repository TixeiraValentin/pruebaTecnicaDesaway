import * as React from 'react';
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { Colors } from '@/presentation/theme/Colors';
import ChevronDown from '@/presentation/assets/svg/chevron-down.svg';

const svgIcons = {
  chevronDown: ChevronDown,
};

export type CustomIconName = keyof typeof svgIcons;

type BaseIconProps = {
  color?: string;
  size?: number;
  width?: number;
  height?: number;
  style?: StyleProp<TextStyle>;
};

type ThemedIconProps = BaseIconProps & {
  type: 'custom';
  name: CustomIconName;
};

export const ThemedIcon: React.FC<ThemedIconProps> = ({
  type,
  name,
  height,
  width,
  color = Colors.textPrimary,
  size = 18,
  style = {},
  ...props
}) => {
  const flattened = StyleSheet.flatten(style);

  if (type === 'custom') {
    const SvgIcon = svgIcons[name];
    return (
      <View style={[styles.iconContainer, { width: width ?? size, height: height ?? size }]}>
        <SvgIcon
          {...props}
          color={(flattened?.color as string) || color}
          width={width ?? size}
          height={height ?? size}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});


