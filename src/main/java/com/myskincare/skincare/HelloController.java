
package com.myskincare.skincare;

import java.security.Security;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;

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

        Object endpoint = subscription.get("endpoint");
        Object keysObject = subscription.get("keys");

        if (!(endpoint instanceof String url) || url.isBlank()
                || !(keysObject instanceof Map<?, ?> keys)
                || !(keys.get("p256dh") instanceof String)
                || !(keys.get("auth") instanceof String)) {
            return ResponseEntity.badRequest()
                    .body("Invalid push subscription.");
        }

        subscriptions.put(url, subscription);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Push subscription received.");
    }

    @GetMapping("/api/subscription-count")
    public Map<String, Integer> subscriptionCount() {
        return Map.of("count", subscriptions.size());
    }

    @PostMapping("/api/test-push")
    public ResponseEntity<String> testPush() {
        if (subscriptions.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("No registered devices.");
        }

        String publicKey = System.getenv("VAPID_PUBLIC_KEY");
        String privateKey = System.getenv("VAPID_PRIVATE_KEY");
        String subject = System.getenv("VAPID_SUBJECT");

        if (publicKey == null || privateKey == null || subject == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("VAPID environment variables are missing.");
        }

        try {
            Security.addProvider(new BouncyCastleProvider());

            PushService pushService =
                    new PushService(publicKey, privateKey, subject);

            int sent = 0;

            for (Map<String, Object> saved : subscriptions.values()) {
                Map<?, ?> keys = (Map<?, ?>) saved.get("keys");

                Subscription.Keys subscriptionKeys =
                        new Subscription.Keys(
                                (String) keys.get("p256dh"),
                                (String) keys.get("auth"));

                Subscription subscription =
                        new Subscription(
                                (String) saved.get("endpoint"),
                                subscriptionKeys);

                String payload = """
                        {
                          "title": "My Skincare Reminder",
                          "body": "Test successful! 🧴 Time for your night skincare routine.",
                          "url": "./"
                        }
                        """;

                pushService.send(new Notification(subscription, payload));
                sent++;
            }

            return ResponseEntity.ok("Push sent to " + sent + " device(s).");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Push failed: " + e.getClass().getSimpleName());
        }
    }
}
