const DEFAULT_ADMIN_ACCOUNTS = {
    admin1: { password: 'psau2026', displayName: 'Admin One' },
    admin2: { password: 'psau2026', displayName: 'Admin Two' },
    admin3: { password: 'psau2026', displayName: 'Admin Three' },
    admin4: { password: 'psau2026', displayName: 'Admin Four' },
    admin5: { password: 'psau2026', displayName: 'Admin Five' }
};

function initializeData() {
    if (!localStorage.getItem('unihive_adminAccounts')) {
        localStorage.setItem('unihive_adminAccounts', JSON.stringify(DEFAULT_ADMIN_ACCOUNTS));
    }
    if (!localStorage.getItem('unihive_events')) {
        localStorage.setItem('unihive_events', JSON.stringify([
            {
                id: 1,
                title: 'Welcome Assembly',
                date: '2026-05-10',
                time: '09:00',
                location: 'Main Auditorium',
                description: 'Annual welcome assembly for all students and faculty.'
            },
            {
                id: 2,
                title: 'Sports Fest 2026',
                date: '2026-05-15',
                time: '08:00',
                location: 'Sports Complex',
                description: 'Inter-departmental sports competition.'
            }
        ]));
    }

    if (!localStorage.getItem('unihive_announcements')) {
        localStorage.setItem('unihive_announcements', JSON.stringify([
            {
                id: 1,
                title: 'System Maintenance',
                content: 'The campus portal will be under maintenance on May 8th.',
                priority: 'high',
                timestamp: new Date().toISOString()
            }
        ]));
    }

    if (!localStorage.getItem('unihive_schedule')) {
        localStorage.setItem('unihive_schedule', JSON.stringify([
            {
                id: 1,
                day: 'Monday',
                time: '08:00',
                activity: 'Classes Begin'
            },
            {
                id: 2,
                day: 'Friday',
                time: '16:00',
                activity: 'Weekend Prep Assembly'
            }
        ]));
    }
}

function getAdminAccounts() {
    return JSON.parse(localStorage.getItem('unihive_adminAccounts') || '{}');
}

function handleLogin(event) {
    event.preventDefault();
    
    const rawUsername = document.getElementById('username').value;
    const rawPassword = document.getElementById('password').value;
    const username = rawUsername.trim().toLowerCase();
    const password = rawPassword.trim();
    const errorDiv = document.getElementById('loginError');

    if (!username || !password) {
        errorDiv.textContent = 'Please enter both username and password';
        errorDiv.style.display = 'block';
        return;
    }
    
    const accounts = getAdminAccounts();
    if (accounts[username] && accounts[username].password === password) {
   
        localStorage.setItem('unihive_adminToken', 'logged_in_' + Date.now());
        localStorage.setItem('unihive_adminUser', username);
        window.location.href = 'admin-dashboard.html';
    } else {

        errorDiv.textContent = 'Invalid username or password';
        errorDiv.style.display = 'block';
        document.getElementById('password').value = '';
    }
}

function checkAuth() {
    const token = localStorage.getItem('unihive_adminToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('unihive_adminToken');
        localStorage.removeItem('unihive_adminUser');
        window.location.href = 'login.html';
    }
}

function switchTab(tabName, event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    const tabButtons = document.querySelectorAll('.tab-btn, header nav a');
    tabButtons.forEach(button => button.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', initializeData);
