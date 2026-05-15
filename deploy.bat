@echo off
:: GP Tournament Manager — Deploy Script (Windows)
:: Uso: doble clic o ejecutar desde CMD
:: ──────────────────────────────────────────────

setlocal EnableDelayedExpansion
set PORT=3000
set ROOT=%~dp0
cd /d "%ROOT%"

echo.
echo ================================================
echo   GP Tournament Manager ^— Despliegue Windows
echo ================================================
echo.

:: ─────────────────────────────────────────────────
:: Opcion 1: Docker Desktop
:: ─────────────────────────────────────────────────
docker info >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo [OK] Docker detectado. Usando Docker Compose...
  echo.

  if not exist data mkdir data

  docker compose down --remove-orphans >nul 2>&1
  docker compose up --build -d

  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Compose fallo. Intenta con Node.js.
    goto :node_fallback
  )

  echo.
  call :show_urls
  echo Para detener: docker compose down
  echo.
  pause
  exit /b 0
)

:node_fallback
:: ─────────────────────────────────────────────────
:: Opcion 2: Node.js directo
:: ─────────────────────────────────────────────────
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Ni Docker ni Node.js estan instalados.
  echo.
  echo   Instala una de estas opciones:
  echo   * Docker Desktop: https://www.docker.com/products/docker-desktop
  echo   * Node.js 20+:    https://nodejs.org
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo [OK] Node.js %NODE_VER% detectado. Instalando sin Docker...
echo.

echo [1/3] Instalando dependencias del servidor...
call npm install --prefix server >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] npm install en server fallo.
  pause
  exit /b 1
)

echo [2/3] Instalando dependencias del cliente...
call npm install --prefix client >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] npm install en client fallo.
  pause
  exit /b 1
)

echo [3/3] Compilando cliente React...
call npm run build --prefix client
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Build del cliente fallo.
  pause
  exit /b 1
)

if not exist data mkdir data

echo.
echo [OK] Build completado.

call :show_urls
echo Presiona Ctrl+C para detener el servidor.
echo.

set NODE_ENV=production
set DATA_DIR=%ROOT%data
node server/index.js
pause
exit /b 0

:: ─────────────────────────────────────────────────
:show_urls
echo.
echo [SERVER] Puerto %PORT%
echo.
echo   Acceso local:      http://localhost:%PORT%
echo   Panel de control:  http://localhost:%PORT%/control
echo   Vista publica:     http://localhost:%PORT%/view
echo.
echo   Red local (otros dispositivos):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
  set IP=%%a
  set IP=!IP: =!
  if not "!IP!"=="127.0.0.1" (
    echo     http://!IP!:%PORT%/view
  )
)
echo.
goto :eof
