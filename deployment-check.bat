@echo off
REM ================================================
REM Deployment Readiness Check Script - Windows
REM ================================================
REM Ez a script ellenorzi, hogy az alkalmazas keszen all-e a deployment-re
REM
REM Hasznalat:
REM   deployment-check.bat
REM

echo ================================================
echo Anime Streamer - Deployment Readiness Check
echo ================================================
echo.

set ERRORS=0
set WARNINGS=0

REM 1. Node.js verzio ellenorzes
echo ================================================
echo 1. Node.js Verzio Ellenorzes
echo ================================================

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js telepitve
    node -v
) else (
    echo [HIBA] Node.js nincs telepitve!
    set /a ERRORS+=1
)

echo.

REM 2. Package.json ellenorzes
echo ================================================
echo 2. Package.json Ellenorzes
echo ================================================

if exist "package.json" (
    echo [OK] package.json letezik
    
    findstr /C:"\"build\"" package.json >nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Build script megtalalhato
    ) else (
        echo [FIGYELEM] Build script hianzik
        set /a WARNINGS+=1
    )
    
    findstr /C:"\"start\"" package.json >nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Start script megtalalhato
    ) else (
        echo [FIGYELEM] Start script hianzik
        set /a WARNINGS+=1
    )
) else (
    echo [HIBA] package.json nem talalhato!
    set /a ERRORS+=1
)

echo.

REM 3. Node modules ellenorzes
echo ================================================
echo 3. Dependencies Ellenorzes
echo ================================================

if exist "node_modules" (
    echo [OK] node_modules mappa letezik
) else (
    echo [FIGYELEM] node_modules nincs telepitve - futtasd: npm install
    set /a WARNINGS+=1
)

echo.

REM 4. Environment valtozok ellenorzes
echo ================================================
echo 4. Environment Valtozok Ellenorzes
echo ================================================

if exist ".env" (
    echo [OK] .env fajl letezik
    
    findstr /C:"DATABASE_URL=" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] DATABASE_URL be van allitva
    ) else (
        echo [FIGYELEM] DATABASE_URL nincs definialva
        set /a WARNINGS+=1
    )
    
    findstr /C:"SESSION_SECRET=" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] SESSION_SECRET be van allitva
    ) else (
        echo [FIGYELEM] SESSION_SECRET nincs definialva
        set /a WARNINGS+=1
    )
    
    findstr /C:"NODE_ENV=production" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] NODE_ENV=production
    ) else (
        echo [INFO] NODE_ENV nincs production-ra allitva
    )
) else (
    echo [FIGYELEM] .env fajl nem talalhato! Masold a .env.example-t .env neven
    set /a WARNINGS+=1
)

echo.

REM 5. Build konyvtar ellenorzes
echo ================================================
echo 5. Build Konyvtar Ellenorzes
echo ================================================

if exist "dist" (
    echo [OK] dist/ konyvtar letezik
    
    if exist "dist\index.cjs" (
        echo [OK] dist\index.cjs letezik
    ) else (
        echo [FIGYELEM] dist\index.cjs nem talalhato - futtasd: npm run build
        set /a WARNINGS+=1
    )
    
    if exist "dist\client" (
        echo [OK] dist\client\ konyvtar letezik
    ) else (
        echo [FIGYELEM] dist\client\ nem talalhato - futtasd: npm run build
        set /a WARNINGS+=1
    )
) else (
    echo [INFO] dist/ konyvtar nem letezik - Az elso deployment elott futtasd: npm run build
)

echo.

REM 6. Database schema ellenorzes
echo ================================================  
echo 6. Database Schema Ellenorzes
echo ================================================

if exist "shared\schema.ts" (
    echo [OK] Database schema fajl letezik
) else (
    echo [FIGYELEM] shared\schema.ts nem talalhato
    set /a WARNINGS+=1
)

if exist "drizzle.config.ts" (
    echo [OK] Drizzle config letezik
) else (
    echo [FIGYELEM] drizzle.config.ts nem talalhato
    set /a WARNINGS+=1
)

echo.

REM 7. Git ellenorzes
echo ================================================
echo 7. Git Repository Ellenorzes
echo ================================================

if exist ".git" (
    echo [OK] Git repository inicializalva
    
    if exist ".gitignore" (
        echo [OK] .gitignore letezik
        
        findstr /C:"node_modules" .gitignore >nul
        if %ERRORLEVEL% EQU 0 (
            echo [OK] .gitignore tartalmazza a node_modules-t
        )
        
        findstr /C:".env" .gitignore >nul
        if %ERRORLEVEL% EQU 0 (
            echo [OK] .gitignore tartalmazza a .env-t
        ) else (
            echo [FIGYELEM] .env nincs a .gitignore-ban!
            set /a WARNINGS+=1
        )
    )
) else (
    echo [INFO] Git repository nincs inicializalva
)

echo.

REM 8. TypeScript ellenorzes
echo ================================================
echo 8. TypeScript Ellenorzes
echo ================================================

if exist "tsconfig.json" (
    echo [OK] tsconfig.json letezik
) else (
    echo [FIGYELEM] tsconfig.json nem talalhato
    set /a WARNINGS+=1
)

echo.

REM Osszegzes
echo ================================================
echo Osszegzes
echo ================================================

if %ERRORS% EQU 0 (
    if %WARNINGS% EQU 0 (
        echo.
        echo [SIKER] Minden rendben! Az alkalmazas keszen all a deployment-re!
        echo.
        echo Kovetkezo lepesek:
        echo   1. npm run build    ^# Production build keszitese
        echo   2. npm run start    ^# Helyi teszteles production modban
        echo   3. Kovesd a DEPLOYMENT_GUIDE.md utasitasait
        echo.
        exit /b 0
    ) else (
        echo.
        echo [FIGYELEM] %WARNINGS% figyelmeztes talalhato
        echo.
        echo Az alkalmazas deployable, de javasolt a figyelmeztetesek ellenorzese.
        echo.
        exit /b 0
    )
) else (
    echo.
    echo [HIBA] %ERRORS% hiba es %WARNINGS% figyelmeztes talalhato
    echo.
    echo Javitsd a hibakat deployment elott!
    echo.
    exit /b 1
)
