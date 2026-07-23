document.getElementById("loginSubmit").addEventListener("click", function() {
    const emailInput = document.getElementById("emailInput").value;
    const passwordInput = document.getElementById("passwordInput").value;

    fetch(`/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: emailInput,
            password: passwordInput
        })
    })
        .then(response => {
            return response.json().then(body => {
                if (!response.ok) {
                    throw new Error(body.error);
                }
                return body;
            });
        })
        .then(success => {
            localStorage.setItem('accessToken', success.accessToken);
            localStorage.setItem('refreshToken', success.refreshToken);
            if(success.role === "ADMIN") {
                window.location.href = "adminDashboard.html";
            } else {
                window.location.href = "receivingDashboard.html";
            }
        })
        .catch(error => {
            console.error("Login error.", error.message);
            alert(error.message);
        })

});

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
setInterval(updateDateTime, 1000);

function updateDate() {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const dateElement = document.getElementById("current_date");
    if (dateElement) {
        dateElement.innerHTML = new Date().toLocaleDateString('en-US', options);
    }
}
updateDate();