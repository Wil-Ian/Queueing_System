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