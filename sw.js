
self.addEventListener("push", function (event) {
    let data = {
        title: "My Skincare Reminder",
        body: "It's 11:30 pm! Time for your night skincare routine. 🧴"
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (error) {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "./icon.png",
            badge: "./icon.png",
            data: { url: "./" }
        })
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(
            event.notification.data?.url || "./"
        )
    );
});
