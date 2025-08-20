<div align="center">

# DesawayApp – Prueba Técnica

Generación y visualización de PDFs en React Native (Android/iOS) con arquitectura por capas, validación de formularios y persistencia local.

</div>

## Stack técnico

- React Native 0.81 (Hermes enabled)
- React 19
- TypeScript 5
- React Navigation (Stack)
- React Hook Form + Yup
- AsyncStorage
- react-native-html-to-pdf (generación de PDF)
- react-native-pdf (visualización de PDF)
- RNFS / BlobUtil (descarga a Descargas)

## Estructura del proyecto

```
src/
  app/                # Bootstrap de la app (navegación, splash, error boundary)
  core/               # Dominio: entidades, casos de uso, contratos
  infrastructure/     # Implementaciones: repositorios, servicios
  presentation/       # UI: pantallas, navegación, tema, componentes, utils
```

- `src/app/AppRoot.tsx`: orquesta navegación, splash y ErrorBoundary.
- `src/presentation/navigation/AppNavigation.tsx`: Stack Navigator.
- `src/presentation/screens/generate-pdf/GeneratePdfScreen.tsx`: formulario, validación y envío a caso de uso.
- `src/core/useCases/GeneratePdfUseCase.ts`: caso de uso para generar PDF.
- `src/infrastructure/repositories/PdfLibRepository.ts`: usa `react-native-html-to-pdf` para crear el PDF.
- `src/presentation/screens/pdf-viewer/PdfViewerScreen.tsx`: visor de PDF con opción de descarga a carpeta Descargas.
- `src/infrastructure/services/AsyncStorageService.ts`: persistencia del último formulario.
- `src/presentation/theme/Colors.ts`: paleta de colores.
- `src/presentation/utils/inputFormatters.ts`: formateadores de entrada (solo letras, solo dígitos).

## Flujo funcional

1. Pantalla `GeneratePdf` captura: Dato 1 (texto), Dato 2 (opción), Dato 3 (numérico).
2. Al enviar, se construye `FormDataEntity` y se ejecuta `GeneratePdfUseCase`.
3. El repositorio `PdfLibRepository` renderiza un HTML y genera el PDF en Documentos.
4. Se navega a `PdfViewer` para previsualizar y descargar el archivo.
5. El formulario se guarda con `AsyncStorage` para recuperar valores al reiniciar.

## Requisitos previos

- Node 18+
- JDK 17 (recomendado) o 11
- Android SDK (variables ANDROID_HOME/ANDROID_SDK_ROOT configuradas)
- Dispositivo/Emulador Android

## Ejecutar en desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar Metro
npm start

# En otra terminal, Android (depende del SDK y un dispositivo)
npm run android
```

## Generar APK (para instalar y compartir)

Este proyecto ya firma el build de `release` con el keystore de debug (solo para pruebas). No usar en producción.

Rutas de salida:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

Comandos (Windows PowerShell):

```powershell
cd android
./gradlew.bat clean assembleRelease
```

Si prefieres Debug APK:

```powershell
cd android
./gradlew.bat assembleDebug
```

También puedes generar AAB (Play Store):

```powershell
cd android
./gradlew.bat bundleRelease
```

## Cambiar el ícono de la app (Android)

Reemplaza los PNG manteniendo los nombres en `android/app/src/main/res/`:

- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)
- Opcional: `ic_launcher_round.png` en cada carpeta

O usa Android Studio → New → Image Asset (nombre: `ic_launcher`).

## Recursos del PDF

Los SVG usados por el PDF están embebidos en Android desde `android/app/src/main/assets/` y se referencian via `file:///android_asset/...`.

## Notas y permisos

- Android 13+ (SDK 33): no se requiere WRITE_EXTERNAL_STORAGE para guardar en Descargas (la app ya maneja este caso).
- En Android <=12, se solicita `WRITE_EXTERNAL_STORAGE` cuando descargas el PDF desde el visor.
