function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById("current_time");
    const dateElement = document.getElementById("current_date");

    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
    }

    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

function loadQueue() {
    const queueFetch = Promise.all([
        fetch(`https://localhost:8443/window`, {
            headers: {
                "Content-Type": "application/json"
            }
        }),
        fetch(`https://localhost:8443/queue/all-queue`, {
            headers: {
                "Content-Type": "application/json"
            }
        }),
        fetch(`https://localhost:8443/queue/all-serving`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
    ])
        .then(responses => {
            return Promise.all(responses.map(response => response.json()));
        })
        .then(([allWindows, allQueue, allServing]) => {
            const servingTable = document.getElementById("servingTable");
            const queueTable = document.getElementById("queueTable");
            const queueTableTwo = document.getElementById("queueTableTwo");

            if(servingTable) {
                servingTable.innerHTML = "";
                if (allServing.length === 0) {
                    const row = document.createElement("tr");
                    row.classList.add("empty-state-row");
                    row.innerHTML =`
                        <td colspan="2">No one currently being served</td>
                    `;
                    servingTable.appendChild(row);
                } else {
                    allServing.forEach(serveItem => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                    <td>${serveItem.user.consignee}</td>
                    <td>${serveItem.windowId}</td>
                    `;
                        servingTable.appendChild(row);
                    })
                }
            }

            if (queueTable && queueTableTwo) {
                const rowsPerTable = 7;
                queueTable.innerHTML = "";
                queueTableTwo.innerHTML = "";

                const firstBatch = allQueue.slice(0, rowsPerTable);
                const secondBatch = allQueue.slice(rowsPerTable, rowsPerTable * 2);

                const fillTable = (table, items) => {
                    items.forEach(queueItem => {
                        const row = document.createElement("tr");
                        if (queueItem.user.priority === "PRIORITY") {
                            row.classList.add("priority-row");
                        }
                        row.innerHTML = `
                            <td>${queueItem.user.consignee}</td>
                            <td>${queueItem.user.priority}</td>
                        `;
                        table.appendChild(row);
                    });

                    for (let i = items.length; i < rowsPerTable; i++) {
                        const emptyRow = document.createElement("tr");
                        emptyRow.classList.add("empty-row");
                        emptyRow.innerHTML = `
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                        `;
                        table.appendChild(emptyRow);
                    }
                };

                fillTable(queueTable, firstBatch);
                fillTable(queueTableTwo, secondBatch);
            }
        })
        .catch(error => {
            console.error("Failed to fetch queue.", error);
        })
}

window.addEventListener("load", () => {
    updateClock();
    loadQueue();
});

setInterval(updateClock, 1000);
// update loadQueue every 5 seconds
setInterval(loadQueue, 5000);