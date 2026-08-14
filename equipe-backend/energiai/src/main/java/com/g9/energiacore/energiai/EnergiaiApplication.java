package com.g9.energiacore.energiai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EnergiaiApplication {

	public static void main(String[] args) {
		SpringApplication.run(EnergiaiApplication.class, args);
	}

}
