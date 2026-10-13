
package com.myskincare.skincare;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "*")
public class HelloController {

    @GetMapping("/api/hello")
    public String hello() {
        return "Hello! Your skincare backend is working!";
    }
}
