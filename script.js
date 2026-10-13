
const VAPID_PUBLIC_KEY = "BKBU3NFeOh73qn-s-GA6uL1zl3oGcBFFFk7dwiV7wy3TG7tY9aacTyM-6s79YToX1NJpoGw6oL1Nv33Xix6aV1c";

document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.backgroundColor = "#AEC6CF";
document.body.style.margin = "0";
document.body.style.padding = "40px";

const heading = document.querySelector("h1");
if (heading) {
    heading.style.fontSize = "32px";
}

// Check that the Spring Boot backend is reachable.
fetch("https://my-skincare.onrender.com/api/hello")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
    })
    .then(message => console.log(message))
    .catch(error => console.log("Could not connect to Java backend:", error));

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = atob(base64);
    return Uint8Array.from(
        rawData,
        character => character.charCodeAt(0)
    );
}

// Enable push notifications and register this device with the backend.
const enableButton = document.getElementById("enableNotifications");

if (enableButton) {
    enableButton.addEventListener("click", async function () {
        const status = document.getElementById("notificationStatus");

        if (
            !("Notification" in window) ||
            !("serviceWorker" in navigator) ||
            !("PushManager" in window)
        ) {
            status.textContent =
                "Push notifications are not supported in this browser.";
            return;
        }

        try {
            const permission = await Notification.requestPermission();

            if (permission !== "granted") {
                status.textContent =
                    "Notification permission was not granted.";
                return;
            }

            status.textContent = "Preparing push notifications...";

            const registration = await navigator.serviceWorker.ready;
            let subscription =
                await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey:
                        urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
            }

            const response = await fetch(
                "https://my-skincare.onrender.com/api/subscribe",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(subscription)
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Backend could not save subscription (HTTP ${response.status})`
                );
            }

            status.textContent =
                "Push subscription saved successfully! 🧴";
        } catch (error) {
            console.error("Push subscription error:", error);
            status.textContent = "Push setup failed: " + error.message;
        }
    });
}

// Display a local test notification on this device.
const testButton = document.getElementById("testNotification");

if (testButton) {
    testButton.addEventListener("click", async function () {
        if (!("Notification" in window)) {
            alert("Notifications are not supported.");
            return;
        }

        if (Notification.permission !== "granted") {
            alert("Please enable notifications first.");
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            await registration.showNotification("My Skincare Reminder", {
                body: "Test successful! 🧴 It's time for your night skincare routine.",
                icon: "./icon.png",
                data: { url: "./" }
            });
        } catch (error) {
            console.error(error);
            alert("Could not display the test notification.");
        }
    });
}
