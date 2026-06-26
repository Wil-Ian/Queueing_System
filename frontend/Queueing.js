// init as global var
let selectedStatus = "";
let selectedCategory = "";

// hide priority, show category
const buttonStatus = document.querySelectorAll(".status_btn");
buttonStatus.forEach(button => {
    button.addEventListener("click", function() {
        selectedStatus = button.value;
        document.getElementById("priorityScreen").style.display = "none";
        document.getElementById("categoryScreen").style.display = "block";
    });
});

// hide category, show name
const buttonCategory = document.querySelectorAll(".category_btn");
buttonCategory.forEach(button => {
    button.addEventListener("click", function() {
        selectedCategory = button.value;
        document.getElementById("categoryScreen").style.display = "none";
        document.getElementById("nameScreen").style.display = "block";
    });
});

// hide category, show appointments
document.getElementById("appoint").addEventListener("click", function() {
    document.getElementById("categoryScreen").style.display = "none";
    document.getElementById("appointmentScreen").style.display= "block";
});

// hide appointments, show name
document.getElementById("appointSubmit").addEventListener("click", function() {
    selectedCategory = document.getElementById("officeSelect").value;
    document.getElementById("appointmentScreen").style.display = "none";
    document.getElementById("nameScreen").style.display = "block";
});

// fetch window
document.getElementById("nameSubmit").addEventListener("click", function() {
    const personName = document.getElementById("nameInput").value;

    fetch("https://localhost:8443/window")
        .then(response => response.json())
        .then(windows => {
            const matchedWindow = windows.find(window => window.category === selectedCategory);
            fetch("https://localhost:8443/users", {
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
                fetch("https://localhost:8443/queue", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user: {
                            userId: createdUser.userId
                        },
                        windowId: matchedWindow.windowId
                    })
                })
            })
        });
});