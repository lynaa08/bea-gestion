package com.bea.gestion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables Spring's @Async support so email sending never blocks HTTP threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}