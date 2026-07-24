// Public queueing flow for visitors.
// This script controls the multi-step screen flow and stores the user choices
// that are later submitted to the backend queueing services.
let selectedStatus = "";
let selectedCategory = "";
let selectedOffice = "";
let currentScreen = "startScreen";
let screenHistory = [];
function showScreen(screenId, addToHistory = true) {
    const screens = [
        "startScreen",
        "priorityScreen",
        "categoryScreen",
        "appointmentScreen",
        "nameScreen",
        "resultScreen"
    ];

    // Determine direction based on whether we are saving history (Forward) or popping it (Back)
    const isForward = addToHistory;

    if (addToHistory && currentScreen !== screenId) {
        screenHistory.push(currentScreen);
    }

    currentScreen = screenId;

    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Remove previous animation classes to allow re-triggering
            element.classList.remove("active", "slide-forward", "slide-backward");

            if (id === screenId) {
                element.classList.add("active");
                element.classList.add(isForward ? "slide-forward" : "slide-backward");
            }
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
    selectedOffice = "";
    screenHistory = [];
    currentScreen = "startScreen";

    const nameInput = document.getElementById("nameInput");
    if (nameInput) {
        nameInput.value = "";
    }

    const consigneeInput = document.getElementById("consigneeInput");
    if (consigneeInput) {
        consigneeInput.value = "";
    }

    const officeSelect = document.getElementById("officeSelect");
    if (officeSelect) {
        officeSelect.selectedIndex = 0;
    }
}

function openPriorityModal() {
    document.getElementById("priorityModal")?.classList.add("active");
}

function closePriorityModal() {
    document.getElementById("priorityModal")?.classList.remove("active");
}

// hide start, show priority
document.querySelector(".start_btn")?.addEventListener("click", function() {
    showScreen("priorityScreen");
});

// hide priority, show category
const regularButton = document.getElementById("reg");
if (regularButton) {
    regularButton.addEventListener("click", function() {
        selectedStatus = regularButton.value;
        showScreen("categoryScreen");
    });
}

const priorityModalTrigger = document.getElementById("prioModal");
if (priorityModalTrigger) {
    priorityModalTrigger.addEventListener("click", function() {
        openPriorityModal();
    });
}

const closePriorityModalButton = document.getElementById("closeModal");
if (closePriorityModalButton) {
    closePriorityModalButton.addEventListener("click", function() {
        closePriorityModal();
    });
}

const confirmPriorityButton = document.getElementById("prio");
if (confirmPriorityButton) {
    confirmPriorityButton.addEventListener("click", function() {
        selectedStatus = confirmPriorityButton.value;
        closePriorityModal();
        showScreen("categoryScreen");
    });
}

// Category selection is stored here so the later submission step knows which
// window category the visitor selected.
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
    selectedOffice = document.getElementById("officeSelect").value;
    selectedCategory = "Appointment";
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

// Final submission step:
// 1. Resolve the matching window category.
// 2. Create the user record.
// 3. Add the user to the queue.
document.getElementById("nameSubmit").addEventListener("click", function() {
    const personName = document.getElementById("nameInput").value.trim();
    const consigneeName = document.getElementById("consigneeInput").value.trim();

    setLoading(true);

    fetch("/window")
        .then(response => response.json())
        .then(windows => {
            const matchedWindow = windows.find(window => window.category === selectedCategory);
            return fetch("/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: personName,
                    consignee: consigneeName,
                    priority: selectedStatus,
                    office: selectedOffice
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
                    return fetch("/queue", {
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
                alert("Duplicate name already in queue.");
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