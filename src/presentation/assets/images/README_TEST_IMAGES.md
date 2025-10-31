# Imágenes de Test para Generación de PDFs

## 📋 ¿Para qué son estas imágenes?

Estas imágenes se usan en el **Test de Rendimiento de Generación de PDF** (`ImageRenderTest`), que compara cuánto tiempo tarda en generar un PDF con 46 imágenes según su tamaño.

## 🎯 ¿Qué mide el test?

**NO** mide el renderizado en React Native, sino el tiempo que tarda **react-native-html-to-pdf** en convertir un HTML (con 46 imágenes embebidas en base64) a un documento PDF.

## ✅ Estado Actual

Las imágenes **ya están copiadas** en:
```
✅ android/app/src/main/assets/images/original.jpg
✅ android/app/src/main/assets/images/optimized.jpg
```

**Importante:** Si modificás las imágenes aquí, debés copiarlas nuevamente a Android y reconstruir la app.

## 📁 Archivos necesarios

Debés agregar estas dos imágenes en este directorio:

### 1. **original.jpg** (~2MB)
- Imagen de alta resolución (por ejemplo: 4000x3000 píxeles)
- Tamaño aproximado: 2MB
- Formato: JPG
- Ubicación: `src/presentation/assets/images/original.jpg`

### 2. **optimized.jpg** (~300KB)
- Misma imagen pero optimizada (por ejemplo: 1200x900 píxeles)
- Tamaño aproximado: 300KB
- Formato: JPG
- Ubicación: `src/presentation/assets/images/optimized.jpg`

## 🛠️ Cómo Obtener las Imágenes

### Opción 1: Usar ImageMagick (Rápido y fácil) ⭐
```bash
# Instalar ImageMagick: https://imagemagick.org/script/download.php

# Navegar a este directorio
cd src/presentation/assets/images/

# Crear imagen original (4000x3000, ~2MB)
magick -size 4000x3000 gradient:blue-red -quality 95 original.jpg

# Crear imagen optimizada (1200x900, ~300KB)
magick original.jpg -resize 1200x900 -quality 75 optimized.jpg

# Verificar tamaños
ls -lh *.jpg
```

### Opción 2: Descargar de internet
1. Descargá una imagen de alta resolución:
   - [Unsplash](https://unsplash.com/) - Fotos gratis de alta calidad
   - [Pexels](https://pexels.com/) - Banco de imágenes gratis
2. Guardala como `original.jpg` (asegurate que sea ~2MB)
3. Optimizala usando herramientas online:
   - [TinyJPG](https://tinyjpg.com/) - Compresión de imágenes
   - [Squoosh](https://squoosh.app/) - Optimizador de Google
4. Guardá la versión optimizada como `optimized.jpg` (~300KB)

### Opción 3: Usar tu propia imagen
1. Tomá una foto de alta calidad con tu celular
2. Transferila a tu computadora
3. Guardala como `original.jpg`
4. Usa herramientas de edición para crear una versión reducida:
   - Photoshop, GIMP, Paint.NET
   - Reducí las dimensiones a ~1200x900
   - Ajustá la calidad a 75%
5. Guardá como `optimized.jpg`

## 📊 ¿Qué va a pasar con estas imágenes?

Cuando ejecutes el test:

### 🔴 Test con Originales
- Genera un PDF que incluye `original.jpg` 46 veces
- El PDF resultante pesará ~100MB+
- Tardará varios segundos en generarse
- Consumirá más memoria del dispositivo

### 🟢 Test con Optimizadas
- Genera un PDF que incluye `optimized.jpg` 46 veces
- El PDF resultante pesará ~15-20MB
- Se generará mucho más rápido
- Consumo moderado de memoria

## 📈 Resultados esperados

| Tipo | Tamaño por imagen | Total imágenes | PDF resultante | Tiempo aprox. |
|------|-------------------|----------------|----------------|---------------|
| Original | ~2MB | 46 | ~100MB | 8-15 segundos |
| Optimizada | ~300KB | 46 | ~15-20MB | 2-5 segundos |

*Los tiempos varían según el dispositivo*

## ⚠️ ¿Es obligatorio agregar las imágenes?

**No, pero es altamente recomendado.** El test funcionará con o sin ellas:

- ✅ **Con imágenes reales:** Obtendrás resultados reales y precisos
- ⚠️ **Sin imágenes:** El test usará placeholders SVG (no reflejará el rendimiento real)

## 🔍 Verificar que las imágenes estén correctas

Después de agregar las imágenes, verificá:

```bash
# Listar archivos con tamaños
ls -lh src/presentation/assets/images/*.jpg

# Deberías ver algo como:
# -rw-r--r-- 1 user user 1.9M Oct 29 14:30 original.jpg
# -rw-r--r-- 1 user user 285K Oct 29 14:30 optimized.jpg
```

## 🚀 Una vez agregadas las imágenes

1. Reiniciá Metro Bundler si está corriendo
   ```bash
   npm start -- --reset-cache
   ```

2. Ejecutá la app
   ```bash
   npm run android  # o ios
   ```

3. Navegá al "🧪 Test de Rendimiento de Imágenes"

4. Ejecutá ambos tests y compará resultados

## 💡 Tips

- **Misma imagen:** Usá la misma foto para ambas versiones (solo cambia el tamaño/calidad)
- **Tamaños reales:** Asegurate que original.jpg sea realmente ~2MB y optimized.jpg ~300KB
- **Formato JPG:** No uses PNG (son más pesados)
- **Contenido visual:** Usá una imagen con detalles (paisaje, ciudad) para ver mejor la diferencia

## 🐛 Problemas comunes

### "Error al generar PDF"
- Verificá que las imágenes existan en la ruta correcta
- Asegurate que sean formato JPG válido
- Reiniciá la app

### "Las imágenes no aparecen en el PDF"
- Verificá que los nombres sean exactamente `original.jpg` y `optimized.jpg`
- Verificá que estén en `src/presentation/assets/images/`

### "El test tarda mucho con originales"
- Es normal! Las imágenes de 2MB tardan más en procesarse
- Si tarda más de 30 segundos, puede ser problema de memoria del dispositivo

## 🔄 Copiar imágenes a Android

Después de agregar o modificar las imágenes aquí, **DEBÉS copiarlas a Android**:

### Opción A: Script automático (Recomendado)

```bash
# Desde la raíz del proyecto
.\scripts\copy-test-images.ps1
```

### Opción B: Manual

```bash
Copy-Item "src\presentation\assets\images\*.jpg" -Destination "android\app\src\main\assets\images\"
```

### ⚠️ Importante: Reconstruir la app

```bash
npm start -- --reset-cache
npm run android
```

## 📚 Más información

Ver: `INSTRUCCIONES_TEST_IMAGENES.md` en la raíz del proyecto para documentación completa.

---

**¡Listo! Agregá las imágenes y empezá a testear! 🎉**
