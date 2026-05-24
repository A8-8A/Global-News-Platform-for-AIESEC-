# =====================================================================
# Multi-stage Docker build for Render.
#
# Stage 1 builds the jar with Maven; stage 2 ships only the JRE + jar,
# keeping the final image small.
# =====================================================================

# ---- Stage 1: build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Cache dependencies: copy pom first, resolve, THEN copy source.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Stage 2: runtime ----
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /build/target/*.jar app.jar

# Render provides $PORT; Spring reads it via server.port in application.yml.
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
