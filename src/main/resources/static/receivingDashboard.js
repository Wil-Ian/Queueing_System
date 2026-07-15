let currentServingId = null;
let currentWindowId = null;
let currentEmployeeId = null;
let currentCategory = null;
let missedCount = null;
let dailyVolume = null;

const categoryButtons = {
    "Receiving": ["operationBtn", "assessBtn"],
    "Evaluation: Operations": ["releasingBtn"],
    "Evaluation: Assessment": ["releasingBtn"],
    "Releasing/Follow Up": ["cashierBtn"],
    "Information Desk and Pass Control": ["cashierBtn"],
    "Appointment": ["cashierBtn"]
};

const transferButtons = [
    "operationBtn", "assessBtn", "releasingBtn", "cashierBtn"
];

function authFetch(url, options) {
    const accessToken = localStorage.getItem('accessToken');
        const possibleOptions = {
            ...options,
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        };
        return fetch(url, possibleOptions)
            .then(response => {
                if (response.status === 401) {
                    const refreshToken = localStorage.getItem('refreshToken');
                    return fetch("https://localhost:8443/auth/refresh", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${refreshToken}`,
                            "Content-Type": "application/json"
                        }
                    })
                        .then(refreshResponse => {
                            return refreshResponse.json().then(body => {
                                if(!refreshResponse.ok) {
                                    const err = new Error(body.error);
                                    throw err;
                                }
                                return body;
                            });
                        })
                        .then(refreshBody => {
                            localStorage.setItem('accessToken', refreshBody.accessToken);
                            return authFetch(url, options);
                        })
                        .catch(refreshError => {
                            console.error("User has failed to receive an access token.")
                            window.location.href = "loginScreen.html";
                        })
                } else {
                    return response;
                }
            });
}

function loadDashboard() {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = "loginScreen.html";
        return;
    }
    authFetch("https://localhost:8443/employee/me", {})
        .then(response => response.json())
        .then(employee => {
            const windowId = employee.window.windowId;
            currentWindowId = windowId;
            currentEmployeeId = employee.employeeId;
            currentCategory = employee.window.category;
            const employeeName = document.getElementById("employeeName");
            const windowTitle = document.getElementById("windowTitle");

            if (employeeName) {
                employeeName.innerHTML = escapeHtml(employee.name);
            }
            if (windowTitle) {
                windowTitle.innerHTML = escapeHtml(employee.window.category);
            }

            const mainFetch = Promise.all([
                authFetch(`https://localhost:8443/queue/window-queue?windowId=${windowId}`, {
                    method: "GET"
                }),
                authFetch(`https://localhost:8443/queue/reports/queue-count?windowId=${windowId}`, {
                    method: "GET"
                }),
                authFetch(`https://localhost:8443/queue/reports/missed-count?windowId=${windowId}`, {
                    method: "GET"
                }),
                authFetch(`https://localhost:8443/queue/reports/daily-volume?windowId=${windowId}`, {
                    method: "GET"
                }),
                authFetch(`https://localhost:8443/queue/reports/transfer-count?transferredFrom=${windowId}`, {
                    method: "GET"
                })
            ]).then(responses => {
                return Promise.all(responses.map(response => response.json()));
            })
                .then(([queues, queueCount, fetchedMissedCount, fetchedDailyVolume, transferCount]) => {
                    const queueTable = document.getElementById("queueTable");
                    const totalQueue = document.getElementById("totalQueue");
                    const totalMissed = document.getElementById("totalMissed");
                    const totalComplete = document.getElementById("totalComplete");
                    const totalReferred = document.getElementById("totalReferred");
                    missedCount = fetchedMissedCount;
                    dailyVolume = fetchedDailyVolume;

                    // queue table
                    if (queueTable) {
                        queueTable.innerHTML = "";
                        queues.forEach(queue => {
                            const row = document.createElement("tr");
                            if (queue.user.priority === "PRIORITY") {
                                row.classList.add("priority-row");
                            }
                            row.innerHTML = `
                    <td>${escapeHtml(queue.user.name)}</td>
                    <td>${escapeHtml(queue.timeStamp)}</td>
                    <td>${escapeHtml(queue.user.priority)}</td>
                    <td>${escapeHtml(queue.callCount)}</td>
                    <td>
                        <input type="button" value="Requeue User" onclick="requeueUser('${queue.queueId}')">
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
            authFetch(`https://localhost:8443/queue/live-status?windowId=${windowId}`, {
                method: "GET",
            })
                .then(response => {
                    const currentServing = document.getElementById("currentServing");
                    const currentVisited = document.getElementById("currentVisited");
                    const currentPriority = document.getElementById("currentPriority");
                    const currentMissed = document.getElementById("currentMissed");
                    if (response.status === 204) {
                        if (currentServing) {
                            currentServing.innerHTML = "No one being served.";
                            currentVisited.innerHTML = "";
                            currentPriority.innerHTML = "";
                            currentMissed.innerHTML = "";
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
                            currentServing.innerHTML = escapeHtml(queue.user.name);
                        }
                        if (currentVisited) {
                            currentVisited.innerHTML = escapeHtml(queue.timeStamp);
                        }
                        if (currentPriority) {
                            currentPriority.innerHTML = escapeHtml(queue.user.priority);
                        }
                        if (currentMissed) {
                            currentMissed.innerHTML = escapeHtml(queue.callCount);
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
    const changeUserModal = document.getElementById("changeUserModal");
    const changePassModal = document.getElementById("changePassModal");
    const close = document.getElementsByClassName("close")[0];
    const closeUser = document.getElementById("closeUser");
    const closePass = document.getElementById("closePass");

    close.onclick = function() {
        transferModal.style.display = "none";
    }

    closeUser.onclick = function () {
        changeUserModal.style.display = "none";
    }

    closePass.onclick = function() {
        changePassModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target === changeUserModal) {
            changeUserModal.style.display = "none";
        }
        if (event.target === transferModal) {
            transferModal.style.display = "none";
        }
        if (event.target === changePassModal) {
            changePassModal.style.display = "none";
        }
    }
}

window.addEventListener("load", setupEventListeners);

function requeueUser(queueId) {
    authFetch(`https://localhost:8443/queue/${queueId}/requeue`, {
        method: "PUT"
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
    authFetch(`https://localhost:8443/queue/${currentServingId}`, {
        method: "PUT",
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
    authFetch(`https://localhost:8443/auth/logout`, {
        method: "POST"
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
            alert("Logged out successfully.");
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = "loginScreen.html";
        })
        .catch
            (error => {
            console.error("Failed log out.", error);
            alert("Failed to log out.");
        })
}

function nextUser() {
    authFetch(`https://localhost:8443/queue/next-person?windowId=${currentWindowId}`, {
        method: "GET"
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
                authFetch(`https://localhost:8443/queue/${queue.queueId}`, {
                    method: "PUT",
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
    authFetch(`https://localhost:8443/window`, {
        method: "GET"
    })
        .then(response => response.json())
        .then(windows  => {
            const allowedButtons = categoryButtons[currentCategory] || [];

            transferButtons.forEach(buttonId => {
                const element = document.getElementById(buttonId);
                if (element) {
                    element.classList.toggle("hidden", !allowedButtons.includes(buttonId));
                }
            });

            const matchOperation = windows .find(window => window.category === "Evaluation: Operations");
            const matchAssessment = windows .find(window => window.category === "Evaluation: Assessment");
            const matchReleasing = windows .find(window => window.category === "Releasing/Follow Up");
            const matchCashier = windows .find(window => window.category === "Cashier");
            document.getElementById("operationBtn").onclick = function() {
                transferUser(matchOperation.windowId);
            }
            document.getElementById("assessBtn").onclick = function() {
                transferUser(matchAssessment.windowId);
            }
            document.getElementById("releasingBtn").onclick = function() {
                transferUser(matchReleasing.windowId);
            }
            document.getElementById("cashierBtn").onclick = function() {
                transferUser(matchCashier.windowId);
            }
        })
}

function transferUser(windowId) {
    const confirmed = confirm("Are you sure you want to transfer this client?");
    console.log("Transferring queue ID:", currentServingId, "to window:", windowId, "with status: TRANSFERRED");
    if (confirmed) {
        authFetch(`https://localhost:8443/queue/${currentServingId}`, {
            method: "PUT",
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
const applySidebarState = () => {
    const sidebar = document.querySelector(".sidebar");
    const isCollapsed = sidebar?.classList.contains("collapsed") ?? false;
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);
};

// Attach click event to sidebar toggle buttons
document.querySelectorAll(".sidebar-toggler, .sidebar-menu-button").forEach((button) => {
    button.addEventListener("click", () => {
        closeAllDropdowns(); // Close all open dropdowns
        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.classList.add("animating");
            document.body.classList.add("content-animating");
            sidebar.classList.toggle("collapsed");
            applySidebarState();
            window.setTimeout(() => {
                sidebar.classList.remove("animating");
                document.body.classList.remove("content-animating");
            }, 400);
        }
    });
});

// Collapse sidebar by default
const sidebar = document.querySelector(".sidebar");
if (sidebar) {
    sidebar.classList.add("collapsed");
}
applySidebarState();

window.addEventListener("resize", () => {
    if (!sidebar) return;
    if (window.innerWidth <= 1024) {
        sidebar.classList.add("collapsed");
    } else {
        sidebar.classList.add("collapsed");
    }
    applySidebarState();
});

function loadAnalytics() {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = "loginScreen.html";
        return;
    }
    const analyticsFetch = Promise.all([
        authFetch(`https://localhost:8443/queue/reports/avg-waiting-time?windowId=${currentWindowId}`, {
            method: "GET"
        }),
        authFetch(`https://localhost:8443/queue/reports/avg-service-time?windowId=${currentWindowId}`, {
            method: "GET"
        })
    ])
        .then(responses => {
            return Promise.all(responses.map(response => response.json()));
        })
        .then(([fetchedAvgWaiting, fetchedAvgService]) => {
            const averageWaitingTimeToday = document.getElementById("averageWaitingTimeToday");
            const averageServiceTimeToday = document.getElementById("averageServiceTimeToday");
            const renegingRate = document.getElementById("renegingRate");
            if (averageWaitingTimeToday) {
                averageWaitingTimeToday.innerHTML = fetchedAvgWaiting.toFixed(2) + " Min";
            }
            if (averageServiceTimeToday) {
                averageServiceTimeToday.innerHTML = fetchedAvgService.toFixed(2) + " Min";
            }
            if (renegingRate && (missedCount + dailyVolume) !== 0) {
                renegingRate.innerHTML = ((missedCount / (missedCount + dailyVolume)) * 100).toFixed(2) + "%";
            } else {
                renegingRate.innerHTML = "No data available";
            }
        })
        .catch(error => {
            console.error("Failed to fetch analytics.", error);
            alert("Failed to fetch analytics.");
        })
}

function loadHistory() {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = "loginScreen.html";
        return;
    }
    authFetch(`https://localhost:8443/queue/finished-queue?windowId=${currentWindowId}`, {
        method: "GET"
    })
        .then(response => {
            return response.json().then(body => {
                if (!response.ok) {
                    throw new Error(body);
                }
                return body;
            });
        })
        .then(queues => {
            const historyTable = document.getElementById("historyTable");
            // queue table
            if (historyTable) {
                historyTable.innerHTML = "";
                queues.forEach(queue => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                    <td>${escapeHtml(queue.user.name)}</td>
                    <td>${escapeHtml(queue.timeStamp)}</td>
                    <td>${escapeHtml(queue.servingStartedAt)}</td>
                    <td>${escapeHtml(queue.completedAt)}</td>
                    <td>${escapeHtml(queue.user.priority)}</td>
                    <td>${escapeHtml(queue.callCount)}</td>
                    <td>${escapeHtml(queue.status)}</td>
                    <td>${escapeHtml(queue.transferredFrom)}</td>
                    `;
                    historyTable.appendChild(row)
                });
            }
        })
        .catch(error => {
            console.error("Failed to fetch history.", error);
            alert("Failed to fetch history.");
        })
}

function changeUsername() {
    const userNameInput = document.getElementById("userNameInput");
    authFetch(`https://localhost:8443/employee/${currentEmployeeId}/name`, {
        method: "PATCH",
        body: JSON.stringify(userNameInput.value)
    })
        .then(response => {
            return response.json().then(body => {
                if (!response.ok) {
                    throw new Error(body);
                }
                return body;
            });
        })
        .then(success => {
            alert("Name Changed Successfully.");
            document.getElementById("changeUserModal").style.display = "none";
        })
        .catch(error => {
            console.error("Error.", error);
            alert("Error.");
        })
}

function changePassword() {
    const passInput = document.getElementById("passInput");
    const newPassInput = document.getElementById("newPassInput");
    const confirmPassInput = document.getElementById("confirmPassInput");

    if(newPassInput.value === confirmPassInput.value) {
        authFetch(`https://localhost:8443/employee/${currentEmployeeId}/password`, {
            method: "PATCH",
            body: JSON.stringify({
                currentPassword: passInput.value,
                newPassword: newPassInput.value
            })
        })
            .then(response => {
                return response.json().then(body => {
                    if (!response.ok) {
                        throw new Error(body);
                    }
                    return body;
                });
            })
            .then(success => {
                alert("Password Changed Successfully.");
                document.getElementById("changePassModal").style.display = "none";
            })
            .catch(error => {
                console.error("Error.", error);
                alert("Error.");
            })
    } else {
        alert("Passwords do not match.");
    }
}

function showAnalytics() {
    document.getElementById("mainBody").style.display = "none";
    document.getElementById("historyScreen").style.display = "none";
    document.getElementById("analyticsScreen").style.display = "block";
    loadAnalytics();
}

function showDashboard() {
    document.getElementById("analyticsScreen").style.display = "none";
    document.getElementById("historyScreen").style.display = "none";
    document.getElementById("mainBody").style.display = "block";
    loadDashboard();
}

function showHistory() {
    document.getElementById("mainBody").style.display = "none";
    document.getElementById("analyticsScreen").style.display = "none";
    document.getElementById("historyScreen").style.display = "block";
    loadHistory();
}

function showChangeUserModal() {
    document.getElementById("changeUserModal").style.display = "flex";
}

function showChangePassModal() {
    document.getElementById("changePassModal").style.display = "block";
}

function escapeHtml(text) {
    const tempElement = document.createElement("div");
    tempElement.textContent= text;
    return tempElement.innerHTML;
}