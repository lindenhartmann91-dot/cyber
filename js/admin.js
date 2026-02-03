// CyberSentinel Admin Dashboard
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }
    
    init() {
        this.checkAuth();
        this.bindEvents();
        this.loadDashboardData();
        this.startLiveUpdates();
    }
    
    checkAuth() {
        const auth = window.cyberAuth;
        if (!auth || !auth.isAuthenticated) {
            // Redirect to home page if not authenticated
            window.location.href = 'index.html';
            return;
        }
        
        // Update admin info
        auth.updateAdminInfo();
    }
    
    bindEvents() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                if (section) {
                    this.switchSection(section);
                }
            });
        });
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboardData());
        }
        
        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Auto-update time
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const timeElement = document.getElementById('dashboardTime');
            if (timeElement) {
                timeElement.textContent = `[${timeString} UTC]`;
            }
        }, 1000);
    }
    
    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
        
        // Update sections
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });
        
        const targetSection = document.getElementById(section + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = section;
            
            // Update page title
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = this.formatSectionTitle(section);
            }
            
            // Load section data
            this.loadSectionData(section);
        }
    }
    
    formatSectionTitle(section) {
        const titles = {
            'dashboard': 'Dashboard',
            'staff': 'Staff Management',
            'contacts': 'Contact Messages',
            'chatlogs': 'Chat Logs',
            'merch': 'Merch Store',
            'settings': 'System Settings'
        };
        return titles[section] || 'Dashboard';
    }
    
    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        sidebar.classList.toggle('active');
    }
    
    loadDashboardData() {
        // Load staff count
        const staff = [
            { name: 'Jay', role: 'owner', status: 'active' },
            { name: 'Linden', role: 'co-owner', status: 'active' },
            { name: 'Angelina', role: 'manager', status: 'active' },
            { name: 'Gisela', role: 'admin', status: 'active' },
            { name: 'Janet Doe', role: 'admin', status: 'active' }
        ];
        
        const totalStaff = document.getElementById('totalStaff');
        const onlineStaff = document.getElementById('onlineStaff');
        const staffCount = document.getElementById('staffCount');
        
        if (totalStaff) totalStaff.textContent = staff.length;
        if (onlineStaff) onlineStaff.textContent = staff.filter(s => s.status === 'active').length;
        if (staffCount) staffCount.textContent = staff.length;
        
        // Load message count
        const messages = [
            { name: 'John Doe', email: 'john@example.com', subject: 'Tip', time: '10:30', status: 'unread' },
            { name: 'Jane Smith', email: 'jane@example.com', subject: 'General', time: '09:15', status: 'read' },
            { name: 'Bob Wilson', email: 'bob@example.com', subject: 'Support', time: '08:45', status: 'read' }
        ];
        
        const totalMessages = document.getElementById('totalMessages');
        const messageCount = document.getElementById('messageCount');
        const recentMessagesTable = document.getElementById('recentMessagesTable');
        
        if (totalMessages) totalMessages.textContent = messages.length;
        if (messageCount) messageCount.textContent = messages.filter(m => m.status === 'unread').length;
        
        // Populate recent messages table
        if (recentMessagesTable) {
            recentMessagesTable.innerHTML = '';
            
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.name}</td>
                    <td>${message.email}</td>
                    <td>${message.subject}</td>
                    <td>${message.time}</td>
                    <td><span class="status-badge ${message.status}">${message.status}</span></td>
                `;
                recentMessagesTable.appendChild(row);
            });
        }
        
        // Update cases today
        const casesToday = document.getElementById('casesToday');
        if (casesToday) {
            casesToday.textContent = Math.floor(Math.random() * 5) + 1;
        }
        
        // Update active users
        const activeUsers = document.getElementById('activeUsers');
        if (activeUsers) {
            activeUsers.textContent = '1'; // Current admin
        }
        
        // Update pending items
        const pendingItems = document.getElementById('pendingItems');
        if (pendingItems) {
            pendingItems.textContent = Math.floor(Math.random() * 3);
        }
    }
    
    loadSectionData(section) {
        switch (section) {
            case 'staff':
                this.loadStaffData();
                break;
            case 'contacts':
                this.loadContactData();
                break;
            case 'dashboard':
                this.loadDashboardData();
                break;
        }
    }
    
    loadStaffData() {
        // This would load from API in production
        const staff = [
            { id: 1, name: 'Jay', role: 'owner', discord: 'jay_exposing', status: 'active', joinDate: '2023-01-15' },
            { id: 2, name: 'Linden', role: 'co-owner', discord: 'lindenfr', status: 'active', joinDate: '2023-02-20' },
            { id: 3, name: 'Angelina', role: 'manager', discord: 'angelina_g814', status: 'active', joinDate: '2023-03-10' },
            { id: 4, name: 'Gisela', role: 'admin', discord: 'catstar123', status: 'active', joinDate: '2023-04-05' },
            { id: 5, name: 'Janet Doe', role: 'admin', discord: 'janedoe47', status: 'active', joinDate: '2023-04-12' },
            { id: 6, name: 'Jpai', role: 'admin', discord: 'opalsshopfinds', status: 'active', joinDate: '2023-05-03' },
            { id: 7, name: 'Bailey', role: 'admin', discord: 'whitesloverit', status: 'active', joinDate: '2023-05-15' },
            { id: 8, name: 'CrashPanda', role: 'admin', discord: 'crashpanda', status: 'inactive', joinDate: '2023-06-01' }
        ];
        
        // Populate staff table in staff section
        const staffTable = document.getElementById('staffTable');
        if (staffTable) {
            staffTable.innerHTML = '';
            
            staff.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <input type="checkbox" class="staff-checkbox" value="${member.id}">
                    </td>
                    <td>
                        <div class="staff-name">
                            <strong>${member.name}</strong>
                            <small>${member.role}</small>
                        </div>
                    </td>
                    <td>
                        <span class="role-badge role-${member.role}">
                            ${member.role}
                        </span>
                    </td>
                    <td>
                        <code>${member.discord}</code>
                    </td>
                    <td>
                        <span class="status-badge status-${member.status}">
                            ${member.status}
                        </span>
                    </td>
                    <td>${member.joinDate}</td>
                    <td>
                        <div class="staff-actions">
                            <button class="action-icon edit" data-id="${member.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-icon delete" data-id="${member.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                staffTable.appendChild(row);
            });
        }
    }
    
    loadContactData() {
        // This would load from API in production
        const messages = [
            { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Tip', message: 'I have information about suspicious activity...', time: '2024-01-15 10:30', status: 'unread' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', subject: 'General', message: 'I would like to volunteer for your organization...', time: '2024-01-14 09:15', status: 'read' },
            { id: 3, name: 'Bob Wilson', email: 'bob@example.com', subject: 'Support', message: 'I need help with reporting an incident...', time: '2024-01-13 08:45', status: 'read' },
            { id: 4, name: 'Alice Johnson', email: 'alice@example.com', subject: 'Tip', message: 'Important information about online predator...', time: '2024-01-12 14:20', status: 'unread' },
            { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', subject: 'Collaboration', message: 'I represent an organization that would like to collaborate...', time: '2024-01-11 11:10', status: 'read' }
        ];
        
        // Populate messages list
        const messagesList = document.getElementById('messagesList');
        if (messagesList) {
            messagesList.innerHTML = '';
            
            messages.forEach(msg => {
                const item = document.createElement('div');
                item.className = `message-item ${msg.status}`;
                item.dataset.id = msg.id;
                item.innerHTML = `
                    <div class="message-preview">
                        <div class="message-sender">${msg.name}</div>
                        <div class="message-subject">${msg.subject}</div>
                        <div class="message-excerpt">${msg.message.substring(0, 80)}...</div>
                        <div class="message-meta">
                            <span class="message-time">${msg.time}</span>
                            <span class="message-type type-${msg.subject.toLowerCase()}">${msg.subject}</span>
                        </div>
                    </div>
                `;
                messagesList.appendChild(item);
            });
        }
    }
    
    handleQuickAction(action) {
        switch (action) {
            case 'addStaff':
                alert('Add Staff feature coming soon!');
                break;
            case 'viewLogs':
                alert('View Logs feature coming soon!');
                break;
            case 'backupData':
                this.backupData();
                break;
            case 'systemCheck':
                this.systemCheck();
                break;
        }
    }
    
    backupData() {
        alert('Starting backup...');
        setTimeout(() => {
            alert('Backup completed successfully!');
        }, 2000);
    }
    
    systemCheck() {
        alert('Running system check...');
        setTimeout(() => {
            alert('All systems operational!');
        }, 3000);
    }
    
    startLiveUpdates() {
        // Update system status randomly
        setInterval(() => {
            const statusElement = document.getElementById('systemStatus');
            if (statusElement) {
                const statuses = ['SYSTEM: ONLINE', 'SYSTEM: SECURE', 'SYSTEM: VIGILANT'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                statusElement.textContent = randomStatus;
            }
        }, 10000);
        
        // Update threat level randomly
        setInterval(() => {
            const threatElement = document.querySelector('.threat-level');
            if (threatElement) {
                const levels = ['low', 'medium'];
                const randomLevel = levels[Math.floor(Math.random() * levels.length)];
                threatElement.className = `threat-level ${randomLevel}`;
                threatElement.querySelector('.stat-value').textContent = randomLevel.toUpperCase();
            }
        }, 15000);
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
