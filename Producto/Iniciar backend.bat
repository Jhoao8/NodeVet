@echo off
title Backend NodeVet - Docker
echo Iniciando el servidor de NodeVet en Docker...
echo.

cd backend

docker compose up --build

pause