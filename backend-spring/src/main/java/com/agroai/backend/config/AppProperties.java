package com.agroai.backend.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String jwtSecret;
    private long jwtExpirationHours = 24;
    private String nodeEnv = "development";
    private String frontendUrl;
    private boolean mockMode = false;
    private String geminiApiKey;
    private String weatherApiKey;
    private ThingSpeak thingspeak = new ThingSpeak();
    private MlModel mlModel = new MlModel();

    public String getJwtSecret() {
        return jwtSecret;
    }

    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    public long getJwtExpirationHours() {
        return jwtExpirationHours;
    }

    public void setJwtExpirationHours(long jwtExpirationHours) {
        this.jwtExpirationHours = jwtExpirationHours;
    }

    public String getNodeEnv() {
        return nodeEnv;
    }

    public void setNodeEnv(String nodeEnv) {
        this.nodeEnv = nodeEnv;
    }

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    public boolean isMockMode() {
        return mockMode;
    }

    public void setMockMode(boolean mockMode) {
        this.mockMode = mockMode;
    }

    public String getGeminiApiKey() {
        return geminiApiKey;
    }

    public void setGeminiApiKey(String geminiApiKey) {
        this.geminiApiKey = geminiApiKey;
    }

    public String getWeatherApiKey() {
        return weatherApiKey;
    }

    public void setWeatherApiKey(String weatherApiKey) {
        this.weatherApiKey = weatherApiKey;
    }

    public ThingSpeak getThingspeak() {
        return thingspeak;
    }

    public void setThingspeak(ThingSpeak thingspeak) {
        this.thingspeak = thingspeak;
    }

    public MlModel getMlModel() {
        return mlModel;
    }

    public void setMlModel(MlModel mlModel) {
        this.mlModel = mlModel;
    }

    public static class ThingSpeak {

        private String channelId;
        private String readApiKey;
        private String writeApiKey;

        public String getChannelId() {
            return channelId;
        }

        public void setChannelId(String channelId) {
            this.channelId = channelId;
        }

        public String getReadApiKey() {
            return readApiKey;
        }

        public void setReadApiKey(String readApiKey) {
            this.readApiKey = readApiKey;
        }

        public String getWriteApiKey() {
            return writeApiKey;
        }

        public void setWriteApiKey(String writeApiKey) {
            this.writeApiKey = writeApiKey;
        }
    }

    public static class MlModel {

        private String url;
        private List<String> fallbackUrls = new ArrayList<>();

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public List<String> getFallbackUrls() {
            return fallbackUrls;
        }

        public void setFallbackUrls(List<String> fallbackUrls) {
            this.fallbackUrls = fallbackUrls;
        }
    }
}
