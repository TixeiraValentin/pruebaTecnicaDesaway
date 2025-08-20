import React from 'react';
import { View, Text, StyleSheet, Pressable, PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParams } from '@/presentation/navigation/types';

type R = RouteProp<RootStackParams, 'PdfViewer'>;
type Nav = StackNavigationProp<RootStackParams, 'PdfViewer'>;

export const PdfViewerScreen: React.FC = () => {
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { uri, fileName = 'document.pdf' } = route.params;
  const source = { uri, cache: true } as const;
  const insets = useSafeAreaInsets();
  console.log('[PdfViewerScreen] mounted with', { uri, fileName });

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 33) {
      return true;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const download = async () => {
    try {
      const ok = await requestStoragePermission();
      if (!ok) {
        Toast.show({ type: 'error', text1: 'Permiso denegado', text2: 'No se pudo guardar el PDF.' });
        return;
      }
      const downloads = RNFS.DownloadDirectoryPath || ReactNativeBlobUtil.fs.dirs.DownloadDir;
      const target = `${downloads}/${fileName}`;
      const src = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
      await RNFS.copyFile(src, target);
      await RNFS.scanFile(target).catch(() => {});
      console.log('[PdfViewerScreen] PDF copied to downloads:', target);
      Toast.show({ type: 'success', text1: 'PDF Guardado', text2: `Descargas: ${fileName}`, text1Style: { fontSize: 20 }, text2Style: { fontSize: 12 } });
    } catch (e) {
      console.error('[PdfViewerScreen] Error downloading PDF', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo descargar el PDF', text1Style: { fontSize: 20 }, text2Style: { fontSize: 12 } });
    }
  };

  if (!uri) {
    return (
      <View style={styles.empty}> 
        <Text style={styles.emptyText}>PDF inválido</Text>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}><Text style={styles.buttonText}>Volver</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        source={source}
        onLoadComplete={(n) => console.log('[PdfViewerScreen] PDF loaded pages:', n)}
        onError={(err) => {
          console.error('[PdfViewerScreen] PDF load error', err);
          Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar el PDF', text1Style: { fontSize: 18 }, text2Style: { fontSize: 16 } });
        }}
        style={styles.pdf}
      />
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.button} onPress={download}><Text style={styles.buttonText}>Descargar PDF</Text></Pressable>
        <Pressable style={[styles.button, styles.secondary]} onPress={() => { console.log('[PdfViewerScreen] Closing viewer'); navigation.goBack(); }}><Text style={styles.secondaryText}>Cerrar</Text></Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  pdf: { flex: 1 },
  actions: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingTop: 12, justifyContent: 'center', backgroundColor: '#111' },
  button: { backgroundColor: '#8C70D4', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: { backgroundColor: '#fff' },
  secondaryText: { color: '#8C70D4', fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#333', marginBottom: 12 },
});


