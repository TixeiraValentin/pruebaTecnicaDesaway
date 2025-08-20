import * as React from 'react';
import { Image, ImageStyle } from 'react-native';

type LogoProps = {
  size?: number;
  style?: ImageStyle;
};

export const Logo: React.FC<LogoProps> = ({ size = 120, style }) => {
  return (
    <Image
      source={require('../assets/images/desaway.png')}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    />
  );
};


