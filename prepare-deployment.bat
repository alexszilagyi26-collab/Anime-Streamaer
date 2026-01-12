@echo off
REM ==================================================
REM RockHost FTP Upload Helper - Anime Streamer
REM ==================================================
REM
REM Ez a script segit osszeallitani a feltoltendo fajlokat
REM

echo ==================================================
echo RockHost Deployment - Fajl Lista Eloallitasa
echo ==================================================
echo.

set PROJECT_DIR=c:\Users\alexs\Downloads\Anime-Streamer\Anime-Streamer
set DEPLOY_DIR=%PROJECT_DIR%\rockhost-deploy

echo Projekt konyvtar: %PROJECT_DIR%
echo Deploy konyvtar: %DEPLOY_DIR%
echo.

REM Toroljuk a regi deploy mappat ha letezik
if exist "%DEPLOY_DIR%" (
    echo Regi deploy mappa torlese...
    rmdir /s /q "%DEPLOY_DIR%"
)

REM Uj deploy mappa letrehozasa
echo Uj deploy mappa letrehozasa...
mkdir "%DEPLOY_DIR%"

echo.
echo ==================================================
echo Fajlok masolasa...
echo ==================================================
echo.

REM Mappastruktúra másolása (fontos fájlok)
echo [1/14] client mappa masolasa...
xcopy "%PROJECT_DIR%\client" "%DEPLOY_DIR%\client\" /E /I /Q

echo [2/14] server mappa masolasa...
xcopy "%PROJECT_DIR%\server" "%DEPLOY_DIR%\server\" /E /I /Q

echo [3/14] shared mappa masolasa...
xcopy "%PROJECT_DIR%\shared" "%DEPLOY_DIR%\shared\" /E /I /Q

echo [4/14] script mappa masolasa...
xcopy "%PROJECT_DIR%\script" "%DEPLOY_DIR%\script\" /E /I /Q

echo [5/14] package.json masolasa...
copy "%PROJECT_DIR%\package.json" "%DEPLOY_DIR%\" >nul

echo [6/14] package-lock.json masolasa...
copy "%PROJECT_DIR%\package-lock.json" "%DEPLOY_DIR%\" >nul

echo [7/14] tsconfig.json masolasa...
copy "%PROJECT_DIR%\tsconfig.json" "%DEPLOY_DIR%\" >nul

echo [8/14] vite.config.ts masolasa...
copy "%PROJECT_DIR%\vite.config.ts" "%DEPLOY_DIR%\" >nul

echo [9/14] tailwind.config.ts masolasa...
copy "%PROJECT_DIR%\tailwind.config.ts" "%DEPLOY_DIR%\" >nul

echo [10/14] drizzle.config.ts masolasa...
copy "%PROJECT_DIR%\drizzle.config.ts" "%DEPLOY_DIR%\" >nul

echo [11/14] postcss.config.js masolasa...
copy "%PROJECT_DIR%\postcss.config.js" "%DEPLOY_DIR%\" >nul

echo [12/14] components.json masolasa...
copy "%PROJECT_DIR%\components.json" "%DEPLOY_DIR%\" >nul

echo [13/14] .htaccess masolasa...
copy "%PROJECT_DIR%\.htaccess" "%DEPLOY_DIR%\" >nul

echo [14/14] .env.example masolasa...
copy "%PROJECT_DIR%\.env.example" "%DEPLOY_DIR%\" >nul

REM README és dokumentációk másolása
echo.
echo Dokumentaciok masolasa...
copy "%PROJECT_DIR%\README.md" "%DEPLOY_DIR%\" >nul 2>nul
copy "%PROJECT_DIR%\DEPLOYMENT_GUIDE.md" "%DEPLOY_DIR%\" >nul 2>nul
copy "%PROJECT_DIR%\ROCKHOST_QUICK_DEPLOY.md" "%DEPLOY_DIR%\" >nul 2>nul

echo.
echo ==================================================
echo KESZ!
echo ==================================================
echo.
echo A feltoltendo fajlok itt vannak:
echo %DEPLOY_DIR%
echo.
echo Kovetkezo lepesek:
echo.
echo 1. Nyisd meg FileZilla-t vagy WinSCP-t
echo 2. Csatlakozz a RockHost FTP szerverhez
echo 3. Toltsd fel a rockhost-deploy mappaban levo OSSZES fajlt
echo 4. SSH-val csatlakozz a szerverhez
echo 5. Futtasd: npm install
echo 6. Futtasd: npm run build
echo 7. Hozd letre a .env fajlt a szerve ren
echo 8. Futtasd: npm run db:push
echo 9. Inditsd el PM2-vel: pm2 start dist/index.cjs --name anime-streamer
echo.
echo Reszletes utmutato: ROCKHOST_QUICK_DEPLOY.md
echo.

echo Nyomd meg barmely billentyut a deploy mappa megnyitasahoz...
pause >nul

REM Nyisd meg a deploy mappát
explorer "%DEPLOY_DIR%"
