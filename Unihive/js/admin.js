
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }

    if (typeof initializeData === 'function') {
        initializeData();
    }

    displayAdminName();
    loadDashboardData();
    setupFormHandlers();
});

function setupFormHandlers() {
    document.getElementById('addEventForm')?.addEventListener('submit', handleEventFormSubmit);
    document.getElementById('announcementForm')?.addEventListener('submit', function(e) {
        addAnnouncement(e);
        closeAnnouncementModal();
    });
    document.getElementById('userForm')?.addEventListener('submit', handleUserFormSubmit);
}

function displayAdminName() {
    const username = localStorage.getItem('unihive_adminUser') || 'Admin';
    const accounts = JSON.parse(localStorage.getItem('unihive_adminAccounts') || '{}');
    const profileName = document.getElementById('profileName');
    if (profileName) {
        const displayName = accounts[username]?.displayName;
        profileName.textContent = displayName || username.replace(/^./, c => c.toUpperCase());
    }
}

function loadDashboardData() {
    updateStatistics();
    loadUpcomingEvents();
    loadAnnouncements();
    loadUsers();
    loadEvents();
}

function updateStatistics() {
    const events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    const announcements = JSON.parse(localStorage.getItem('unihive_announcements') || '[]');

    const now = new Date();
    const activeEvents = events.filter(event => {
        const eventDate = new Date(event.date + ' ' + event.time);
        return eventDate >= now;
    });

    document.getElementById('total-events-count').textContent = events.length;
    document.getElementById('announcements-count').textContent = announcements.length;
    document.getElementById('active-events-count').textContent = activeEvents.length;
}

function loadUpcomingEvents() {
    const events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    const eventsBody = document.getElementById('upcoming-events-body');

    if (!eventsBody) return;

    if (events.length === 0) {
        eventsBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: #666;">No upcoming events.</td></tr>';
        return;
    }

    const now = new Date();
    const upcomingEvents = events
        .map(event => ({
            ...event,
            dateObj: new Date(event.date + ' ' + event.time)
        }))
        .filter(event => event.dateObj >= now)
        .sort((a, b) => a.dateObj - b.dateObj)
        .slice(0, 10); // Show only first 10 upcoming events

    eventsBody.innerHTML = upcomingEvents.map(event => `
        <tr>
            <td>${event.title}</td>
            <td>${new Date(event.date).toLocaleDateString()} at ${event.time}</td>
            <td>${event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}</td>
        </tr>
    `).join('');
}

function addEvent(eventData) {
    const events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    events.push(eventData);
    localStorage.setItem('unihive_events', JSON.stringify(events));
    loadDashboardData();
}

function updateEvent(eventData) {
    let events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    events = events.map(e => e.id === eventData.id ? eventData : e);
    localStorage.setItem('unihive_events', JSON.stringify(events));
    loadDashboardData();
}

function loadEvents() {
    const events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    const eventCardsGrid = document.getElementById('eventCardsGrid');
    const eventsList = document.getElementById('eventsList');

    const sortedEvents = [...events].sort((a, b) => {
        const aDt = new Date(a.date + ' ' + a.time);
        const bDt = new Date(b.date + ' ' + b.time);
        return aDt - bDt;
    });

    if (eventCardsGrid) {
        if (sortedEvents.length === 0) {
            eventCardsGrid.innerHTML = '<div class="empty-state">No events available. Add one using the button above.</div>';
        } else {
            eventCardsGrid.innerHTML = sortedEvents.map(renderEventCard).join('');
        }
    }

    if (eventsList) {
        if (sortedEvents.length === 0) {
            eventsList.innerHTML = '<p class="no-data">No events yet.</p>';
        } else {
            eventsList.innerHTML = sortedEvents.map(event => `
                <div class="event-card">
                    <div class="event-header">
                        <h4>${event.title}</h4>
                        <button class="btn-delete" onclick="deleteEvent(${event.id})">Delete</button>
                    </div>
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Description:</strong> ${event.description}</p>
                </div>
            `).join('');
        }
    }
}

function renderEventCard(event) {
    return `
        <div class="event-card">
            <div class="event-card-header">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-actions">
                    <button class="action-btn view-btn" title="View" onclick="viewEvent(${event.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Edit" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete" onclick="deleteEvent(${event.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="event-card-body">
                <div class="event-info">
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </p>
                    <p class="event-datetime">
                        <i class="fas fa-clock"></i>
                        <span>${new Date(event.date).toLocaleDateString()} - ${event.time}</span>
                    </p>
                </div>
                <p class="event-description">${event.description}</p>
            </div>
        </div>
    `;
}

