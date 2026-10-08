@echo off
echo ===========================
echo    Eboo Bakery - Dev Server
echo ===========================
echo.

:: Cek apakah node_modules ada
if not exist "node_modules" (
    echo [!] node_modules tidak ditemukan. Menginstall dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] npm install gagal.
        pause
        exit /b 1
    )
    echo.
)

echo [*] Menjalankan Next.js dev server...
echo [*] Buka http://localhost:3000 di browser
echo.
npm run dev

pause
