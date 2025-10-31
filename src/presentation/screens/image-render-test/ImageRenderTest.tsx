import React, {FC, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import {Colors} from '@/presentation/theme/Colors';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParams} from '@/presentation/navigation/types';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

type Nav = StackNavigationProp<RootStackParams, 'ImageRenderTest'>;

// Tipo de imagen para el test
type ImageType = 'original' | 'optimized';

// Datos de rendimiento del test
interface TestResult {
  imageType: ImageType;
  generationTime: number;
  pdfSize?: number;
  filePath: string;
  timestamp: number;
}

export const ImageRenderTest: FC = () => {
  const navigation = useNavigation<Nav>();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [columns, setColumns] = useState<2 | 3>(2); // Cantidad de imágenes por fila

  /**
   * Convierte una imagen de assets a base64
   * Usa fetch + blob para leer desde el bundle de Android
   */
  const getImageBase64 = async (imageType: ImageType): Promise<string> => {
    const imageFileName = imageType === 'original' ? 'original.jpg' : 'optimized.jpg';
    
    console.log(`📁 Cargando imagen: ${imageFileName}`);

    try {
      // Opción 1: Intentar leer desde el asset empaquetado en el APK
      // En Android, los assets se pueden acceder como recursos
      const assetUri = Platform.select({
        android: `asset:/images/${imageFileName}`,
        ios: imageFileName,
      }) || `asset:/images/${imageFileName}`;

      console.log(`🔍 Intentando cargar desde: ${assetUri}`);

      // Usar fetch para leer el archivo como blob
      const response = await fetch(assetUri);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log(`📦 Blob obtenido: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)}KB)`);

      // Convertir blob a base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          try {
            const base64 = reader.result as string;
            if (base64) {
              console.log(`✅ Imagen convertida a base64 (${(base64.length / 1024).toFixed(2)}KB)`);
              resolve(base64);
            } else {
              reject(new Error('No se pudo convertir a base64'));
            }
          } finally {
            // Limpiar referencia
            reader.onloadend = null;
            reader.onerror = null;
          }
        };
        
        reader.onerror = (error) => {
          console.error('❌ Error en FileReader:', error);
          reader.onloadend = null;
          reader.onerror = null;
          reject(new Error('Error al leer el blob'));
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`❌ Error cargando desde asset:`, error);
      
      // Opción 2: Intentar copiar desde assets a temp y leer desde ahí
      console.log('🔄 Intentando método alternativo (copiar a temp)...');
      
      try {
        const tempPath = `${RNFS.CachesDirectoryPath}/${imageFileName}`;
        
        // Intentar copiar desde el asset a temp
        const assetPath = `asset:/images/${imageFileName}`;
        await RNFS.copyFileAssets(`images/${imageFileName}`, tempPath);
        
        console.log(`✅ Archivo copiado a: ${tempPath}`);
        
        // Leer el archivo temporal
        const base64 = await RNFS.readFile(tempPath, 'base64');
        const sizeKB = (base64.length * 0.75 / 1024).toFixed(2);
        console.log(`✅ Imagen leída desde temp (${sizeKB}KB aprox.)`);
        
        // Limpiar archivo temporal después de leer
        try {
          await RNFS.unlink(tempPath);
          console.log(`🧹 Archivo temporal eliminado`);
        } catch (unlinkError) {
          // No es crítico si falla
          console.warn('⚠️ No se pudo eliminar archivo temporal:', unlinkError);
        }
        
        return `data:image/jpeg;base64,${base64}`;
      } catch (innerError) {
        console.error(`❌ Error con método alternativo:`, innerError);
        
        throw new Error(
          `❌ No se pudo cargar ${imageFileName}.\n\n` +
          `Asegurate de que:\n` +
          `1. El archivo existe en: android/app/src/main/assets/images/${imageFileName}\n` +
          `2. Reconstruiste la app después de agregar las imágenes\n` +
          `3. El archivo es una imagen JPG válida\n\n` +
          `Ejecutá:\n` +
          `  cd android\n` +
          `  .\\gradlew clean\n` +
          `  cd ..\n` +
          `  npm run android\n\n` +
          `Error original: ${error}\n` +
          `Error alternativo: ${innerError}`
        );
      }
    }
  };

  /**
   * Genera un PDF de test con 46 imágenes del tipo especificado
   */
  const generateTestPdf = async (imageType: ImageType) => {
    setIsGenerating(true);
    const startTime = Date.now();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 INICIANDO GENERACIÓN DE PDF - ${imageType.toUpperCase()}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      const imageFileName = imageType === 'original' ? 'original.jpg' : 'optimized.jpg';
      console.log(`📁 Preparando imagen: ${imageFileName}`);
      
      // Convertir la imagen a base64
      console.log('🔄 Convirtiendo imagen a base64...');
      const imageBase64 = await getImageBase64(imageType);
      const base64Size = imageBase64.length / 1024;
      console.log(`✅ Imagen convertida a base64 (${base64Size.toFixed(2)}KB en base64)`);
      
      // Generar el HTML con las 46 imágenes
      const imageRows = generateImageRows(imageBase64, imageType, 46);
      
      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { 
              size: A4; 
              margin: 15px; 
            }
            body { 
              font-family: Arial, sans-serif; 
              color: #4D406E; 
              margin: 0; 
              padding: 15px;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #4D406E;
            }
            .header h1 {
              margin: 0 0 5px 0;
              font-size: 20px;
              color: #4D406E;
            }
            .header p {
              margin: 2px 0;
              font-size: 11px;
              color: #666;
            }
            .image-grid {
              display: grid;
              grid-template-columns: repeat(${columns}, 1fr);
              gap: 10px;
              margin-top: 15px;
            }
            .image-container {
              position: relative;
              border: 2px solid #4D406E;
              border-radius: 6px;
              overflow: hidden;
              page-break-inside: avoid;
              background-color: #f5f5f5;
              aspect-ratio: 4/3;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .image-container img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }
            .image-label {
              position: absolute;
              bottom: 3px;
              right: 3px;
              background-color: rgba(77, 64, 110, 0.9);
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: bold;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              color: #666;
              padding-top: 8px;
              border-top: 1px solid #4D406E;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧪 Test de Rendimiento de Imágenes en PDF</h1>
            <p><strong>Tipo:</strong> ${imageType === 'original' ? '🔴 Imágenes Originales (~2MB c/u)' : '🟢 Imágenes Optimizadas (~300KB c/u)'}</p>
            <p><strong>Cantidad:</strong> 46 imágenes | <strong>Layout:</strong> ${columns} columnas | <strong>Estimado:</strong> ${imageType === 'original' ? '~92MB' : '~14MB'}</p>
          </div>
          
          <div class="image-grid">
            ${imageRows}
          </div>
          
          <div class="footer">
            <p>Generado con react-native-html-to-pdf | ${new Date().toLocaleString('es-AR')}</p>
          </div>
        </body>
      </html>`;

      // Generar el PDF
      const RNHTMLtoPDF = require('react-native-html-to-pdf').default as any;
      const date = new Date();
      const stamp = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}_${String(date.getHours()).padStart(2,'0')}${String(date.getMinutes()).padStart(2,'0')}${String(date.getSeconds()).padStart(2,'0')}`;
      
      const fileName = `ImageTest_${imageType}_${stamp}`;
      
      const options = {
        html,
        fileName,
        directory: 'Documents',
        base64: false,
      };

      console.log('⏳ Convirtiendo HTML a PDF...');
      const pdfStartTime = Date.now();
      
      const result = await RNHTMLtoPDF.convert(options);
      
      const pdfEndTime = Date.now();
      const pdfGenerationTime = pdfEndTime - pdfStartTime;
      
      const totalTime = Date.now() - startTime;

      if (!result.filePath) {
        throw new Error('No se pudo generar el PDF');
      }

      // Obtener el tamaño del archivo generado
      let fileSize = 0;
      try {
        const stat = await RNFS.stat(result.filePath);
        fileSize = stat.size;
      } catch (e) {
        console.warn('No se pudo obtener el tamaño del archivo:', e);
      }

      const testResult: TestResult = {
        imageType,
        generationTime: totalTime,
        pdfSize: fileSize,
        filePath: result.filePath,
        timestamp: Date.now(),
      };

      setLastResult(testResult);
      setResults(prev => [...prev, testResult]);

      // Log detallado
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ PDF GENERADO EXITOSAMENTE`);
      console.log(`${'='.repeat(60)}`);
      console.log(`📊 Tipo: ${imageType === 'original' ? '🔴 ORIGINAL' : '🟢 OPTIMIZADA'}`);
      console.log(`⏱️  Tiempo total: ${totalTime}ms`);
      console.log(`📝 Tiempo de conversión PDF: ${pdfGenerationTime}ms`);
      console.log(`📦 Tamaño del PDF: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📄 Archivo: ${result.filePath}`);
      console.log(`🖼️  Imágenes incluidas: 46 (${columns} columnas)`);
      console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
      console.log(`${'='.repeat(60)}\n`);

      // Mostrar notificación de éxito
      Toast.show({
        type: 'success',
        text1: '✅ PDF Generado',
        text2: `${totalTime}ms | ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        text1Style: {fontSize: 18},
        text2Style: {fontSize: 14},
        position: 'top',
        visibilityTime: 4000,
      });

      // Preguntar si quiere ver el PDF
      Alert.alert(
        'PDF Generado',
        `Se generó el PDF con imágenes ${imageType === 'original' ? 'originales' : 'optimizadas'} en ${totalTime}ms.\n\n¿Deseas visualizarlo?`,
        [
          {text: 'No', style: 'cancel'},
          {
            text: 'Ver PDF',
            onPress: () => {
              navigation.navigate('PdfViewer', {
                uri: result.filePath,
                fileName: `${fileName}.pdf`,
              });
            },
          },
        ]
      );

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo generar el PDF. Verifica que las imágenes existan.',
        text1Style: {fontSize: 18},
        text2Style: {fontSize: 14},
        position: 'top',
        visibilityTime: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Genera el HTML de las imágenes para el PDF usando base64
   */
  const generateImageRows = (imageBase64: string, imageType: ImageType, count: number): string => {
    let rows = '';
    
    // Usar la imagen en base64 para todas las repeticiones
    for (let i = 1; i <= count; i++) {
      rows += `
          <div class="image-container">
            <img src="${imageBase64}" alt="Imagen ${i}" />
            <div class="image-label">#${i} (${imageType === 'original' ? '2MB' : '300KB'})</div>
          </div>`;
    }
    return rows;
  };

  /**
   * Compara resultados entre original y optimizado
   */
  const getComparison = () => {
    const originalResult = results.find(r => r.imageType === 'original');
    const optimizedResult = results.find(r => r.imageType === 'optimized');
    
    if (!originalResult || !optimizedResult) return null;
    
    const timeDiff = originalResult.generationTime - optimizedResult.generationTime;
    const timePercentage = ((timeDiff / originalResult.generationTime) * 100).toFixed(1);
    
    return {
      timeDiff,
      timePercentage,
      originalTime: originalResult.generationTime,
      optimizedTime: optimizedResult.generationTime,
    };
  };

  const comparison = getComparison();

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
          
          <Text style={styles.title}>Test de Rendimiento PDF</Text>
          <Text style={styles.subtitle}>
            Compara el tiempo de generación de PDFs con 46 imágenes
          </Text>
        </View>

        {/* Selector de Columnas */}
        <View style={styles.columnSelector}>
          <Text style={styles.columnSelectorLabel}>Layout del PDF:</Text>
          <View style={styles.columnButtons}>
            <Pressable
              style={({pressed}) => [
                styles.columnButton,
                columns === 2 && styles.columnButtonActive,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setColumns(2)}>
              <Text style={[
                styles.columnButtonText,
                columns === 2 && styles.columnButtonTextActive
              ]}>
                2 columnas
              </Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.columnButton,
                columns === 3 && styles.columnButtonActive,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setColumns(3)}>
              <Text style={[
                styles.columnButtonText,
                columns === 3 && styles.columnButtonTextActive
              ]}>
                3 columnas
              </Text>
            </Pressable>
          </View>
          <Text style={styles.columnSelectorHint}>
            {columns === 2 ? '📱 2 imágenes por fila (más grandes)' : '📱 3 imágenes por fila (más compacto)'}
          </Text>
        </View>

        {/* Botones de Test */}
        <View style={styles.testButtons}>
          <Pressable
            style={({pressed}) => [
              styles.testButton,
              styles.originalButton,
              pressed && styles.buttonPressed,
              isGenerating && styles.disabledButton,
            ]}
            onPress={() => generateTestPdf('original')}
            disabled={isGenerating}>
            <Text style={styles.testButtonTitle}>🔴 Test con Originales</Text>
            <Text style={styles.testButtonSubtitle}>46 imágenes × ~2MB</Text>
            <Text style={styles.testButtonInfo}>~92MB total</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.testButton,
              styles.optimizedButton,
              pressed && styles.buttonPressed,
              isGenerating && styles.disabledButton,
            ]}
            onPress={() => generateTestPdf('optimized')}
            disabled={isGenerating}>
            <Text style={styles.testButtonTitle}>🟢 Test con Optimizadas</Text>
            <Text style={styles.testButtonSubtitle}>46 imágenes × ~300KB</Text>
            <Text style={styles.testButtonInfo}>~14MB total</Text>
          </Pressable>
        </View>

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>⏳ Generando PDF...</Text>
            <Text style={styles.loadingSubtext}>Esto puede tomar unos segundos</Text>
          </View>
        )}

        {/* Último Resultado */}
        {lastResult && !isGenerating && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>📊 Último Resultado</Text>
            <View style={styles.resultContent}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tipo:</Text>
                <Text style={styles.resultValue}>
                  {lastResult.imageType === 'original' ? '🔴 Original' : '🟢 Optimizada'}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tiempo:</Text>
                <Text style={[styles.resultValue, styles.highlight]}>
                  {lastResult.generationTime}ms
                </Text>
              </View>
              {lastResult.pdfSize && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Tamaño PDF:</Text>
                  <Text style={styles.resultValue}>
                    {(lastResult.pdfSize / 1024 / 1024).toFixed(2)}MB
                  </Text>
                </View>
              )}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Promedio:</Text>
                <Text style={styles.resultValue}>
                  {(lastResult.generationTime / 46).toFixed(2)}ms/img
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Comparación */}
        {comparison && (
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>⚖️ Comparación</Text>
            <View style={styles.comparisonContent}>
              <Text style={styles.comparisonText}>
                🔴 Original: <Text style={styles.comparisonValue}>{comparison.originalTime}ms</Text>
              </Text>
              <Text style={styles.comparisonText}>
                🟢 Optimizada: <Text style={styles.comparisonValue}>{comparison.optimizedTime}ms</Text>
              </Text>
              <View style={styles.divider} />
              <Text style={[styles.comparisonText, styles.comparisonHighlight]}>
                ⚡ Las optimizadas son {comparison.timePercentage}% más rápidas
              </Text>
              <Text style={styles.comparisonSubtext}>
                Diferencia: {comparison.timeDiff}ms
              </Text>
            </View>
          </View>
        )}

        {/* Historial */}
        {results.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>📋 Historial ({results.length})</Text>
            {results.slice().reverse().map((result, index) => (
              <View key={result.timestamp} style={styles.historyItem}>
                <Text style={styles.historyText}>
                  {result.imageType === 'original' ? '🔴' : '🟢'} {result.generationTime}ms
                  {result.pdfSize && ` | ${(result.pdfSize / 1024 / 1024).toFixed(1)}MB`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Información */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Información</Text>
          <Text style={styles.infoText}>
            • Este test genera un PDF con 46 imágenes{'\n'}
            • Mide el tiempo de conversión HTML→PDF{'\n'}
            • Las imágenes deben estar en: {'\n'}
            {'  '}src/presentation/assets/images/{'\n'}
            {'  '}• original.jpg (~2MB){'\n'}
            {'  '}• optimized.jpg (~300KB){'\n'}
            • Los resultados se muestran en pantalla y consola
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textOnPrimary,
    textAlign: 'center',
    opacity: 0.9,
  },
  testButtons: {
    gap: 16,
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
  },
  originalButton: {
    borderColor: '#FF6B6B',
  },
  optimizedButton: {
    borderColor: '#51CF66',
  },
  buttonPressed: {
    transform: [{scale: 0.98}],
    opacity: 0.9,
  },
  disabledButton: {
    opacity: 0.5,
  },
  testButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  testButtonSubtitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.8,
  },
  testButtonInfo: {
    fontSize: 12,
    color: Colors.textPrimary,
    opacity: 0.6,
    marginTop: 4,
  },
  loadingContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.7,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  resultContent: {
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.8,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  highlight: {
    color: Colors.primary,
    fontSize: 20,
  },
  comparisonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#51CF66',
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  comparisonContent: {
    gap: 6,
  },
  comparisonText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  comparisonValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  comparisonHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#51CF66',
  },
  comparisonSubtext: {
    fontSize: 12,
    color: Colors.textPrimary,
    opacity: 0.7,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  historyItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textPrimary,
    opacity: 0.8,
    lineHeight: 20,
  },
  columnSelector: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  columnSelectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  columnButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  columnButton: {
    flex: 1,
    backgroundColor: Colors.textOnPrimary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  columnButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  columnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  columnButtonTextActive: {
    color: Colors.textOnPrimary,
  },
  columnSelectorHint: {
    fontSize: 13,
    color: Colors.textPrimary,
    opacity: 0.7,
    textAlign: 'center',
  },
});
