package com.agroai.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig {

    @Value("${MONGODB_URI:${SPRING_DATA_MONGODB_URI:}}")
    private String mongoUri;

    @Bean
    public MongoClient mongoClient() {
        if (mongoUri == null || mongoUri.isBlank()) {
            throw new IllegalStateException("MongoDB URI is not configured. Set MONGODB_URI or SPRING_DATA_MONGODB_URI.");
        }
        return MongoClients.create(mongoUri);
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        return new MongoTemplate(new SimpleMongoClientDatabaseFactory(mongoClient, getDatabaseName()));
    }

    private String getDatabaseName() {
        try {
            ConnectionString connectionString = new ConnectionString(mongoUri);
            String databaseName = connectionString.getDatabase();
            if (databaseName != null && !databaseName.isBlank()) {
                return databaseName;
            }
        } catch (Exception ignored) {
        }

        return "AgroAI";
    }
}