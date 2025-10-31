# Script para copiar las imágenes de test a los assets de Android
# Uso: .\scripts\copy-test-images.ps1

Write-Host "`n🖼️  Copiando imágenes de test a assets de Android...`n" -ForegroundColor Cyan

$sourceDir = "src\presentation\assets\images"
$destDir = "android\app\src\main\assets\images"

# Crear directorio de destino si no existe
if (-not (Test-Path $destDir)) {
    Write-Host "📁 Creando directorio: $destDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

# Copiar original.jpg
if (Test-Path "$sourceDir\original.jpg") {
    Copy-Item "$sourceDir\original.jpg" -Destination "$destDir\original.jpg" -Force
    $size = (Get-Item "$sourceDir\original.jpg").Length / 1MB
    Write-Host "✅ original.jpg copiada ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "⚠️  original.jpg no encontrada en $sourceDir" -ForegroundColor Yellow
}

# Copiar optimized.jpg
if (Test-Path "$sourceDir\optimized.jpg") {
    Copy-Item "$sourceDir\optimized.jpg" -Destination "$destDir\optimized.jpg" -Force
    $size = (Get-Item "$sourceDir\optimized.jpg").Length / 1MB
    Write-Host "✅ optimized.jpg copiada ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "⚠️  optimized.jpg no encontrada en $sourceDir" -ForegroundColor Yellow
}

Write-Host "`n✨ Proceso completado!`n" -ForegroundColor Cyan
Write-Host "📝 Siguiente paso: Reconstruir la app" -ForegroundColor White
Write-Host "   npm start -- --reset-cache" -ForegroundColor Gray
Write-Host "   npm run android`n" -ForegroundColor Gray

