package com.epam.indigoeln;

import com.epam.indigoeln.core.service.print.itext2.utils.PdfConst;
import com.lowagie.text.FontFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;

@SpringBootApplication
public class Application extends SpringBootServletInitializer {

    public static class Profile {
        public static final String DEV = "dev";
        private Profile() {
        }
    }

    /**
     * Main method, used to run the application.
     */
    public static void main(String[] args) {
        FontFactory.registerDirectory(PdfConst.FONT_FAMILY_ARIAL);
        FontFactory.registerDirectory(PdfConst.FONT_FAMILY_TREBUCHET_MS);
        SpringApplication.run(Application.class, args);
    }

    /**
     * Run application in servlet container
     */
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(Application.class);
    }
}