function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        let events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
        events = events.filter(e => e.id !== id);
        localStorage.setItem('unihive_events', JSON.stringify(events));
        loadDashboardData();
        alert('✅ Event deleted!');
    }
}

function viewEvent(id) {
    const events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    const event = events.find(e => e.id === id);
    if (!event) return;

    const content = document.getElementById('viewEventContent');
    content.innerHTML = `
        <p><strong>Title:</strong> ${event.title}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Description:</strong></p>
        <p>${event.description}</p>
    `;
    openViewEventModal();
}

function editEvent(id) {
    const events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    const event = events.find(e => e.id === id);
    if (!event) return;

    const form = document.getElementById('addEventForm');
    form.dataset.editId = id;
    document.querySelector('.modal-title').innerHTML = '<i class="fas fa-edit"></i> Edit Event';
    document.querySelector('.submit-btn[type="submit"]').textContent = 'Save Changes';
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventDate').value = `${event.date}T${event.time}`;

    const modal = document.getElementById('addEventModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleEventFormSubmit(e) {
    const title = document.getElementById('eventTitle').value.trim();
    const location = document.getElementById('eventLocation').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const dateTime = document.getElementById('eventDate').value;

    if (!title || !location || !description || !dateTime) {
        alert('Please complete all event fields.');
        return;
    }

    const [date, time] = dateTime.split('T');
    const eventData = {
        title,
        location,
        description,
        date,
        time
    };

    const form = document.getElementById('addEventForm');
    const editId = form.dataset.editId;

    if (editId) {
        eventData.id = parseInt(editId, 10);
        updateEvent(eventData);
        alert('✅ Event updated successfully!');
    } else {
        eventData.id = Date.now();
        addEvent(eventData);
        alert('✅ Event added successfully!');
    }

    closeAddEventModal();
}

function addAnnouncement(event) {
    event.preventDefault();
    
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const priority = document.getElementById('announcementPriority').value;
    
    const announcements = JSON.parse(localStorage.getItem('unihive_announcements') || '[]');
    
    const newAnnouncement = {
        id: Date.now(),
        title,
        content,
        priority,
        timestamp: new Date().toLocaleString()
    };
    
    announcements.unshift(newAnnouncement);
    localStorage.setItem('unihive_announcements', JSON.stringify(announcements));
    
    document.getElementById('announcementForm').reset();
    
    loadAnnouncements();
    alert('✅ Announcement posted successfully!');
}

function loadAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('unihive_announcements') || '[]');
    const announcementsGrid = document.getElementById('announcementsGrid');
    const announcementsList = document.getElementById('announcementsList');

    if (announcementsGrid) {
        if (announcements.length === 0) {
            announcementsGrid.innerHTML = '<div class="empty-state">No announcements available. Add one using the button above.</div>';
        } else {
            announcementsGrid.innerHTML = announcements.map(renderAnnouncementCard).join('');
        }
    }

    if (announcementsList) {
        if (announcements.length === 0) {
            announcementsList.innerHTML = '<p class="no-data">No announcements yet.</p>';
        } else {
            announcementsList.innerHTML = announcements.map(ann => `
                <div class="announcement-card priority-${ann.priority}">
                    <div class="announcement-header">
                        <h4>${ann.title}</h4>
                        <span class="priority-badge">${ann.priority.toUpperCase()}</span>
                        <button class="btn-delete" onclick="deleteAnnouncement(${ann.id})">Delete</button>
                    </div>
                    <p>${ann.content}</p>
                    <p class="timestamp">Posted: ${ann.timestamp}</p>
                </div>
            `).join('');
        }
    }
}

function renderAnnouncementCard(ann) {
    return `
        <div class="announcement-card priority-${ann.priority}">
            <div class="announcement-header">
                <h4>${ann.title}</h4>
                <span class="priority-badge">${ann.priority.toUpperCase()}</span>
                <button class="btn-delete" onclick="deleteAnnouncement(${ann.id})">Delete</button>
            </div>
            <p>${ann.content}</p>
            <p class="timestamp">Posted: ${ann.timestamp}</p>
        </div>
    `;
}

function openAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('announcementForm').reset();
}

function closeAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('announcementForm').reset();
}

