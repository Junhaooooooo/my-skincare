
package com.myskincare.skincare;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class HelloController {

    private final Map<String, Map<String, Object>> subscriptions =
            new ConcurrentHashMap<>();

    @GetMapping("/api/hello")
    public String hello() {
        return "Hello! Your skincare backend is working!";
    }

    @PostMapping("/api/subscribe")
    public ResponseEntity<String> subscribe(
            @RequestBody Map<String, Object> subscription) {

        Object endpointObject = subscription.get("endpoint");

        if (!(endpointObject instanceof String endpoint)
                || endpoint.isBlank()
                || !(subscription.get("keys") instanceof Map<?, ?> keys)
                || !(keys.get("p256dh") instanceof String)
                || !(keys.get("auth") instanceof String)) {
            return ResponseEntity.badRequest()
                    .body("Invalid push subscription.");
        }

        subscriptions.put(endpoint, subscription);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Push subscription received.");
    }

    @GetMapping("/api/subscription-count")
    public Map<String, Integer> subscriptionCount() {
        return Map.of("count", subscriptions.size());
    }
}
