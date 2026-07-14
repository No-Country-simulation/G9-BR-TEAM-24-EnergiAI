# Fase 1: Build (Ambiente de compilação)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
# Copia apenas o pom.xml primeiro para aproveitar o cache de camadas do Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B
# Copia o código fonte e compila
COPY src ./src
RUN mvn clean package -DskipTests

# Fase 2: Runtime (Ambiente de execução enxuto e seguro)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Segurança: Criar um usuário não-root para rodar a aplicação
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copia o jar da Fase 1
COPY --from=builder /app/target/*.jar app.jar

# Expõe a porta
EXPOSE 8080

# Entrypoint otimizado para containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
