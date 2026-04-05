# ─────────────────────────────────────────────────────────────────────────────
# Smart Crop Advisor — APK Build Script
# Run from project root: .\build-apk.ps1
# Prerequisites: Node.js, Android Studio, Java 17+
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🌾 Smart Crop Advisor — APK Builder" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Set-Location frontend

# 1. Build the React app
Write-Host "`n📦 Step 1: Building React app..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Build failed" -ForegroundColor Red; exit 1 }
Write-Host "✅ React build complete" -ForegroundColor Green

# 2. Init Capacitor (only first time)
if (-not (Test-Path "android")) {
    Write-Host "`n⚙️  Step 2: Initializing Capacitor..." -ForegroundColor Cyan
    npx cap init "Smart Crop Advisor" "com.smartcrop.advisor" --web-dir dist
    npx cap add android
    Write-Host "✅ Capacitor initialized" -ForegroundColor Green
} else {
    Write-Host "`n⚙️  Step 2: Syncing Capacitor..." -ForegroundColor Cyan
}

# 3. Sync web assets to Android
Write-Host "`n🔄 Step 3: Syncing to Android..." -ForegroundColor Cyan
npx cap sync android
Write-Host "✅ Sync complete" -ForegroundColor Green

Write-Host "`n🎉 Ready! Next steps:" -ForegroundColor Green
Write-Host "   Option A (Android Studio): npx cap open android" -ForegroundColor Yellow
Write-Host "              → Build > Generate Signed Bundle/APK" -ForegroundColor Yellow
Write-Host "   Option B (CLI, needs Gradle): cd android && .\gradlew assembleDebug" -ForegroundColor Yellow
Write-Host "              → APK at: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Yellow
Write-Host "`n📱 For PWA install (no APK needed):" -ForegroundColor Cyan
Write-Host "   1. Deploy frontend to any host (Vercel, Netlify, etc.)" -ForegroundColor White
Write-Host "   2. Open in Chrome on Android" -ForegroundColor White
Write-Host "   3. Tap 'Add to Home Screen'" -ForegroundColor White

Set-Location ..
