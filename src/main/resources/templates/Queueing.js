// init as global var
let selectedStatus = "";
let selectedCategory = "";

function showScreen(screenId) {
    const screens = [
        "startScreen",
        "priorityScreen",
        "categoryScreen",
        "appointmentScreen",
        "nameScreen",
        "resultScreen"];

    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = id === screenId ? "block" : "none";
        }
    });
}

// hide start, show priority
document.querySelector(".start_btn")?.addEventListener("click", function() {
    showScreen("priorityScreen");
});

// hide priority, show category
const buttonStatus = document.querySelectorAll(".status_btn");
buttonStatus.forEach(button => {
    button.addEventListener("click", function() {
        selectedStatus = button.value;
        showScreen("categoryScreen");
    });
});

// hide category, show name
const buttonCategory = document.querySelectorAll(".category_btn");
buttonCategory.forEach(button => {
    button.addEventListener("click", function() {
        selectedCategory = button.value;
        showScreen("nameScreen");
    });
});

// hide category, show appointments
document.getElementById("appoint")?.addEventListener("click", function() {
    showScreen("appointmentScreen");
});

// hide appointments, show name
document.getElementById("appointSubmit")?.addEventListener("click", function() {
    selectedCategory = document.getElementById("officeSelect").value;
    showScreen("nameScreen");
});

// return to start from result
document.getElementById("resultSubmit")?.addEventListener("click", function() {
    showScreen("startScreen");
});

// fetch window
document.getElementById("nameSubmit").addEventListener("click", function() {
    const personName = document.getElementById("nameInput").value.trim();

    fetch("https://localhost:8443/window")
        .then(response => response.json())
        .then(windows => {
            const matchedWindow = windows.find(window => window.category === selectedCategory);
            return fetch("https://localhost:8443/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: personName,
                    priority: selectedStatus
                })
            })
                .then(response => response.json())
                .then(createdUser => {
                    return fetch("https://localhost:8443/queue", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            user: {
                                userId: createdUser.userId
                            },
                            windowId: matchedWindow?.windowId
                        })
                    });
                });
        })
        .then(() => {
            showScreen("resultScreen");
        })
        .catch(error => {
            console.error("Queue submission failed:", error);
            showScreen("resultScreen");
        });
});

// time function
function updateDateTime() {
    const now = new Date();

    const options = {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    const dateElement = document.getElementById("current_time");

    if (dateElement) {
        dateElement.innerHTML = now.toLocaleString('en-US', options);
    }
}
updateDateTime();

// Call the function every 1000ms (1 second) to keep it in sync
setInterval(updateDateTime, 1000);

function updateDate() {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const dateElement = document.getElementById("current_date");

    // only update if the element exists on the page
    if (dateElement) {
        dateElement.innerHTML = new Date().toLocaleDateString('en-US', options);
    }
}
updateDate();