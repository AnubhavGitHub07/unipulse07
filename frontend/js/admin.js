// Admin dashboard functionality

let attendanceOverviewChart = null;
let subjectAttendanceChart = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    const user = getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = '/index.html';
        return;
    }
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Load initial data
    loadDashboard();
    loadAttendance();
    loadPYQs();
    loadResults();
    
    // Event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Attendance CSV upload
    document.getElementById('uploadAttendanceCsvBtn')?.addEventListener('click', handleAttendanceCsvUpload);
    
    // Manual attendance entry
    document.getElementById('manualAttendanceForm')?.addEventListener('submit', handleManualAttendance);
    
    // PYQ upload
    document.getElementById('pyqUploadForm')?.addEventListener('submit', handlePYQUpload);
    
    // Result upload
    document.getElementById('resultUploadForm')?.addEventListener('submit', handleResultUpload);
    
    // Timetable form
    document.getElementById('timetableForm')?.addEventListener('submit', handleTimetableSubmit);
    document.getElementById('addTimeSlot')?.addEventListener('click', addTimeSlot);
    
    // Attendance search
    document.getElementById('attendanceSearch')?.addEventListener('input', handleAttendanceSearch);
}

function switchTab(tabName) {
    console.log('Switching to tab:', tabName); // Debug log
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-indigo-600', 'border-indigo-600');
        btn.classList.add('text-gray-500');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active', 'text-indigo-600', 'border-indigo-600');
            btn.classList.remove('text-gray-500');
        }
    });
    
    // Update content - hide all tabs first
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
        console.log('Tab shown:', tabName); // Debug log
    } else {
        console.error('Tab not found:', tabName); // Debug log
    }
    
    // Load data for active tab
    try {
        if (tabName === 'dashboard') loadDashboard();
        else if (tabName === 'attendance') loadAttendance();
        else if (tabName === 'timetable') loadTimetable();
        else if (tabName === 'pyq') loadPYQs();
        else if (tabName === 'results') loadResults();
        else if (tabName === 'analytics') loadAnalytics();
    } catch (error) {
        console.error('Error loading tab data:', error);
    }
}

