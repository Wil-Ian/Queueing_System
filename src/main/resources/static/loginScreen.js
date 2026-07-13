document.getElementById("loginSubmit").addEventListener("click", function() {
    const emailInput = document.getElementById("emailInput").value;
    const passwordInput = document.getElementById("passwordInput").value;

    fetch(`https://localhost:8443/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(r => {

        })
})