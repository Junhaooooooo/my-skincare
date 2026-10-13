
document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.backgroundColor = "#AEC6CF";
document.body.style.margin = "0";
document.body.style.padding = "40px";

document.querySelector("h1").style.fontSize = "32px";


fetch("https://my-skincare.onrender.com/api/hello")
    .then(response => response.text())
    .then(message => {
        console.log(message);
    })
    .catch(error => {
        console.log("Could not connect to Java backend:", error);
    });


// skincare reminder at 3:00 pm
if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            const now = new Date();
            const reminderTime = new Date();

            reminderTime.setHours(16, 1, 0, 0);

            // If 3:00 pm has already passed, schedule tomorrow
            if (reminderTime <= now) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }

            const delay = reminderTime.getTime() - now.getTime();

            setTimeout(() => {
                new Notification("My Skincare Reminder", {
                    body: "It's 3:00 pm! Time for your skincare routine. 🧴"
                });
            }, delay);

            console.log("3:00 pm skincare reminder scheduled!");
        }
    });
}


document.getElementById("enableNotifications").addEventListener("click", async function () {
    const status = document.getElementById("notificationStatus");

    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        status.textContent = "Push notifications are not supported in this browser.";
        return;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            status.textContent = "Notification permission granted!";
        } else {
            status.textContent = "Notification permission was not granted.";
        }
    } catch (error) {
        status.textContent = "Could not request notification permission.";
        console.error(error);
    }
});


document.getElementById("testNotification").addEventListener("click", async function () {
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
            icon: "./icon.png"
        });
    } catch (error) {
        console.error(error);
        alert("Could not display the test notification. Check the browser console.");
    }
});
