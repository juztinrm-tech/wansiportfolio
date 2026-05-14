document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});


function loadDashboardData() {
    updateStatistics();
    loadUpcomingEvents();
    loadStudentEvents();
    loadStudentAnnouncements();
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

function loadStudentEvents() {
    const events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    const eventsList = document.getElementById('studentEventsList');

    if (!eventsList) return;

    const now = new Date();
    const upcomingEvents = events
        .map(event => ({
            ...event,
            dateObj: new Date(event.date + ' ' + event.time)
        }))
        .filter(event => event.dateObj >= now)
        .sort((a, b) => a.dateObj - b.dateObj);

    if (upcomingEvents.length === 0) {
        eventsList.innerHTML = '<p class="no-data">No upcoming events.</p>';
        return;
    }

    eventsList.innerHTML = upcomingEvents.map(event => `
        <div class="event-card">
            <div class="event-header">
                <h4>${event.title}</h4>
            </div>
            <p><strong>Date:</strong> ${event.dateObj.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description}</p>
        </div>
    `).join('');
}

function loadStudentAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('unihive_announcements') || '[]');
    const announcementsList = document.getElementById('studentAnnouncementsList');
    
    if (announcements.length === 0) {
        announcementsList.innerHTML = '<p class="no-data">No announcements.</p>';
        return;
    }
    
    announcementsList.innerHTML = announcements.map(ann => `
        <div class="announcement-card priority-${ann.priority}">
            <div class="announcement-header">
                <h4>${ann.title}</h4>
                <span class="priority-badge">${ann.priority.toUpperCase()}</span>
            </div>
            <p>${ann.content}</p>
            <p class="timestamp">${ann.timestamp}</p>
        </div>
    `).join('');
}


function switchTab(tabName) {
    event.preventDefault();
 
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
   
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    event.target.classList.add('active');
}

function updateStudentSummary() {
    const events = JSON.parse(localStorage.getItem('unihive_events') || '[]');
    const announcements = JSON.parse(localStorage.getItem('unihive_announcements') || '[]');
    const eventCount = events.length;
    const announcementCount = announcements.length;

    const nextEvent = events
        .map(event => ({
            ...event,
            dateObj: new Date(event.date)
        }))
        .filter(event => !isNaN(event.dateObj))
        .sort((a, b) => a.dateObj - b.dateObj)[0];

    document.getElementById('summary-events-count').textContent = eventCount;
    document.getElementById('summary-announcements-count').textContent = announcementCount;

    const nextEventText = nextEvent
        ? `${nextEvent.title} on ${nextEvent.dateObj.toLocaleDateString()} at ${nextEvent.time}`
        : 'No upcoming events available.';

    document.getElementById('summary-next-event').textContent = nextEventText;
}