// Dashboard
async function loadDashboard() {
    try {
        // This would require additional API endpoints for counts
        // For now, we'll just show placeholders
        const totalStudents = document.getElementById('totalStudents');
        const totalAttendance = document.getElementById('totalAttendance');
        const totalPyqs = document.getElementById('totalPyqs');
        const totalResults = document.getElementById('totalResults');
        
        if (totalStudents) totalStudents.textContent = 'Loading...';
        if (totalAttendance) totalAttendance.textContent = 'Loading...';
        if (totalPyqs) totalPyqs.textContent = 'Loading...';
        if (totalResults) totalResults.textContent = 'Loading...';
        
        
        // Load actual counts
        const pyqs = await pyqAPI.getPYQs();
        document.getElementById('totalPyqs').textContent = pyqs.length;
        
        document.getElementById('totalResults').textContent = '—';

        
        // Get attendance count
        const attendance = await attendanceAPI.getRecords();
        document.getElementById('totalAttendance').textContent = attendance.length;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Attendance Management
async function loadAttendance() {
    try {
        const records = await attendanceAPI.getRecords();
        displayAttendanceRecords(records);
    } catch (error) {
        console.error('Error loading attendance:', error);
        // Show error message
        const tbody = document.getElementById('attendanceTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading attendance: ${error.message}</td></tr>`;
        }
    }
}

function displayAttendanceRecords(records) {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    
    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = records.map(record => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.student_id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.subject}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.date}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    record.status === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }">
                    ${record.status}
                </span>
            </td>
        </tr>
    `).join('');
}

async function handleAttendanceCsvUpload() {
    const fileInput = document.getElementById('attendanceCsvFile');
    const statusDiv = document.getElementById('uploadStatus');
    
    if (!fileInput.files.length) {
        statusDiv.innerHTML = '<p class="text-red-600">Please select a CSV file</p>';
        return;
    }
    
    try {
        statusDiv.innerHTML = '<p class="text-blue-600">Uploading...</p>';
        const result = await attendanceAPI.bulkUpload(fileInput.files[0]);
        statusDiv.innerHTML = `
            <p class="text-green-600">
                Upload successful! Inserted: ${result.inserted}, Skipped: ${result.skipped}, Total: ${result.total}
            </p>
        `;
        fileInput.value = '';
        loadAttendance();
        loadDashboard();
    } catch (error) {
        statusDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
    }
}

async function handleManualAttendance(event) {
    event.preventDefault();
    
    const record = {
        student_id: document.getElementById('manualStudentId').value,
        subject: document.getElementById('manualSubject').value,
        date: document.getElementById('manualDate').value,
        status: document.getElementById('manualStatus').value
    };
    
    try {
        await attendanceAPI.createRecord(record);
        event.target.reset();
        loadAttendance();
        alert('Attendance record added successfully!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function handleAttendanceSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#attendanceTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Timetable Management
async function loadTimetable() {
    try {
        // Timetable form is already available - just ensure it's visible
        const timetableForm = document.getElementById('timetableForm');
        if (timetableForm) {
            // Form is already displayed
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
    }
}

function addTimeSlot() {
    const container = document.getElementById('timeSlots');
    const slotDiv = document.createElement('div');
    slotDiv.className = 'time-slot-entry flex gap-2 items-end';
    slotDiv.innerHTML = `
        <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" class="start-time w-full px-3 py-2 border rounded-md" required>
        </div>
        <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="time" class="end-time w-full px-3 py-2 border rounded-md" required>
        </div>
        <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" class="subject w-full px-3 py-2 border rounded-md" required>
        </div>
        <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Faculty (Optional)</label>
            <input type="text" class="faculty w-full px-3 py-2 border rounded-md">
        </div>
        <button type="button" class="remove-slot bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600">Remove</button>
    `;
    
    container.appendChild(slotDiv);
    
    // Add remove functionality
    slotDiv.querySelector('.remove-slot').addEventListener('click', () => {
        slotDiv.remove();
    });
}

// Initialize remove buttons for existing slots
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.remove-slot').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.time-slot-entry').remove();
        });
    });
});

async function handleTimetableSubmit(event) {
    event.preventDefault();
    
    const day = document.getElementById('timetableDay').value;
    const studentId = document.getElementById('timetableStudentId').value.trim() || null;
    
    const timeSlots = Array.from(document.querySelectorAll('.time-slot-entry')).map(slot => {
        const startTime = slot.querySelector('.start-time').value;
        const endTime = slot.querySelector('.end-time').value;
        const subject = slot.querySelector('.subject').value;
        const faculty = slot.querySelector('.faculty').value.trim() || null;
        
        return {
            start_time: startTime,
            end_time: endTime,
            subject: subject,
            faculty: faculty
        };
    });
    
    try {
        await timetableAPI.createTimetable({
            student_id: studentId,
            day: day,
            time_slots: timeSlots
        });
        alert('Timetable saved successfully!');
        event.target.reset();
        document.getElementById('timeSlots').innerHTML = '';
        addTimeSlot(); // Add one empty slot
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// PYQ Management
async function loadPYQs() {
    try {
        const pyqs = await pyqAPI.getPYQs();
        displayPYQs(pyqs);
    } catch (error) {
        console.error('Error loading PYQs:', error);
        const listDiv = document.getElementById('pyqList');
        if (listDiv) {
            listDiv.innerHTML = `<div class="bg-white p-6 rounded-lg shadow"><p class="text-red-500">Error loading PYQs: ${error.message}</p></div>`;
        }
    }
}

function displayPYQs(pyqs) {
    const listDiv = document.getElementById('pyqList');
    if (!listDiv) return;
    
    if (pyqs.length === 0) {
        listDiv.innerHTML = '<div class="bg-white p-6 rounded-lg shadow"><p class="text-gray-500">No PYQs uploaded</p></div>';
        return;
    }
    
    listDiv.innerHTML = pyqs.map(pyq => `
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">${pyq.subject}</h3>
                    <p class="text-gray-600 mt-1">
                        Semester ${pyq.semester} | Year ${pyq.year} | ${pyq.exam_type.charAt(0).toUpperCase() + pyq.exam_type.slice(1)}
                    </p>
                    <p class="text-sm text-gray-500 mt-1">
                        Uploaded by ${pyq.uploaded_by} on ${new Date(pyq.uploaded_at).toLocaleDateString()}
                    </p>
                </div>
                <div class="flex gap-2">
                    <a href="${API_BASE_URL}${pyq.file_url}" target="_blank" 
                       class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Download
                    </a>
                    <button onclick="deletePYQ('${pyq.id}')" 
                            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function handlePYQUpload(event) {
    event.preventDefault();
    
    const file = document.getElementById('pyqFile').files[0];
    const subject = document.getElementById('pyqSubject').value;
    const semester = parseInt(document.getElementById('pyqSemester').value);
    const year = parseInt(document.getElementById('pyqYear').value);
    const examType = document.getElementById('pyqExamType').value;
    
    try {
        await pyqAPI.upload(file, subject, semester, year, examType);
        alert('PYQ uploaded successfully!');
        event.target.reset();
        loadPYQs();
        loadDashboard();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deletePYQ(pyqId) {
    if (!confirm('Are you sure you want to delete this PYQ?')) return;
    
    try {
        await pyqAPI.delete(pyqId);
        alert('PYQ deleted successfully!');
        loadPYQs();
        loadDashboard();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Results Management
async function loadResults() {
    try {
        // For admin, we'll show empty state - admin can upload results for students
        // In a full implementation, we'd need an endpoint to get all results
        const listDiv = document.getElementById('resultsList');
        if (listDiv) {
            listDiv.innerHTML = '<div class="bg-white p-6 rounded-lg shadow"><p class="text-gray-500">No results uploaded yet. Use the upload form above to add results.</p></div>';
        }
    } catch (error) {
        console.error('Error loading results:', error);
        const listDiv = document.getElementById('resultsList');
        if (listDiv) {
            listDiv.innerHTML = `<div class="bg-white p-6 rounded-lg shadow"><p class="text-red-500">Error loading results: ${error.message}</p></div>`;
        }
    }
}

function displayResults(results) {
    const listDiv = document.getElementById('resultsList');
    if (!listDiv) return;
    
    if (results.length === 0) {
        listDiv.innerHTML = '<div class="bg-white p-6 rounded-lg shadow"><p class="text-gray-500">No results uploaded</p></div>';
        return;
    }
    
    // Group by student
    const byStudent = {};
    results.forEach(result => {
        if (!byStudent[result.student_id]) {
            byStudent[result.student_id] = [];
        }
        byStudent[result.student_id].push(result);
    });
    
    listDiv.innerHTML = Object.entries(byStudent).map(([studentId, studentResults]) => `
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Student: ${studentId}</h3>
            <div class="space-y-4">
                ${studentResults.map(result => `
                    <div class="border rounded-lg p-4">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-semibold">Semester ${result.semester} - ${result.academic_year}</h4>
                                <p class="text-gray-600">
                                    ${result.sgpa ? `SGPA: ${result.sgpa.toFixed(2)}` : ''}
                                    ${result.cgpa ? `| CGPA: ${result.cgpa.toFixed(2)}` : ''}
                                </p>
                            </div>
                            ${result.file_url ? `
                                <a href="${API_BASE_URL}${result.file_url}" target="_blank" 
                                   class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                                    View PDF
                                </a>
                            ` : ''}
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            ${result.subjects.map(subj => `
                                <div class="p-2 bg-gray-50 rounded">
                                    <span class="text-sm">${subj.subject}: </span>
                                    <span class="font-semibold">${subj.grade}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

async function handleResultUpload(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('resultStudentId').value;
    const semester = parseInt(document.getElementById('resultSemester').value);
    const academicYear = document.getElementById('resultAcademicYear').value;
    const file = document.getElementById('resultFile').files[0];
    
    // Create form data with query parameters
    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('semester', semester);
    formData.append('academic_year', academicYear);
    if (file) formData.append('file', file);
    
    try {
        // Build URL with query parameters
        const params = new URLSearchParams();
        params.append('student_id', studentId);
        params.append('semester', semester);
        params.append('academic_year', academicYear);
        
        const response = await fetch(`${API_BASE_URL}/api/results/?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Upload failed');
        }
        
        alert('Result uploaded successfully!');
        event.target.reset();
        loadResults();
        loadDashboard();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Analytics
async function loadAnalytics() {
    try {
        // Load attendance overview chart
        const attendance = await attendanceAPI.getRecords();
        loadAttendanceOverviewChart(attendance);
        
        // Load subject-wise attendance
        // This would require additional API endpoint or client-side processing
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function loadAttendanceOverviewChart(records) {
    const ctx = document.getElementById('attendanceOverviewChart');
    if (!ctx) return;
    
    // Count present vs absent
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    
    if (attendanceOverviewChart) {
        attendanceOverviewChart.destroy();
    }
    
    attendanceOverviewChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [present, absent],
                backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(239, 68, 68, 0.5)'],
                borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

