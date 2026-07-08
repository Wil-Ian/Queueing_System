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
        })
    ])
        .then(responses => {
            return Promise.all(responses.map(response => response.json()));
        })
        .then(([queues, serving]) => {
            const queueTable = document.getElementById("queueTable");

            // queue table
            if (queueTable) {
                queueTable.innerHTML = "";
                queues.forEach(queue => {
                    const row = document.createElement("tr");
                    if (queue.user.priority === "PRIORITY") {
                        row.classList.add("priority-row");
                    }
                    row.innerHTML = `
                    <td>${queue.user.name}</td>
                    <td>${queue.windowId}</td>
                    `;
                    queueTable.appendChild(row);
                });
            }

            if(queueTable) {
                queueTable.innerHTML = "";
                const tableBodies = {};

                queue.forEach(queue => {

                })
            }


            // Create a section for each window
            windows.forEach(win => {
                const section = document.createElement('section');
                const title = document.createElement('h2');
                title.textContent = win.name || `Window ${win.id}`;
                section.appendChild(title);

                const table = createTable(['User ID', 'Name', 'Status']);
                section.appendChild(table);
                container.appendChild(section);

                // Store tbody reference for later population
                tableBodies[win.id] = table.querySelector('tbody');
            });


        })
        .catch(error => {
            console.error("Failed to fetch queue.", error);
            alert("Failed to fetch queue.");
        })
}