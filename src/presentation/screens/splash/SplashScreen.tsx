import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Logo } from '../../components/Logo';
import { Colors } from '../../theme/Colors';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Logo size={300} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


