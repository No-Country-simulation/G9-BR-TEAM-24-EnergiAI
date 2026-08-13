package com.g9.energiacore.energiai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig implements BeanPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        if (bean instanceof DataSourceProperties properties) {
            String url = properties.getUrl();
            if (url != null) {
                if (url.startsWith("postgresql://")) {
                    String adaptedUrl = "jdbc:" + url;
                    log.info("DATABASE_URL adaptada do formato 'postgresql://' para o formato JDBC 'jdbc:postgresql://'");
                    properties.setUrl(adaptedUrl);
                } else if (url.startsWith("postgres://")) {
                    String adaptedUrl = "jdbc:postgresql://" + url.substring("postgres://".length());
                    log.info("DATABASE_URL adaptada do formato 'postgres://' para o formato JDBC 'jdbc:postgresql://'");
                    properties.setUrl(adaptedUrl);
                }
            }
        }
        return bean;
    }
}
