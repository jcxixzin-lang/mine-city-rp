@echo off
chcp 65001 >nul
title MINE CITY RP 3D - Servidor
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale a versao LTS em https://nodejs.org/ e abra este arquivo novamente.
  echo.
  pause
  exit /b 1
)
if not exist node_modules\ws (
  echo Preparando o multiplayer pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar a dependencia ws. Verifique sua internet.
    pause
    exit /b 1
  )
)
start "" "http://localhost:8080"
call npm start
pause
