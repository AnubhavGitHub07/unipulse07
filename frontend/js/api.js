// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Get stored token
function getToken() {
    return localStorage.getItem('token');
}

// Set token
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove token
function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Get user data
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Set user data
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Unauthorized - redirect to login
            removeToken();
            window.location.href = '/index.html';
            return;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Form data API request
async function apiRequestFormData(endpoint, formData, options = {}) {
    const token = getToken();
    const headers = {
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            method: options.method || 'POST',
            headers,
            body: formData
        });

        if (response.status === 401) {
            removeToken();
            window.location.href = '/index.html';
            return;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    login: async (studentId, password) => {
        return await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ student_id: studentId, password })
        });
    },
    register: async (userData) => {
        return await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    getMe: async () => {
        return await apiRequest('/api/auth/me');
    }
};

// Attendance API
const attendanceAPI = {
    getRecords: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.student_id) params.append('student_id', filters.student_id);
        if (filters.subject) params.append('subject', filters.subject);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        return await apiRequest(`/api/attendance?${params}`);
    },
    getStats: async (studentId = null, subject = null) => {
        const params = new URLSearchParams();
        if (studentId) params.append('student_id', studentId);
        if (subject) params.append('subject', subject);
        return await apiRequest(`/api/attendance/stats?${params}`);
    },
    getSubjectWiseStats: async (studentId = null) => {
        const params = new URLSearchParams();
        if (studentId) params.append('student_id', studentId);
        return await apiRequest(`/api/attendance/stats/subject-wise?${params}`);
    },
    createRecord: async (record) => {
        return await apiRequest('/api/attendance/', {
            method: 'POST',
            body: JSON.stringify(record)
        });
    },
    bulkUpload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await apiRequestFormData('/api/attendance/bulk-upload', formData);
    }
};

// Timetable API
const timetableAPI = {
    getTimetable: async (studentId = null, day = null) => {
        const params = new URLSearchParams();
        if (studentId) params.append('student_id', studentId);
        if (day) params.append('day', day);
        return await apiRequest(`/api/timetable?${params}`);
    },
    getCurrentWeek: async () => {
        return await apiRequest('/api/timetable/current-week');
    },
    createTimetable: async (timetable) => {
        return await apiRequest('/api/timetable/', {
            method: 'POST',
            body: JSON.stringify(timetable)
        });
    }
};

// PYQ API
const pyqAPI = {
    getPYQs: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.subject) params.append('subject', filters.subject);
        if (filters.semester) params.append('semester', filters.semester);
        if (filters.year) params.append('year', filters.year);
        if (filters.exam_type) params.append('exam_type', filters.exam_type);
        return await apiRequest(`/api/pyq?${params}`);
    },
    getSubjects: async () => {
        return await apiRequest('/api/pyq/subjects');
    },
    upload: async (file, subject, semester, year, examType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', subject);
        formData.append('semester', semester);
        formData.append('year', year);
        formData.append('exam_type', examType);
        return await apiRequestFormData('/api/pyq/upload', formData);
    },
    delete: async (pyqId) => {
        return await apiRequest(`/api/pyq/${pyqId}`, { method: 'DELETE' });
    }
};

// Results API
const resultsAPI = {
    getResults: async (studentId = null, semester = null) => {
        const params = new URLSearchParams();
        if (studentId) params.append('student_id', studentId);
        if (semester) params.append('semester', semester);
        return await apiRequest(`/api/results?${params}`);
    },
    getResult: async (resultId) => {
        return await apiRequest(`/api/results/${resultId}`);
    },
    createResult: async (formData) => {
        return await apiRequestFormData('/api/results/', formData);
    },
    getCGPA: async (studentId = null) => {
        const params = new URLSearchParams();
        if (studentId) params.append('student_id', studentId);
        return await apiRequest(`/api/results/cgpa/calculate?${params}`);
    }
};

