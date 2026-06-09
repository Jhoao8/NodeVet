package com.nodevet.app.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "nodevet")
@Data // Genera getters y setters
public class NodeVetProperties {

    private Admin admin = new Admin();

    @Data
    public static class Admin {
        private String email;
        private String password;
    }
}