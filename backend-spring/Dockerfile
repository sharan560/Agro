
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 3000

# Environment variables can be injected at runtime:
# PORT, MONGODB_URI, JWT_SECRET, FRONTEND_URL, GEMINI_API_KEY, WEATHER_API_KEY, MOCK_MODE
ENTRYPOINT ["java", "-jar", "app.jar"]
