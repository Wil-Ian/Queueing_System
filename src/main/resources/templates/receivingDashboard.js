const token = "";

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
            const windowTitle = document.getElementById("windowTitle ");

            if (employeeName) {
                employeeName.innerHTML = employee.name;
            }
            if (windowTitle) {
                windowTitle.innerHTML = employee.window.category;
            }
            return fetch(`https://localhost:8443/queue/window-queue?windowId=${windowId}`, {
                method: "GET",
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
                .then(queues => {
                    queues.forEach(queue => {
                        // build a table row for each queue entry
                    });
                })
        })}

const queueTable = document.getElementById("queueTable");
queues.forEach(queue => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${queue.user.name}</td>
                    <td>${queue.timeStamp}</td>
                    <td>${queue.user.priority}</td>
                    <td>${queue.callCount}</td>
                    <td><input type="button" value="Modify User" onclick="requeueUser.queue.queueId('{windowId}')"></td>`;
    queueTable.appendChild(row);
});