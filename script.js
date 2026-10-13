
document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.backgroundColor = "#AEC6CF";
document.body.style.margin = "0";
document.body.style.padding = "40px";

document.querySelector("h1").style.fontSize = "32px";


fetch("http://localhost:8080/api/hello")
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
