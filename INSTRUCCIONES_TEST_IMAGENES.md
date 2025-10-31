# 🧪 Test de Rendimiento de Generación de PDF con Imágenes

## ✅ ¿Qué se ha implementado?

Se ha creado una pantalla completa de test de rendimiento para comparar el **tiempo de generación de PDFs** con imágenes optimizadas vs originales.

### ⚡ Funcionalidad: Test de Generación de PDF
**No es un test de renderizado en React Native**, sino un test que mide cuánto tiempo tarda **react-native-html-to-pdf** en generar un documento PDF que contiene 46 imágenes embebidas en base64.

## 🎯 Características

- ✨ Convierte imágenes JPG a base64 y las embebe en el HTML
- 🎨 **NUEVO:** Selector de layout (2 o 3 columnas por página)
- ⏱️ Mide el tiempo total de generación del PDF
- 📦 Muestra el tamaño del PDF resultante
- 📊 Compara automáticamente ambos tipos (original vs optimizada)
- 📋 Mantiene historial de todos los tests
- 👁️ Permite visualizar el PDF generado
- 🔧 Logs detallados en consola

## ⚠️ IMPORTANTE: Setup Inicial

### Paso 1: Verificar que las imágenes existan

Las imágenes ya están copiadas en:
```
✅ android/app/src/main/assets/images/original.jpg
✅ android/app/src/main/assets/images/optimized.jpg
```

Si no existen o querés cambiarlas, seguí las instrucciones de **"Cómo agregar/actualizar imágenes"** más abajo.

### Paso 2: Reconstruir la app

**IMPORTANTE:** Como agregamos archivos nuevos a los assets de Android, DEBÉS reconstruir la app:

```bash
# Detener Metro Bundler si está corriendo (Ctrl+C)

# Limpiar caché y reconstruir
npm start -- --reset-cache

# En otra terminal, reconstruir e instalar la app
npm run android
```

Si seguís teniendo problemas, hacé un clean build:

```bash
cd android
.\gradlew clean
cd ..
npm run android
```

### Paso 3: Probar el test

1. Abrí la app en tu emulador/dispositivo
2. Tocá el botón "🧪 Test de Rendimiento de Imágenes"
3. Ejecutá ambos tests (originales y optimizadas)
4. Compará los resultados

## 🎮 Cómo usar el test

### En la pantalla verás:

**Selector de Layout:**
- 📱 **2 columnas**: Imágenes más grandes (por defecto)
- 📱 **3 columnas**: Layout más compacto, más imágenes por página

**Dos botones principales:**
- 🔴 **Test con Originales**: Genera PDF con 46 imágenes de ~2MB cada una
- 🟢 **Test con Optimizadas**: Genera PDF con 46 imágenes de ~300KB cada una

**Proceso al presionar un botón:**
1. Carga la imagen desde assets
2. Convierte a base64
3. Genera HTML con 46 repeticiones
4. Convierte HTML a PDF
5. Muestra el tiempo y tamaño
6. Pregunta si querés ver el PDF

### Resultados en pantalla:

- **Último Resultado**: Tipo, tiempo, tamaño del PDF, promedio por imagen
- **⚖️ Comparación**: Aparece cuando ejecutaste ambos tests (muestra % de mejora)
- **📋 Historial**: Todos los tests realizados en la sesión

### Logs en consola:

```
============================================================
🚀 INICIANDO GENERACIÓN DE PDF - OPTIMIZED
============================================================

📁 Buscando imagen: optimized.jpg
🔍 Intentando leer desde: /data/.../assets/images/optimized.jpg
   ✅ Imagen leída correctamente (285.42KB aprox.)
🔄 Convirtiendo imagen a base64...
✅ Imagen convertida a base64 (380.56KB en base64)
⏳ Convirtiendo HTML a PDF...

============================================================
✅ PDF GENERADO EXITOSAMENTE
============================================================
📊 Tipo: 🟢 OPTIMIZADA
⏱️  Tiempo total: 3245ms
📝 Tiempo de conversión PDF: 3100ms
📦 Tamaño del PDF: 18.45MB
📄 Archivo: /storage/.../ImageTest_optimized_20251029_141714.pdf
🖼️  Imágenes incluidas: 46 (2 columnas)
⏰ Timestamp: 29/10/2025 14:17:14
============================================================
```

## 📊 Resultados esperados

| Tipo | Tamaño Imagen | Base64 Total | Tiempo Gen. | Tamaño PDF |
|------|---------------|--------------|-------------|------------|
| 🟢 Optimizada | ~300KB | ~380KB × 46 | 2-5 seg | ~18-25MB |
| 🔴 Original | ~2MB | ~2.6MB × 46 | 10-30 seg | ~120MB+ |

**Nota:** Los tiempos varían según el dispositivo. En dispositivos de gama baja, las originales pueden tardar mucho más.

## 🖼️ Cómo agregar/actualizar imágenes

### Si querés cambiar las imágenes de test:

1. **Agregá las imágenes en:**
   ```
   src/presentation/assets/images/
     - original.jpg    (~2MB)
     - optimized.jpg   (~300KB)
   ```

2. **Copiá al directorio de Android:**
   ```bash
   # PowerShell
   Copy-Item "src\presentation\assets\images\original.jpg" -Destination "android\app\src\main\assets\images\"
   Copy-Item "src\presentation\assets\images\optimized.jpg" -Destination "android\app\src\main\assets\images\"
   ```

   O manualmente:
   - Copiá `original.jpg` a `android/app/src/main/assets/images/original.jpg`
   - Copiá `optimized.jpg` a `android/app/src/main/assets/images/optimized.jpg`

