document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const backBtn = document.getElementById('backBtn');
    const password = document.getElementById("password");
    const loginSection = document.getElementById("login-section");
    const usernameDisplay = document.getElementById("usernameDisplay");
    let currentUser = "";
    
    backBtn.addEventListener('click', () => {
        currentUser = "";
        loginSection.style.display = "none";
        usernameDisplay.textContent = "";
    });
    
    const userButtons = document.querySelectorAll(".user-card button");

    userButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault(); 
           
            const userName = button.closest(".user-card").querySelector("h2").textContent;
            currentUser = userName;
            
            usernameDisplay.textContent = userName;
           
            loginSection.style.display = "block";
            
            loginSection.scrollIntoView({ behavior: "smooth" });
        });
    });
    
    const submitLoginForm = async (name, pass) => {
    try {
        const request = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password: pass }),
        });

        const response = await request.json();

        if (response.success) {
            window.location.href = response.redirect;
        } else {
            alert(response.message || "Incorrect login details.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login.");
    }
};

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const passwordValue = password.value;
    submitLoginForm(currentUser, passwordValue);
});
    
});
