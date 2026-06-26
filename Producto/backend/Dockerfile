# Etapa 1: Compilación (Build)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# 1. Copiar el archivo de configuración de Maven para descargar las dependencias
COPY pom.xml .
# Esto descarga las dependencias y las guarda en caché para que los siguientes builds sean rápidos
RUN mvn dependency:go-offline

# 2. Copiar el código fuente del proyecto
COPY src ./src

# 3. Compilar el proyecto y generar el archivo .jar (saltándose los tests para ahorrar tiempo en el despliegue)
RUN mvn clean package -DskipTests

# Etapa 2: Entorno de ejecución ligero (Run)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar únicamente el archivo .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto en el que corre tu API (Spring Boot por defecto usa el 8080)
EXPOSE 8080

# Comando para ejecutar la aplicación al levantar el contenedor
ENTRYPOINT ["java", "-jar", "app.jar"]