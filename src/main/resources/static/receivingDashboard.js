const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlbXBsb3llZUB0ZXN0LmNvbSIsInJvbGUiOiJFTVBMT1lFRSIsImp0aSI6IjBlZmM5N2ViLWY5ZTAtNDE1ZS1hM2Y1LWU5MTJiZmMzNjljMSIsImlhdCI6MTc4MzMyNjEzNSwiZXhwIjoxNzgzMzI5NzM1fQ.KxiIZG6K-QD9_dZX61N4o-6fcvsx9AufbynQrpkLXpE";
let currentServingId = null;
let currentWindowId = null;

function loadDashboard() {
    fetch("https://localhost:8443/employee/me", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(employee => {
            const windowId = employee.window.windowId;
            currentWindowId = windowId;
            const employeeName = document.getElementById("employeeName");
            const windowTitle = document.getElementById("windowTitle");

            if (employeeName) {
                employeeName.innerHTML = employee.name;
            }
            if (windowTitle) {
                windowTitle.innerHTML = employee.window.category;
            }

            const mainFetch = Promise.all([
                fetch(`https://localhost:8443/queue/window-queue?windowId=${windowId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }),
                fetch(`https://localhost:8443/queue/reports/queue-count?windowId=${windowId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }),
                fetch(`https://localhost:8443/queue/reports/missed-count?windowId=${windowId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }),
                fetch(`https://localhost:8443/queue/reports/daily-volume?windowId=${windowId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }),
                fetch(`https://localhost:8443/queue/reports/transfer-count?windowId=${windowId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
            ]).then(responses => {
                return Promise.all(responses.map(response => response.json()));
            })
                .then(([queues, queueCount, missedCount, dailyVolume, transferCount]) => {
                    const queueTable = document.getElementById("queueTable");
                    const totalQueue = document.getElementById("totalQueue");
                    const totalMissed = document.getElementById("totalMissed");
                    const totalComplete = document.getElementById("totalComplete");
                    const totalReferred = document.getElementById("totalReferred");

                    // queue table
                    if (queueTable) {
                        queueTable.innerHTML = "";
                        queues.forEach(queue => {
                            const row = document.createElement("tr");
                            row.innerHTML = `
                    <td>${queue.user.name}</td>
                    <td>${queue.timeStamp}</td>
                    <td>${queue.user.priority}</td>
                    <td>${queue.callCount}</td>
                    <td>
                        <input type="button" value="Modify User" onclick="requeueUser('${queue.queueId}')">
                    </td>
                    `;
                            queueTable.appendChild(row);
                        });
                    }

                    if (totalQueue) {
                        totalQueue.innerHTML = queueCount;
                    }

                    if (totalMissed) {
                        totalMissed.innerHTML = missedCount;
                    }
                    if (totalComplete) {
                        totalComplete.innerHTML = dailyVolume;
                    }
                    if (totalReferred) {
                        totalReferred.innerHTML = transferCount;
                    }
                })
            fetch(`https://localhost:8443/queue/live-status?windowId=${windowId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    const currentServing = document.getElementById("currentServing");
                    if (response.status === 204) {
                        if (currentServing) {
                            currentServing.innerHTML = "No one being served.";
                        }
                    } else {
                        return response.json();
                    }
                })
                .then(queue => {
                    if (queue) {
                        const currentServing = document.getElementById("currentServing");
                        const currentVisited = document.getElementById("currentVisited");
                        const currentPriority = document.getElementById("currentPriority");
                        const currentMissed = document.getElementById("currentMissed");
                        currentServingId = queue.queueId;
                        if (currentServing) {
                            currentServing.innerHTML = queue.user.name;
                        }
                        if (currentVisited) {
                            currentVisited.innerHTML = queue.timeStamp;
                        }
                        if (currentPriority) {
                            currentPriority.innerHTML = queue.user.priority;
                        }
                        if (currentMissed) {
                            currentMissed.innerHTML = queue.callCount;
                        }
                    }
                })

            return mainFetch;

        })
        .catch(error => {
            console.error("An error occurred while loading the dashboard:", error);
        });
}

window.addEventListener("load", loadDashboard);
// update loadDashboard every 5 seconds
setInterval(loadDashboard, 5000);

function setupEventListeners() {
    const transferModal = document.getElementById("transferModal");
    const close = document.getElementsByClassName("close")[0];

    close.onclick = function() {
        transferModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target === transferModal) {
            transferModal.style.display = "none";
        }
    }
}

window.addEventListener("load", setupEventListeners);

function requeueUser(queueId) {
    fetch(`https://localhost:8443/queue/${queueId}/requeue`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
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
        .then(queue => {
            alert("User has been re-queued.");
            loadDashboard();
        })
        .catch(error => {
            console.error("Failed to re-queue client.", error);
            alert("Failed to re-queue client.");
        })
}

function completeUser(currentServingId) {
    fetch(`https://localhost:8443/queue/${currentServingId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: "COMPLETED",
            windowId: currentWindowId
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
        .then(complete => {
            if (complete) {
                alert("Finished serving client.")
                loadDashboard();
            }
        })
        .catch(error => {
            console.error("Failed to complete client.", error);
            alert("Failed to complete client.");
        })
}

function logout() {
    fetch(`https://localhost:8443/auth/logout`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            return response.text().then(body => {
                if (!response.ok) {
                    throw new Error(body);
                }
                return body;
            });
        })
        .then(out => {
            alert("Logged out successfully.")
            window.location.href = "loginScreen.html";
        })
        .catch
            (error => {
            console.error("Failed log out.", error);
            alert("Failed to log out.");
        })
}

function nextUser() {
    fetch(`https://localhost:8443/queue/next-person?windowId=${currentWindowId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (response.status === 204) {
                alert("No one in the queue.");
            } else {
                return response.json();
            }
        })
        .then(queue => {
            if(queue) {
                fetch(`https://localhost:8443/queue/${queue.queueId}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: "SERVING",
                        windowId: currentWindowId
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
                    .then(load => {
                        alert("Successfully updated dashboard.");
                        loadDashboard();
                    })
                    .catch(error => {
                        console.error("Failed to update dashboard.", error);
                        alert("Failed to update dashboard.");
                    })
            }
        })
        .catch(error => {
            console.error("Failed take in next user.", error);
            alert("Failed take in next user.");
        })
}

