let editingEmployeeId;
let deletingEmployeeId;
let employees = [];
let windows = [];

function loadEmployees() {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = "loginScreen.html";
        return;
    }

    const employeeFetch = Promise.all([
        authFetch(`https://localhost:8443/employee`, {
            method: "GET"
        }),
        authFetch(`https://localhost:8443/window`, {
            method: "GET"
        })
    ]).then(responses => {
        return Promise.all(responses.map(response => response.json()));
    })
        .then(([fetchedEmployees, fetchedWindows]) => {
            employees = fetchedEmployees;
            windows = fetchedWindows;

            renderEmployeeTable();
        })
        .catch(error => {
            console.error("Failed to load employees.", error);
            alert("Failed to load employees.");
        })
}

window.addEventListener("load", loadEmployees);

function renderEmployeeTable() {
    const employeeTable = document.getElementById("employeeTable");
    employeeTable.innerHTML = "";

    employees.forEach(employee => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${employee.employeeId}</td>
                    <td>${escapeHtml(employee.name)}</td>
                    <td>${escapeHtml(employee.email)}</td>
                    <td>${employee.isActive}</td>
                    <td>${employee.window.windowId}</td>
                    <td>${escapeHtml(employee.window.category)}</td>
                    <td>
                        <input type="button" value="Edit User" onclick="openEditModal(${employee.employeeId})">
                        <input type="button" value="Delete User" onclick="openDeletemodal(${employee.employeeId})">
                    </td>
                    `;
        employeeTable.appendChild(row);
    })
}

function openEditModal(employeeId) {
    const matchedEmployee = employees.find(employee => employee.employeeId === employeeId);
    if (!matchedEmployee) {
        console.error("Employee not found.");
        alert("Employee not found.");
        return;
    }
    const editNameInput = document.getElementById("editNameInput");
    editNameInput.value = matchedEmployee.name;

    const editEmailInput = document.getElementById("editEmailInput");
    editEmailInput.value = matchedEmployee.email;

    const editWindowInput = document.getElementById("editWindowInput");
    editWindowInput.innerHTML = "";

    windows.forEach(win => {
        const option = document.createElement("option");
        option.value = win.windowId;
        option.textContent = win.category;
        editWindowInput.appendChild(option);
    });
    editWindowInput.value = matchedEmployee.window.windowId;

    editingEmployeeId = employeeId;
    showEditEmployeeModal();
}

function showEditEmployeeModal() {
    document.getElementById("editEmployeeModal").style.display = "flex";
}

function showDeleteEmployeeModal() {
    document.getElementById("deleteEmployeeModal").style.display = "flex";
}

function setupEventListeners() {
    const editEmployeeModal = document.getElementById("editEmployeeModal")
    const deleteEmployeeModal = document.getElementById("deleteEmployeeModal");

    const closeDeleteBtn = document.getElementById("closeDeleteBtn");
    const closeEditBtn = document.getElementById("closeEditBtn");

    closeDeleteBtn.onclick = function() {
        deleteEmployeeModal.style.display = "none";
    }

    closeEditBtn.onclick = function() {
        editEmployeeModal.style.display = "none";
    }
}

window.addEventListener("load", setupEventListeners);

function saveEmployeeEdit() {
    const editNameInput = document.getElementById("editNameInput").value;
    const editEmailInput = document.getElementById("editEmailInput").value;
    const editWindowInput = document.getElementById("editWindowInput").value;

    const body = {
        name: editNameInput,
        email: editEmailInput,
        window: {
            windowId: Number(editWindowInput)
        }
    }

    authFetch(`https://localhost:8443/employee/${editingEmployeeId}`, {
        method: "PUT",
        body: JSON.stringify(body)
    })
        .then(response => {
            return response.json().then(b => {
                if (!response.ok) {
                    const err = new Error(b.error);
                    err.code = b.code;
                    throw err;
                }
                return b;
            });
        })
        .then(save => {
            const editEmployeeModal = document.getElementById("editEmployeeModal");
            editEmployeeModal.style.display = "none";
            alert("Employee successfully updated.");
            loadEmployees();
        })
        .catch(error => {
            console.error("Failed to edit employee.", error);
            alert("Failed to edit employee.");
        })
}

function openDeleteModal(employeeId) {
    const matchedEmployee = employees.find(employee => employee.employeeId === employeeId);
    if (!matchedEmployee) {
        console.error("Employee not found.");
        alert("Employee not found.");
        return;
    }

    const employeeName = document.getElementById("employeeName");
    employeeName.innerHTML = escapeHtml(matchedEmployee.name);

    deletingEmployeeId = employeeId;
    showDeleteEmployeeModal();
}

function confirmDeleteEmployee() {
    authFetch(`https://localhost:8443/employee/${deletingEmployeeId}`, {
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorBody => {
                    const err = new Error(errorBody.error);
                    err.code = errorBody.code;
                    throw err;
                });
            }
        })
        .then(success => {
            const deleteEmployeeModal = document.getElementById("deleteEmployeeModal");
            deleteEmployeeModal.style.display = "none";
            alert("Employee successfully deleted.");
            loadEmployees();
        })
        .catch(error => {
            console.error("Failed to delete employee.", error);
            alert("Failed to delete employee.");
        })
}