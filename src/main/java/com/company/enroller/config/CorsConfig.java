package com.company.enroller.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Zezwól na określone origins
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("https://enroller-fullstack-30eq.onrender.com");

        // Zezwól na credentials (ciasteczka, nagłówki autoryzacji)
        config.setAllowCredentials(true);

        // Zezwól na wszystkie headery
        config.addAllowedHeader("*");

        // Zezwól na wszystkie metody HTTP
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}