function openTransferModal() {
    document.getElementById("transferModal").style.display = "block";
    fetch(`https://localhost:8443/window`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(windows  => {
            const matchOperation = windows .find(window => window.category === "Evaluation: Operations");
            const matchAssessment = windows .find(window => window.category === "Evaluation: Assessment");
            document.getElementById("operationBtn").onclick = function() {
                transferUser(matchOperation.windowId);
            }
            document.getElementById("assessBtn").onclick = function() {
                transferUser(matchAssessment.windowId);
            }
        })
}

function transferUser(windowId) {
    const confirmed = confirm("Are you sure you want to transfer this client?");
    console.log("Transferring queue ID:", currentServingId, "to window:", windowId, "with status: TRANSFERRED");
    if (confirmed) {
        fetch(`https://localhost:8443/queue/${currentServingId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: "TRANSFERRED",
                windowId: windowId
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
            .then(success => {
                document.getElementById("transferModal").style.display = "none";
                alert("User transferred successfully.");
                loadDashboard();
            })
            .catch(error => {
                console.error("Failed to transfer current user.", error);
                alert("Failed to transfer current user.");
            })
    }
}

// styles

// Toggle the visibility of a dropdown menu
const toggleDropdown = (dropdown, menu, isOpen) => {
    dropdown.classList.toggle("open", isOpen);
    menu.style.height = isOpen ? `${menu.scrollHeight}px` : 0;
};
// Close all open dropdowns
const closeAllDropdowns = () => {
    document.querySelectorAll(".dropdown-container.open").forEach((openDropdown) => {
        toggleDropdown(openDropdown, openDropdown.querySelector(".dropdown-menu"), false);
    });
};
// Attach click event to all dropdown toggles
document.querySelectorAll(".dropdown-toggle").forEach((dropdownToggle) => {
    dropdownToggle.addEventListener("click", (e) => {
        e.preventDefault();
        const dropdown = dropdownToggle.closest(".dropdown-container");
        const menu = dropdown.querySelector(".dropdown-menu");
        const isOpen = dropdown.classList.contains("open");
        closeAllDropdowns(); // Close all open dropdowns
        toggleDropdown(dropdown, menu, !isOpen); // Toggle current dropdown visibility
    });
});
// Attach click event to sidebar toggle buttons
document.querySelectorAll(".sidebar-toggler, .sidebar-menu-button").forEach((button) => {
    button.addEventListener("click", () => {
        closeAllDropdowns(); // Close all open dropdowns
        document.querySelector(".sidebar").classList.toggle("collapsed"); // Toggle collapsed class on sidebar
    });
});
// Collapse sidebar by default on small screens
if (window.innerWidth <= 1024) document.querySelector(".sidebar").classList.add("collapsed");