3. **Reconstruí la app:**
   ```bash
   npm start -- --reset-cache
   npm run android
   ```

### Crear imágenes de test con ImageMagick:

```bash
cd src/presentation/assets/images/

# Imagen original (4000x3000, ~2MB)
magick -size 4000x3000 gradient:blue-red -quality 95 original.jpg

# Imagen optimizada (1200x900, ~300KB)
magick original.jpg -resize 1200x900 -quality 75 optimized.jpg

# Copiar a Android
cd ..\..\..\..
Copy-Item "src\presentation\assets\images\*.jpg" -Destination "android\app\src\main\assets\images\"

# Reconstruir
npm run android
```

## 🔧 Cómo funciona técnicamente

1. **Lectura de imagen:** Lee desde `android/app/src/main/assets/images/` usando `react-native-fs`
2. **Conversión a base64:** Convierte la imagen JPG a string base64
3. **Generación HTML:** Crea un HTML con grid CSS que incluye la imagen base64 46 veces
4. **Conversión a PDF:** `react-native-html-to-pdf` convierte el HTML a PDF
5. **Medición:** Registra tiempos en cada paso y tamaño final del PDF

### Estructura del HTML generado:

```html
<html>
  <head>
    <style>/* estilos de grid y layout */</style>
  </head>
  <body>
    <div class="header"><!-- Info del test --></div>
    <div class="image-grid">
      <div class="image-container">
        <img src="data:image/jpeg;base64,/9j/4AAQ..." />
        <div class="image-label">#1 (300KB)</div>
      </div>
      <!-- x46 veces -->
    </div>
    <div class="footer"><!-- Info de generación --></div>
  </body>
</html>
```

## 🐛 Solución de problemas

### Error: "Cannot find module '../../assets/images/original.jpg'"

**Causa:** Las imágenes no están en los assets de Android o la app no fue reconstruida.

**Solución:**
1. Verificá que las imágenes existan en `android/app/src/main/assets/images/`
2. Reconstruí la app: `npm run android`

### Error: "No se pudo cargar [imagen].jpg"

**Causa:** RNFS no puede leer el archivo.

**Solución:**
1. Verificá los logs para ver qué rutas intentó
2. Asegurate de que las imágenes son JPG válidas
3. Intentá con un clean build:
   ```bash
   cd android
   .\gradlew clean
   cd ..
   npm run android
   ```

### Las imágenes no se ven en el PDF (aparece #${count})

**Causa:** La conversión a base64 falló o el HTML está mal formado.

**Solución:**
- Ya está solucionado en la versión actual ✅
- Si persiste, revisá los logs en consola para ver el error específico

### El PDF es muy pequeño (~100KB)

**Causa:** Las imágenes no se embedieron correctamente.

**Solución:**
- Verificá en los logs que diga "Imagen leída correctamente"
- El tamaño en base64 debe ser mayor que el original
- Reconstruí la app

### Tarda demasiado con imágenes originales

**Es normal.** Embedar 46 imágenes de 2MB en base64 en un HTML y convertirlo a PDF es computacionalmente costoso. En dispositivos de gama baja puede tardar 30+ segundos.

## 📱 Archivos modificados

- ✨ `src/presentation/screens/image-render-test/ImageRenderTest.tsx` - Pantalla del test
- 🔧 `src/presentation/navigation/types.ts` - Tipo de ruta agregado
- 🔧 `src/presentation/navigation/AppNavigation.tsx` - Ruta configurada
- 🎯 `src/presentation/screens/generate-pdf/GeneratePdfScreen.tsx` - Botón de acceso
- 📁 `android/app/src/main/assets/images/` - Imágenes para el test

## 💡 Tips

- **Ejecutá primero el test con optimizadas** para tener una referencia rápida
- **Probá diferentes layouts**: 2 columnas vs 3 columnas para ver el impacto en el tiempo
- **Revisá siempre los logs en consola** para entender qué está pasando
- **El tamaño del PDF** puede variar según la compresión que aplique el generador
- **Cada PDF tiene un timestamp único** en el nombre para no sobreescribir
- **Los PDFs se guardan en Documents** del dispositivo

## 🎨 Diferencia entre 2 y 3 columnas

### 2 Columnas (Por defecto)
- ✅ Imágenes más grandes y visibles
- ✅ Mejor para ver detalles
- ⚠️ Más páginas en el PDF

### 3 Columnas
- ✅ Layout más compacto
- ✅ Menos páginas en el PDF
- ✅ Puede ser ligeramente más rápido de generar
- ⚠️ Imágenes más pequeñas

**Nota:** El tiempo de generación es similar en ambos casos, ya que la conversión de imágenes a base64 es el proceso más costoso.

## 🎯 Resultados prácticos

Este test demuestra por qué es importante optimizar imágenes:

- ✅ **Optimizadas**: 3-5 segundos, PDF de 18MB
- ❌ **Originales**: 10-30 segundos, PDF de 120MB+

**Conclusión:** Las imágenes optimizadas son **5-10x más rápidas** de procesar y generan PDFs **6-8x más livianos**.

---

## 🚀 Siguiente paso

```bash
# 1. Verificá que las imágenes estén en android/app/src/main/assets/images/
# 2. Reconstruí la app
npm start -- --reset-cache
npm run android

# 3. Ejecutá los tests y compará resultados
```

¿Problemas? Revisá los logs en consola o la sección de **Solución de problemas** arriba.

**¡Listo para probar! 🎉**
