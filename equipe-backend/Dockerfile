# Fase 1: Build (Ambiente padronizado Temurin / glibc)
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copia o pom.xml respeitando a estrutura do repositório
COPY energiai/pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código fonte e compila
COPY energiai/src ./src
RUN mvn clean package -DskipTests

# Fase 2: Runtime (Ambiente enxuto, seguro e com suporte a JNI C++)
FROM eclipse-temurin:21-jre
WORKDIR /app

# Instala curl para o Healthcheck e limpa o cache do apt para reduzir a imagem
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Segurança: Cria grupo e usuário não-root sem registro de lastlog (-l)
RUN groupadd -r spring \
  && useradd -r -l -g spring spring
USER spring:spring

# Healthcheck nativo garantindo que a aplicação está respondendo
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health/ || exit 1

# Copia o JAR da Fase 1
COPY --from=builder /app/target/*.jar app.jar

# Expõe a porta
EXPOSE 8080

# Variável de ambiente para injeção de parâmetros dinâmicos na OCI
ENV JAVA_OPTS=""

# Entrypoint usando shell form para resolver variáveis de ambiente no boot
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar"]
