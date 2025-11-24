// Authentication functions

// Check if user is authenticated
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Redirect based on user role
function redirectByRole(user) {
    if (user.role === 'admin') {
        window.location.href = '/admin.html';
    } else {
        window.location.href = '/student.html';
    }
}

// Logout
function logout() {
    removeToken();
    window.location.href = '/index.html';
}

// Login handler (used in index.html)
async function handleLogin(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    errorDiv.classList.add('hidden');
    
    try {
        // Try login first
        let response;
        try {
            response = await authAPI.login(studentId, password);
        } catch (error) {
            // If login fails, try to register (for demo purposes)
            if (error.message.includes('401') || error.message.includes('Invalid')) {
                // Auto-register for demo (remove in production)
                try {
                    await authAPI.register({
                        student_id: studentId,
                        name: studentId,
                        password: password,
                        role: studentId.toLowerCase().includes('admin') ? 'admin' : 'student'
                    });
                    // Try login again
                    response = await authAPI.login(studentId, password);
                } catch (regError) {
                    throw new Error('Invalid credentials. Please check your student ID and password.');
                }
            } else {
                throw error;
            }
        }
        
        // Store token and user
        setToken(response.access_token);
        setUser(response.user);
        
        // Redirect
        redirectByRole(response.user);
    } catch (error) {
        errorDiv.textContent = error.message || 'Login failed. Please try again.';
        errorDiv.classList.remove('hidden');
    }
}

// Setup logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Set user name if on student/admin pages
    const user = getUser();
    if (user) {
        const nameEl = document.getElementById('studentName') || document.getElementById('adminName');
        if (nameEl) {
            nameEl.textContent = user.name || user.student_id;
        }
    }
});

