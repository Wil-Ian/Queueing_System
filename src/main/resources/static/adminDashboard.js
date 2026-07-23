// Admin dashboard logic.
// This script manages employee records, window assignments, and password resets
// for the system administrator.
let editingEmployeeId;
let deletingEmployeeId;
let resettingEmployeeId;
let employees = [];
let windows = [];

function loadEmployees() {
    // Load the initial employee and window data from the API before rendering
    // the tables and modals that depend on them.
    if (!localStorage.getItem('accessToken')) {
        window.location.href = "loginScreen.html";
        return;
    }

    const employeeFetch = Promise.all([
        authFetch(`/employee`, {
            method: "GET"
        }),
        authFetch(`/window`, {
            method: "GET"
        })
    ]).then(responses => {
        return Promise.all(responses.map(response => response.json()));
    })
        .then(([fetchedEmployees, fetchedWindows]) => {
            employees = fetchedEmployees;
            employees.sort((a, b) => a.employeeId - b.employeeId);
            windows = fetchedWindows;

            renderEmployeeTable();
            renderWindowTable()
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
                        <input type="button" value="Delete User" onclick="openDeleteModal(${employee.employeeId})">
                        <input type="button" value="Reset Password" onclick="openResetPasswordModal(${employee.employeeId})">
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

function showChangePassModal() {
    document.getElementById("changePassModal").style.display = "flex";
}

function showEmployeeDashboard() {
    document.getElementById("windowScreen").style.display = "none";
    document.getElementById("employeeScreen").style.display = "block";
    renderEmployeeTable();
}

function showWindowDashboard() {
    document.getElementById("windowScreen").style.display = "block";
    document.getElementById("employeeScreen").style.display = "none";
    renderWindowTable()
}

function setupEventListeners() {
    const editEmployeeModal = document.getElementById("editEmployeeModal")
    const deleteEmployeeModal = document.getElementById("deleteEmployeeModal");
    const changePassModal = document.getElementById("changePassModal");
    const createEmployeeModal = document.getElementById("createEmployeeModal");

    const closeDeleteBtn = document.getElementById("closeDeleteBtn");
    const closeEditBtn = document.getElementById("closeEditBtn");
    const closePassBtn = document.getElementById("closePassBtn");
    const closeCreateBtn = document.getElementById("closeCreateBtn");

    closeDeleteBtn.onclick = function() {
        deleteEmployeeModal.style.display = "none";
    }

    closeEditBtn.onclick = function() {
        editEmployeeModal.style.display = "none";
    }

    closePassBtn.onclick = function() {
        changePassModal.style.display = "none";
    }

    closeCreateBtn.onclick = function() {
        createEmployeeModal.style.display = "none";
    }
}

window.addEventListener("load", setupEventListeners);

function saveEmployeeEdit() {
    // Update an existing employee's visible details and assigned window.
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

    authFetch(`/employee/${editingEmployeeId}`, {
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
    authFetch(`/employee/${deletingEmployeeId}`, {
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

function openResetPasswordModal(employeeId) {
    const matchedEmployee = employees.find(employee => employee.employeeId === employeeId);
    if (!matchedEmployee) {
        console.error("Employee not found.");
        alert("Employee not found.");
        return;
    }
    const employeeNameReset = document.getElementById("employeeNameReset");
    employeeNameReset.innerHTML = escapeHtml(matchedEmployee.name);

    resettingEmployeeId = employeeId;
    showChangePassModal();

}

function resetPassword() {
    const newPassInput = document.getElementById("newPassInput");
    const confirmPassInput = document.getElementById("confirmPassInput");

    if(newPassInput.value === confirmPassInput.value) {
        authFetch(`/employee/${resettingEmployeeId}/admin-reset-password`, {
            method: "PATCH",
            body: JSON.stringify({
                newPassword: newPassInput.value
            })
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

function showCreateEmployeeModal() {
    const assignUserWindow = document.getElementById("assignUserWindow");
    assignUserWindow.innerHTML = "";
    const blankOption = document.createElement("option");
    blankOption.value = "";
    blankOption.textContent = "-- Select a Window --";
    assignUserWindow.appendChild(blankOption);

    windows.forEach(win => {
        const option = document.createElement("option");
        option.value = win.windowId;
        option.textContent = win.category;
        assignUserWindow.appendChild(option);
    });

    document.getElementById("createEmployeeModal").style.display = "flex";
}

function createEmployee() {
    // Create a new employee account and assign it to a valid window.
    const userNameInput = document.getElementById("userNameInput").value;
    const emailInput = document.getElementById("emailInput").value;
    const passwordInput = document.getElementById("passwordInput");
    const passwordConfirm = document.getElementById("passwordConfirm");
    const assignUserWindow = document.getElementById("assignUserWindow");

    if (assignUserWindow.value === "") {
        alert("Please select a window.");
        return;
    }

    if (passwordInput.value !== passwordConfirm.value) {
        alert("Passwords do not match.");
        return;
    }

    const body = {
        name: userNameInput,
        email: emailInput,
        password: passwordInput.value,
        window: {
            windowId: Number(assignUserWindow.value)
        }
    }

    authFetch(`/employee`, {
        method: "POST",
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
        .then(success => {
            alert("Employee Created Successfully.");
            document.getElementById("createEmployeeModal").style.display = "none";
            loadEmployees();
        })
        .catch(error => {
            console.error("Error.", error);
            alert("Error.");
        })
}

function renderWindowTable() {
    // Render the window inventory so administrators can verify which services
    // are available and which windows are currently active.
    const windowTable = document.getElementById("windowTable");
    windowTable.innerHTML = "";

    windows.forEach(win => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${win.windowId}</td>
            <td>${escapeHtml(win.category)}</td>
            <td>${win.timeStamp}</td>
            <td>${win.isActive}</td>
        `;
        windowTable.appendChild(row);
    });
}

function escapeHtml(text) {
    const tempElement = document.createElement("div");
    tempElement.textContent= text;
    return tempElement.innerHTML;
}

// Sidebar toggle and responsive helpers (align behavior with receivingDashboard)
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-container.open').forEach((openDropdown) => {
        openDropdown.classList.remove('open');
        const menu = openDropdown.querySelector('.dropdown-menu');
        if (menu) menu.style.height = 0;
    });
}

function applySidebarState() {
    const sidebar = document.querySelector('.sidebar');
    const isCollapsed = sidebar?.classList.contains('collapsed') ?? false;
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
}

// Attach toggle handlers
document.querySelectorAll('.sidebar-toggler, .sidebar-menu-button').forEach((button) => {
    button.addEventListener('click', () => {
        closeAllDropdowns();
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        sidebar.classList.toggle('collapsed');
        applySidebarState();
    });
});

// Initialize collapsed state and update on resize
const sidebar = document.querySelector('.sidebar');
if (sidebar) {
    sidebar.classList.add('collapsed');
}
applySidebarState();

window.addEventListener('resize', () => {
    if (!sidebar) return;
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
    }
    applySidebarState();
});