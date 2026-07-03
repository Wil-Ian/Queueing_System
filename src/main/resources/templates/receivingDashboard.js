const token = "";
let currentServingId = null;

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

                    if(totalQueue) {
                        totalQueue.innerHTML = queueCount;
                    }

                    if(totalMissed) {
                        totalMissed.innerHTML = missedCount;
                    }
                    if(totalComplete) {
                        totalComplete.innerHTML = dailyVolume;
                    }
                    if(totalReferred) {
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
                        if(currentServing) {
                            currentServing.innerHTML = "No one being served.";
                        }
                    } else {
                        return response.json();
                    }
                })
                .then(queue => {
                    if(queue) {
                        const currentServing = document.getElementById("currentServing");
                        const currentVisited = document.getElementById("currentVisited");
                        const currentPriority = document.getElementById("currentPriority");
                        const currentMissed = document.getElementById("currentMissed");
                        currentServingId = queue.queueId;
                        if(currentServing) {
                            currentServing.innerHTML = queue.user.name;
                        }
                        if(currentVisited) {
                            currentVisited.innerHTML = queue.timeStamp;
                        }
                        if(currentPriority) {
                            currentPriority.innerHTML = queue.user.priority;
                        }
                        if(currentMissed) {
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
        .then(complete => {
            if(complete) {

            }
        })
}