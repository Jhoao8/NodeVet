@echo off
title Backend NodeVet - Spring Boot
echo Iniciando el servidor de NodeVet...
echo.

cd backend

call ./mvnw clean spring-boot:run

pause