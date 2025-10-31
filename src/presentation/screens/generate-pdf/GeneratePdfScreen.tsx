import React, {FC, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useForm, Controller, type FieldErrors} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {generatePdfFormSchema} from './GeneratePdfValidationSchema';
import type {GeneratePdfForm} from '@/presentation/interfaces/forms';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParams} from '@/presentation/navigation/types';
import {generatePdfUseCase} from '@/app/compositionRoot';
import {storageService} from '@/app/compositionRoot';
import {FormDataEntity} from '@/core/entities/FormData';
import {Colors} from '@/presentation/theme/Colors';
import {ThemedIcon} from '@/presentation/components/UI/ThemedIcon';
import {
  onlyLettersAndNumbers,
  onlyDigits,
} from '@/presentation/utils/inputFormatters';

type Nav = StackNavigationProp<RootStackParams, 'GeneratePdf'>;

export const GeneratePdfScreen: FC = () => {
  const navigation = useNavigation<Nav>();
  const {control, handleSubmit, setValue} = useForm<GeneratePdfForm>({
    resolver: yupResolver(generatePdfFormSchema),
    defaultValues: {textValue: '', numericValue: '', optionValue: 'Opción 1'},
  });
  const [showOptions, setShowOptions] = useState(false);
  const [numericSelection, setNumericSelection] = useState<{
    start: number;
    end: number;
  }>({start: 0, end: 0});
  const [numericText, setNumericText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    storageService.loadFormData().then(saved => {
      if (saved) {
        console.log('[GeneratePdfScreen] Loaded saved form data from storage', saved);
        setValue('textValue', saved.textValue);
        const savedNumeric =
          saved.numericValue !== undefined && saved.numericValue !== null
            ? String(saved.numericValue)
            : '';
        setValue('numericValue', savedNumeric);
        setNumericText(savedNumeric);
        setValue('optionValue', saved.optionValue);
      }
    });
  }, [setValue]);

  const onGeneratePdfLib = async (form: GeneratePdfForm) => {
    try {
      setIsGenerating(true);
      const payload: FormDataEntity = {
        textValue: form.textValue,
        numericValue: form.numericValue ? Number(form.numericValue) : 0,
        optionValue: form.optionValue,
      };
      console.log('[GeneratePdfScreen] Submitting payload', payload);
      await storageService.saveFormData(payload);
      console.log('[GeneratePdfScreen] Saved form data, generating PDF...');
      const result = await generatePdfUseCase.execute(payload);
      console.log('[GeneratePdfScreen] PDF generated', result);
      navigation.navigate('PdfViewer', {
        uri: result.filePath,
        fileName: result.fileName,
      });
    } catch (error) {
      console.error('[GeneratePdfScreen] Error generating PDF', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo generar el PDF. Revisa la consola para más detalles.',
        text1Style: {fontSize: 18},
        text2Style: {fontSize: 14},
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onInvalid = (errors: FieldErrors<GeneratePdfForm>) => {
    console.warn('[GeneratePdfScreen] Form validation failed', errors);
    Toast.show({
      type: 'error',
      text1: 'Formulario inválido',
      text2: 'Revisa los campos ingresados.',
      text1Style: {fontSize: 18},
      text2Style: {fontSize: 14},
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}>
          <Text style={styles.label}>Dato 1</Text>
          <Controller
            control={control}
            name="textValue"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={styles.input}
                placeholder="Campo de texto"
                placeholderTextColor="#C9C3DE"
                value={value}
                onChangeText={t => onChange(onlyLettersAndNumbers(t))}
              />
            )}
          />

          <Text style={styles.label}>Dato 2</Text>
          <Controller
            control={control}
            name="optionValue"
            render={({field: {onChange, value}}) => (
              <View style={styles.selectWrapper}>
                <Pressable
                  style={styles.select}
                  onPress={() => {
                    setShowOptions(v => !v);
                    console.log('[GeneratePdfScreen] Toggle options ->', !showOptions);
                  }}>
                  <Text style={styles.selectText}>{value}</Text>
                  <ThemedIcon
                    type="custom"
                    name="chevronDown"
                    size={12}
                    color={Colors.textPrimary}
                  />
                </Pressable>
                {showOptions && (
                  <View style={styles.dropdown}>
                    {['Opción 1', 'Opción 2', 'Opción 3'].map(opt => (
                      <Pressable
                        key={opt}
                        style={styles.dropdownItem}
                        onPress={() => {
                          console.log('[GeneratePdfScreen] Option selected', opt);
                          onChange(opt);
                          setShowOptions(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{opt}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          />

          <Text style={styles.label}>Dato 3</Text>
          <Controller
            control={control}
            name="numericValue"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                inputMode="numeric"
                value={numericText}
                placeholder="Campo de número"
                placeholderTextColor="#C9C3DE"
                onChangeText={t => {
                  const filtered = onlyDigits(t);
                  setNumericText(filtered);
                  onChange(filtered);
                }}
              />
            )}
          />

          <Pressable
            disabled={isGenerating}
            style={({pressed}) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              isGenerating && styles.disabledButton,
            ]}
            android_ripple={{color: 'rgba(255,255,255,0.2)'}}
            onPress={() => {
              console.log('[GeneratePdfScreen] Primary button pressed');
              handleSubmit(onGeneratePdfLib, onInvalid)();
            }}>
            <Text style={styles.primaryButtonText}>
              {isGenerating ? 'Generando…' : 'Generar PDF'}
            </Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            android_ripple={{color: 'rgba(0,0,0,0.1)'}}
            onPress={() => {
              console.log('[GeneratePdfScreen] Navigate to ImageRenderTest');
              navigation.navigate('ImageRenderTest');
            }}>
            <Text style={styles.secondaryButtonText}>
              🧪 Test de Rendimiento de Imágenes
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    backgroundColor: Colors.surface,
    borderRadius: 25,
    padding: 25,
  },
  container: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.textOnPrimary,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.textOnPrimary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  selectWrapper: {
    position: 'relative',
    backgroundColor: Colors.textOnPrimary,
  },
  selectText: {color: Colors.textPrimary},
  caret: {color: Colors.textPrimary, opacity: 0.7},
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    borderRadius: 12,
    backgroundColor: Colors.textOnPrimary,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
  },
  dropdownItem: {paddingVertical: 10, paddingHorizontal: 12},
  dropdownItemText: {color: Colors.textPrimary},
  primaryButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonPressed: {
    transform: [{scale: 0.98}],
    opacity: 0.9,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {color: Colors.textOnPrimary},
  secondaryButton: {
    marginTop: 8,
    backgroundColor: Colors.textOnPrimary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonPressed: {
    transform: [{scale: 0.98}],
    opacity: 0.9,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
