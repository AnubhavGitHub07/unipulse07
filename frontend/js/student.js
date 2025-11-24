// Student portal functionality

let attendanceChart = null;

// Tab switching
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    const user = getUser();
    if (!user || user.role !== 'student') {
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
    loadTimetable();
    loadPYQs();
    loadResults();
    
    // Attendance filters
    document.getElementById('filterAttendanceBtn')?.addEventListener('click', () => {
        loadAttendance();
    });
    
    // PYQ filters
    document.getElementById('filterPyqBtn')?.addEventListener('click', () => {
        loadPYQs();
    });
});

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-indigo-600', 'border-indigo-600');
        btn.classList.add('text-gray-500');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active', 'text-indigo-600', 'border-indigo-600');
            btn.classList.remove('text-gray-500');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tabName).classList.remove('hidden');
    
    // Load data for active tab
    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'attendance') loadAttendance();
    else if (tabName === 'timetable') loadTimetable();
    else if (tabName === 'pyq') loadPYQs();
    else if (tabName === 'results') loadResults();
}

// Dashboard
async function loadDashboard() {
    try {
        // Load overall attendance
        const stats = await attendanceAPI.getStats();
        document.getElementById('overallAttendance').textContent = 
            stats.percentage ? `${stats.percentage.toFixed(1)}%` : '-';
        
        // Load CGPA
        const cgpaData = await resultsAPI.getCGPA();
        document.getElementById('cgpa').textContent = 
            cgpaData.cgpa ? cgpaData.cgpa.toFixed(2) : '-';
        
        // Load PYQ count
        const pyqs = await pyqAPI.getPYQs();
        document.getElementById('totalPyqs').textContent = pyqs.length;
        
        // Load subject-wise attendance chart
        loadAttendanceChart();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadAttendanceChart() {
    try {
        const stats = await attendanceAPI.getSubjectWiseStats();
        
        if (attendanceChart) {
            attendanceChart.destroy();
        }
        
        const ctx = document.getElementById('attendanceChart');
        if (!ctx) return;
        
        const subjects = stats.subjects.map(s => s.subject);
        const percentages = stats.subjects.map(s => s.percentage);
        
        attendanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Attendance %',
                    data: percentages,
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading attendance chart:', error);
    }
}

// Attendance
async function loadAttendance() {
    try {
        const subject = document.getElementById('attendanceSubjectFilter')?.value || '';
        const startDate = document.getElementById('attendanceStartDate')?.value || '';
        const endDate = document.getElementById('attendanceEndDate')?.value || '';
        
        const records = await attendanceAPI.getRecords({
            subject: subject || null,
            start_date: startDate || null,
            end_date: endDate || null
        });
        
        // Update table
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">No records found</td></tr>';
            return;
        }
        
        tbody.innerHTML = records.map(record => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.subject}</td>
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
        
        // Load subject-wise stats
        const subjectStats = await attendanceAPI.getSubjectWiseStats();
        const statsDiv = document.getElementById('subjectStats');
        if (statsDiv) {
            statsDiv.innerHTML = subjectStats.subjects.map(stat => `
                <div class="border rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-semibold">${stat.subject}</h4>
                        <span class="text-2xl font-bold text-indigo-600">${stat.percentage.toFixed(1)}%</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        Present: ${stat.present} | Absent: ${stat.absent} | Total: ${stat.total_classes}
                    </div>
                </div>
            `).join('');
        }
        
        // Populate subject filter
        const subjectFilter = document.getElementById('attendanceSubjectFilter');
        if (subjectFilter && subjectStats.subjects.length > 0) {
            const currentValue = subjectFilter.value;
            const subjects = [...new Set(subjectStats.subjects.map(s => s.subject))];
            subjectFilter.innerHTML = '<option value="">All Subjects</option>' + 
                subjects.map(s => `<option value="${s}">${s}</option>`).join('');
            if (currentValue) subjectFilter.value = currentValue;
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// Timetable
async function loadTimetable() {
    try {
        const timetable = await timetableAPI.getCurrentWeek();
        const content = document.getElementById('timetableContent');
        if (!content) return;
        
        if (!timetable.timetable || timetable.timetable.length === 0) {
            content.innerHTML = '<p class="text-gray-500">No timetable available</p>';
            return;
        }
        
        // Group by day
        const byDay = {};
        timetable.timetable.forEach(entry => {
            if (!byDay[entry.day]) {
                byDay[entry.day] = [];
            }
            byDay[entry.day].push(...entry.time_slots);
        });
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        content.innerHTML = days.map(day => {
            const slots = byDay[day] || [];
            if (slots.length === 0) return '';
            
            return `
                <div class="mb-6 border rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">${day}</h3>
                    <div class="space-y-2">
                        ${slots.map(slot => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                    <span class="font-medium">${slot.start_time} - ${slot.end_time}</span>
                                    <span class="ml-4 text-indigo-600 font-semibold">${slot.subject}</span>
                                    ${slot.faculty ? `<span class="ml-2 text-gray-600">(${slot.faculty})</span>` : ''}
                                    ${slot.room ? `<span class="ml-2 text-gray-500">Room: ${slot.room}</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading timetable:', error);
    }
}

// PYQs
async function loadPYQs() {
    try {
        const subject = document.getElementById('pyqSubjectFilter')?.value || '';
        const semester = document.getElementById('pyqSemesterFilter')?.value || '';
        const year = document.getElementById('pyqYearFilter')?.value || '';
        const examType = document.getElementById('pyqExamTypeFilter')?.value || '';
        
        const pyqs = await pyqAPI.getPYQs({
            subject: subject || null,
            semester: semester ? parseInt(semester) : null,
            year: year ? parseInt(year) : null,
            exam_type: examType || null
        });
        
        const listDiv = document.getElementById('pyqList');
        if (!listDiv) return;
        
        if (pyqs.length === 0) {
            listDiv.innerHTML = '<div class="bg-white p-6 rounded-lg shadow"><p class="text-gray-500">No PYQs found</p></div>';
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
                        <p class="text-sm text-gray-500 mt-1">Uploaded: ${new Date(pyq.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    <a href="${API_BASE_URL}${pyq.file_url}" target="_blank" 
                       class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Download
                    </a>
                </div>
            </div>
        `).join('');
        
        // Load subjects for filter
        const subjects = await pyqAPI.getSubjects();
        const subjectFilter = document.getElementById('pyqSubjectFilter');
        if (subjectFilter && subjects.subjects) {
            const currentValue = subjectFilter.value;
            subjectFilter.innerHTML = '<option value="">All Subjects</option>' +
                subjects.subjects.map(s => `<option value="${s}">${s}</option>`).join('');
            if (currentValue) subjectFilter.value = currentValue;
        }
    } catch (error) {
        console.error('Error loading PYQs:', error);
    }
}

// Results
async function loadResults() {
    try {
        const results = await resultsAPI.getResults();
        const listDiv = document.getElementById('resultsList');
        if (!listDiv) return;
        
        if (results.length === 0) {
            listDiv.innerHTML = '<div class="bg-white p-6 rounded-lg shadow"><p class="text-gray-500">No results available</p></div>';
            return;
        }
        
        listDiv.innerHTML = results.map(result => `
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800">
                            Semester ${result.semester} - ${result.academic_year}
                        </h3>
                        <p class="text-gray-600 mt-1">
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
                <div class="border-t pt-4">
                    <h4 class="font-semibold mb-2">Subjects:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        ${result.subjects.map(subj => `
                            <div class="flex justify-between p-2 bg-gray-50 rounded">
                                <span>${subj.subject}</span>
                                <span class="font-semibold">${subj.grade}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

