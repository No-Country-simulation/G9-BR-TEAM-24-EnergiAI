# ==============================================================================
# Fase 1: Build (Ambiente de compilação padronizado)
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-21 AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas o pom.xml primeiro (aproveita o cache do Docker se as dependências não mudarem)
COPY energiai/pom.xml .

# Baixa as dependências do Maven (modo offline) para acelerar builds futuros
RUN mvn dependency:go-offline -B

# Copia o restante do código fonte do projeto
COPY energiai/src ./src

# Compila o projeto gerando o arquivo .jar (ignorando testes para acelerar o build)
RUN mvn clean package -DskipTests

# ==============================================================================
# Fase 2: Runtime (Ambiente enxuto, seguro e com suporte a JNI C++/glibc)
# ==============================================================================
FROM eclipse-temurin:21-jre

# Define o diretório de trabalho para a execução da aplicação
WORKDIR /app

# Atualiza os pacotes, instala o 'curl' para o Healthcheck e limpa o cache para reduzir o tamanho da imagem
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Segurança: Cria grupo e usuário restrito (não-root). O '-l' evita criar logs desnecessários (lastlog)
RUN groupadd -r spring \
  && useradd -r -l -g spring spring

# Otimização: Copia o JAR da Fase 1 e, na mesma linha, já transfere a posse do arquivo para o usuário 'spring'
COPY --chown=spring:spring --from=builder /app/target/*.jar app.jar

# Segurança: Troca do usuário 'root' (padrão) para o usuário restrito criado acima
USER spring:spring

# Documenta qual porta a aplicação utiliza (o Spring Boot roda na 8080)
EXPOSE 8080

# Monitoramento: Verifica a saúde da aplicação a cada 30s. Dá 40s de carência no boot para o Java e a IA carregarem
HEALTHCHECK \
  --interval=30s \
  --timeout=3s \
  --start-period=40s \
  --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health/ || exit 1

# Flexibilidade: Variável vazia por padrão, mas permite injetar memória ou profiles (-Dspring.profiles.active=prod) na OCI
ENV JAVA_OPTS=""

# Execução: Usa 'exec' para o Java herdar o PID 1 (permitindo encerramento gracioso) e ajusta a memória máxima do container
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar"]
