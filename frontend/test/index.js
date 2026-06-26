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
        let formatted = now.toLocaleString('en-US', options);   
        dateElement.innerHTML = formatted;
    }
}
updateDateTime();

// Call the function every 1000ms (1 second) to keep it in sync
setInterval(updateDateTime, 1000);

function updateDate() {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateElement = document.getElementById("current_date");
    
    // only update if the element exists on the page
    if (dateElement) {
        dateElement.innerHTML = new Date().toLocaleDateString('en-US', options);
    }
}
updateDate();