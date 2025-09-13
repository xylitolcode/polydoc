package com.xylitol.polydoc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class PolydocServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PolydocServerApplication.class, args);
    }

    @RequestMapping(path = "/ping", method = RequestMethod.GET)
    public String ping() {
        return "pong";
    }
}
