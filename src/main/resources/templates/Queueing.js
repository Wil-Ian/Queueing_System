// init as global var
let selectedStatus = "";
let selectedCategory = "";
let currentScreen = "startScreen";
let screenHistory = [];

function showScreen(screenId, addToHistory = true) {
    const screens = [
        "startScreen",
        "priorityScreen",
        "categoryScreen",
        "appointmentScreen",
        "nameScreen",
        "resultScreen"];

    if (addToHistory && currentScreen !== screenId) {
        screenHistory.push(currentScreen);
    }

    currentScreen = screenId;

    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.toggle("active", id === screenId);
        }
    });
}

function goBack() {
    const previousScreen = screenHistory.pop() || "startScreen";
    showScreen(previousScreen, false);
}

function setLoading(isLoading) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
        overlay.classList.toggle("active", isLoading);
    }
}

function resetFlow() {
    selectedStatus = "";
    selectedCategory = "";
    screenHistory = [];
    currentScreen = "startScreen";

    const nameInput = document.getElementById("nameInput");
    if (nameInput) {
        nameInput.value = "";
    }

    const officeSelect = document.getElementById("officeSelect");
    if (officeSelect) {
        officeSelect.selectedIndex = 0;
    }
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

// back button handlers
document.querySelectorAll(".back_btn").forEach(button => {
    button.addEventListener("click", goBack);
});

// return to start from result
document.getElementById("resultSubmit")?.addEventListener("click", function() {
    resetFlow();
    showScreen("startScreen", false);
});

// fetch window
document.getElementById("nameSubmit").addEventListener("click", function() {
    const personName = document.getElementById("nameInput").value.trim();

    setLoading(true);

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
                .then(response => {
                    return response.json().then(body => {
                        if (!response.ok) {
                            const err = new Error(body.error);
                            err.code = body.code;
                            throw err;
                        }
                        return body;
                    });
                })
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
            setLoading(false);
            showScreen("resultScreen");
        })
        .catch(error => {
            console.error("Queue submission failed:", error);
            if(error.code === "DUPLICATE_NAME") {
                alert("Duplicate name already in queue.")
                setLoading(false);
                showScreen("nameScreen");
            } else {
                setLoading(false);
                showScreen("resultScreen");
            }

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