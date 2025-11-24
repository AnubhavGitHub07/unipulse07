// Index page functionality

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = getToken();
    if (token) {
        const user = getUser();
        if (user) {
            redirectByRole(user);
        }
    }
    
    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