function loadUsers() {
    const accounts = JSON.parse(localStorage.getItem('unihive_adminAccounts') || '{}');
    const usersGrid = document.getElementById('usersGrid');
    const userList = Object.entries(accounts).map(([username, data]) => ({ username, ...data }));

    if (usersGrid) {
        if (userList.length === 0) {
            usersGrid.innerHTML = '<div class="empty-state">No admin users found. Add one using the button above.</div>';
        } else {
            usersGrid.innerHTML = userList.map(user => renderUserCard(user)).join('');
        }
    }
}

function renderUserCard(user) {
    return `
        <div class="event-card user-card">
            <div class="event-card-header">
                <h3 class="event-title">${user.displayName || user.username}</h3>
                <div class="event-actions">
                    <button class="action-btn delete-btn" title="Remove" onclick="deleteUser('${user.username}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="event-card-body">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Display Name:</strong> ${user.displayName || '—'}</p>
            </div>
        </div>
    `;
}

function openUserModal() {
    const modal = document.getElementById('userModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('userForm').reset();
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('userForm').reset();
}

function deleteUser(username) {
    if (!confirm(`Remove admin user '${username}'?`)) return;
    const accounts = JSON.parse(localStorage.getItem('unihive_adminAccounts') || '{}');
    delete accounts[username];
    localStorage.setItem('unihive_adminAccounts', JSON.stringify(accounts));
    loadUsers();
}

function handleUserFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('newAdminUsername').value.trim().toLowerCase();
    const password = document.getElementById('newAdminPassword').value.trim();
    const displayName = document.getElementById('newAdminDisplayName').value.trim();

    if (!username || !password || !displayName) {
        alert('Please complete all fields.');
        return;
    }

    const accounts = JSON.parse(localStorage.getItem('unihive_adminAccounts') || '{}');
    if (accounts[username]) {
        alert('This username already exists. Choose another one.');
        return;
    }

    accounts[username] = { password, displayName };
    localStorage.setItem('unihive_adminAccounts', JSON.stringify(accounts));
    loadUsers();
    closeUserModal();
    alert('✅ Admin user added successfully!');
}

function deleteAnnouncement(id) {
    if (confirm('Are you sure you want to delete this announcement?')) {
        let announcements = JSON.parse(localStorage.getItem('unihive_announcements') || '[]');
        announcements = announcements.filter(a => a.id !== id);
        localStorage.setItem('unihive_announcements', JSON.stringify(announcements));
        loadAnnouncements();
        alert('✅ Announcement deleted!');
    }
}

function addScheduleItem(event) {
    event.preventDefault();
    
    const day = document.getElementById('scheduleDay').value;
    const time = document.getElementById('scheduleTime').value;
    const activity = document.getElementById('scheduleActivity').value;
    
    const schedule = JSON.parse(localStorage.getItem('unihive_schedule') || '[]');
    
    const newItem = {
        id: Date.now(),
        day,
        time,
        activity
    };
    
    schedule.push(newItem);
    localStorage.setItem('unihive_schedule', JSON.stringify(schedule));
    
    document.getElementById('scheduleForm').reset();
    
    loadSchedule();
    alert('✅ Schedule item added successfully!');
}

function loadSchedule() {
    const schedule = JSON.parse(localStorage.getItem('unihive_schedule') || '[]');
    const scheduleList = document.getElementById('scheduleList');
    
    if (schedule.length === 0) {
        scheduleList.innerHTML = '<p class="no-data">No schedule items yet.</p>';
        return;
    }
    
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedSchedule = schedule.sort((a, b) => 
        daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
    );
    
    scheduleList.innerHTML = sortedSchedule.map(item => `
        <div class="schedule-card">
            <div class="schedule-day">${item.day}</div>
            <div class="schedule-content">
                <p><strong>Time:</strong> ${item.time}</p>
                <p><strong>Activity:</strong> ${item.activity}</p>
            </div>
            <button class="btn-delete" onclick="deleteScheduleItem(${item.id})">Delete</button>
        </div>
    `).join('');
}

function deleteScheduleItem(id) {
    if (confirm('Are you sure you want to delete this schedule item?')) {
        let schedule = JSON.parse(localStorage.getItem('unihive_schedule') || '[]');
        schedule = schedule.filter(s => s.id !== id);
        localStorage.setItem('unihive_schedule', JSON.stringify(schedule));
        loadSchedule();
        alert('✅ Schedule item deleted!');
    }
}
