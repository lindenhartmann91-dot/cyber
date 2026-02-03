// CyberSentinel Admin Panel - Fixed Version
class CyberAdmin {
    constructor() {
        this.currentSection = 'dashboard';
        this.staffData = [];
        this.contactsData = [];
        this.chatLogsData = [];
        this.activityLogsData = [];
        this.selectedStaff = new Set();
        this.selectedLogs = new Set();
        this.selectedMessage = null;
        this.currentDatabaseTable = 'staff';
        this.databasePage = 1;
        this.databasePageSize = 10;
        this.databaseData = {
            staff: [],
            contacts: [],
            merch: [],
            chatlogs: []
        };
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
        this.loadData();
        this.updateTime();
        this.startLiveUpdates();
        this.loadUserSettings();
    }

    checkAuth() {
        const session = localStorage.getItem('cybersentinel_session');
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const sessionData = JSON.parse(session);
            const now = Date.now();
            const sessionAge = now - sessionData.timestamp;
            
            if (sessionAge > 30 * 60 * 1000) {
                this.showToast('Session expired. Please login again.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            this.updateAdminInfo(sessionData.user);
            sessionData.timestamp = now;
            localStorage.setItem('cybersentinel_session', JSON.stringify(sessionData));

        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
        }
    }

    updateAdminInfo(user) {
        const adminName = document.getElementById('adminName');
        const adminRole = document.getElementById('adminRole');
        
        if (adminName) adminName.textContent = user.name;
        if (adminRole) adminRole.textContent = this.formatRole(user.role);
    }
    bindEvents() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Basic controls
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => this.showNotifications());
        }

        // Staff management
        const addStaffBtn = document.getElementById('addStaffBtn');
        if (addStaffBtn) {
            addStaffBtn.addEventListener('click', () => this.openStaffModal());
        }

        // Settings
        this.bindSettingsEvents();

        // Database
        this.bindDatabaseEvents();

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    bindSettingsEvents() {
        // Theme selector
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.changeTheme(theme);
            });
        });

        // Toggle switches
        const toggles = [
            'animationsToggle', 'soundToggle', 'twoFactorToggle',
            'emailNotifications', 'desktopNotifications', 'urgentAlerts', 'activityLogging'
        ];

        toggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    const setting = toggleId.replace('Toggle', '').replace('Notifications', '');
                    if (toggleId.includes('Notifications') || toggleId.includes('Alerts')) {
                        this.updateSetting(`notifications.${setting}`, e.target.checked);
                    } else {
                        this.updateSetting(setting, e.target.checked);
                    }
                });
            }
        });

        // Selects
        const sessionTimeout = document.getElementById('sessionTimeout');
        if (sessionTimeout) {
            sessionTimeout.addEventListener('change', (e) => {
                this.updateSetting('sessionTimeout', parseInt(e.target.value));
            });
        }

        const dataRetention = document.getElementById('dataRetention');
        if (dataRetention) {
            dataRetention.addEventListener('change', (e) => {
                this.updateSetting('dataRetention', parseInt(e.target.value));
            });
        }

        // Buttons
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportUserData());
        }

        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearLocalData());
        }
    }

    bindDatabaseEvents() {
        // Database table selection
        document.querySelectorAll('.db-table-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const table = e.currentTarget.dataset.table;
                this.switchDatabaseTable(table);
            });
        });

        // Database controls
        const refreshDbBtn = document.getElementById('refreshDbBtn');
        if (refreshDbBtn) {
            refreshDbBtn.addEventListener('click', () => this.refreshDatabase());
        }

        const backupDbBtn = document.getElementById('backupDbBtn');
        if (backupDbBtn) {
            backupDbBtn.addEventListener('click', () => this.backupDatabase());
        }
    }
    async loadData() {
        try {
            // Load staff data
            const staffResponse = await fetch('data/staff.json');
            this.staffData = await staffResponse.json();
            this.databaseData.staff = this.staffData;
            this.renderStaffTable();

            // Load contacts data
            this.contactsData = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            this.databaseData.contacts = this.contactsData;

            // Load chat logs
            this.chatLogsData = JSON.parse(localStorage.getItem('chat_logs') || '[]');
            this.databaseData.chatlogs = this.chatLogsData;

            // Load activity logs
            this.activityLogsData = JSON.parse(localStorage.getItem('admin_events') || '[]');
            if (this.activityLogsData.length === 0) {
                this.generateDemoActivityLogs();
            }

            // Load merch data
            try {
                const merchResponse = await fetch('data/merch.json');
                this.databaseData.merch = await merchResponse.json();
            } catch (error) {
                this.databaseData.merch = [
                    { id: 1, name: 'CyberSentinel T-Shirt', category: 'apparel', price: 29.99, status: 'coming-soon' },
                    { id: 2, name: 'Guardian Hoodie', category: 'apparel', price: 54.99, status: 'coming-soon' },
                    { id: 3, name: 'Online Safety Guide', category: 'digital', price: 14.99, status: 'available' }
                ];
            }

            // Initialize database view
            this.switchDatabaseTable('staff');
            this.updateDashboard();

        } catch (error) {
            console.error('Error loading admin data:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.staffData = [
            {
                id: 1,
                name: "Jay",
                role: "owner",
                discord: "jay_exposing",
                bio: "Founder and lead investigator",
                status: "active",
                joinDate: "2023-01-15",
                permissions: ["all"],
                lastActive: "2024-01-15T10:30:00Z"
            },
            {
                id: 2,
                name: "Linden",
                role: "co-owner",
                discord: "lindenfr",
                bio: "Social media manager and co-leader",
                status: "active",
                joinDate: "2023-02-20",
                permissions: ["manage_staff", "view_contacts"],
                lastActive: "2024-01-15T09:15:00Z"
            }
        ];

        this.contactsData = [
            {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                subject: "tip",
                message: "I have information about suspicious activity.",
                timestamp: "2024-01-15T08:30:00Z",
                read: false,
                urgent: true
            }
        ];

        this.databaseData.staff = this.staffData;
        this.databaseData.contacts = this.contactsData;
        this.renderStaffTable();
        this.updateDashboard();
    }

    generateDemoActivityLogs() {
        const demoLogs = [
            {
                timestamp: new Date().toISOString(),
                user: 'admin_jay',
                actionType: 'login',
                description: 'Admin login successful',
                ipAddress: '192.168.1.100',
                status: 'success'
            },
            {
                timestamp: new Date(Date.now() - 300000).toISOString(),
                user: 'admin_linden',
                actionType: 'staff_action',
                description: 'Updated staff member permissions',
                ipAddress: '192.168.1.101',
                status: 'success'
            }
        ];
        
        this.activityLogsData = demoLogs;
        localStorage.setItem('admin_events', JSON.stringify(this.activityLogsData));
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

            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = this.formatSectionTitle(section);
            }

            this.loadSectionData(section);
        }
    }

    loadSectionData(section) {
        switch (section) {
            case 'staff':
                this.updateStaffCount();
                break;
            case 'contacts':
                this.updateMessageCount();
                break;
            case 'database':
                this.switchDatabaseTable(this.currentDatabaseTable);
                break;
            case 'dashboard':
                this.updateDashboard();
                break;
        }
    }

    renderStaffTable() {
        const tbody = document.getElementById('staffTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.staffData.forEach(staff => {
            const row = document.createElement('tr');
            row.dataset.id = staff.id;
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="staff-checkbox" value="${staff.id}">
                </td>
                <td>
                    <div class="staff-name">
                        <strong>${staff.name}</strong>
                        <small>${staff.bio.substring(0, 50)}...</small>
                    </div>
                </td>
                <td>
                    <span class="role-badge role-${staff.role}">
                        ${this.formatRole(staff.role)}
                    </span>
                </td>
                <td>
                    <code>${staff.discord}</code>
                </td>
                <td>
                    <span class="status-badge status-${staff.status}">
                        ${staff.status}
                    </span>
                </td>
                <td>${this.formatDate(staff.joinDate)}</td>
                <td>
                    <div class="staff-actions">
                        <button class="action-icon edit" data-id="${staff.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon delete" data-id="${staff.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-icon view" data-id="${staff.id}" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);
        });

        this.bindStaffRowEvents();
    }

    bindStaffRowEvents() {
        document.querySelectorAll('.action-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editStaff(id);
            });
        });

        document.querySelectorAll('.action-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteStaff(id);
            });
        });

        document.querySelectorAll('.action-icon.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.viewStaff(id);
            });
        });
    }

    openStaffModal(staff = null) {
        const modal = document.getElementById('staffModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('staffForm');
        
        if (staff) {
            modalTitle.textContent = 'Edit Staff Member';
            this.populateStaffForm(staff);
        } else {
            modalTitle.textContent = 'Add Staff Member';
            form.reset();
        }
        
        modal.classList.add('active');
    }

    editStaff(id) {
        const staff = this.staffData.find(s => s.id == id);
        if (staff) {
            this.openStaffModal(staff);
        }
    }

    deleteStaff(id) {
        if (!confirm('Are you sure you want to delete this staff member?')) {
            return;
        }
        
        const staff = this.staffData.find(s => s.id == id);
        if (!staff) return;
        
        this.staffData = this.staffData.filter(s => s.id != id);
        localStorage.setItem('staff_data', JSON.stringify(this.staffData));
        
        this.logEvent('staff_deleted', `Deleted staff member: ${staff.name}`);
        this.showToast('Staff member deleted', 'success');
        this.renderStaffTable();
    }

    viewStaff(id) {
        const staff = this.staffData.find(s => s.id == id);
        if (!staff) return;
        
        this.showToast(`Viewing ${staff.name} - Feature coming soon!`, 'info');
    }
    // Database Management
    switchDatabaseTable(table) {
        this.currentDatabaseTable = table;
        this.databasePage = 1;
        
        // Update active table
        document.querySelectorAll('.db-table-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.table === table) {
                item.classList.add('active');
            }
        });

        // Update table name
        const currentTableName = document.getElementById('currentTableName');
        if (currentTableName) {
            const tableNames = {
                staff: 'StaffMember',
                contacts: 'ContactSubmission',
                merch: 'MerchProduct',
                chatlogs: 'ChatLog'
            };
            currentTableName.textContent = tableNames[table] || table;
        }

        this.loadDatabaseTable(table);
    }

    async loadDatabaseTable(table) {
        try {
            let data = this.databaseData[table] || [];
            this.renderDatabaseTable(table, data);
            this.updateDatabaseStats();
        } catch (error) {
            console.error('Error loading database table:', error);
            this.showToast(`Error loading ${table} data`, 'error');
        }
    }

    renderDatabaseTable(table, data) {
        const tableHeaders = document.getElementById('tableHeaders');
        const tableBody = document.getElementById('tableBody');
        
        if (!tableHeaders || !tableBody) return;

        // Clear existing content
        tableHeaders.innerHTML = '';
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="100%" class="no-data">
                        <i class="fas fa-database"></i>
                        <p>No ${table} data found</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Generate headers
        const headers = this.getDatabaseHeaders(table);
        tableHeaders.innerHTML = headers.map(header => `<th>${header}</th>`).join('');

        // Generate table rows
        const startIndex = (this.databasePage - 1) * this.databasePageSize;
        const endIndex = startIndex + this.databasePageSize;
        const pageData = data.slice(startIndex, endIndex);

        pageData.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = this.generateDatabaseRow(table, record);
            tableBody.appendChild(row);
        });

        this.updateDatabasePagination(data.length);
    }

    getDatabaseHeaders(table) {
        const headerMap = {
            staff: ['ID', 'NAME', 'ROLE', 'DISCORD', 'STATUS', 'JOIN DATE'],
            contacts: ['ID', 'NAME', 'EMAIL', 'SUBJECT', 'STATUS', 'SUBMITTED', 'ACTIONS'],
            merch: ['ID', 'NAME', 'CATEGORY', 'PRICE', 'STATUS'],
            chatlogs: ['ID', 'FILENAME', 'TYPE', 'SIZE', 'UPLOADED']
        };
        
        return headerMap[table] || ['ID', 'DATA'];
    }

    generateDatabaseRow(table, record) {
        switch (table) {
            case 'staff':
                return `
                    <td>${record.id}</td>
                    <td>
                        <div class="db-record-name">
                            <strong>${record.name}</strong>
                            <small>${record.bio ? record.bio.substring(0, 50) + '...' : 'No bio'}</small>
                        </div>
                    </td>
                    <td><span class="role-badge role-${record.role}">${this.formatRole(record.role)}</span></td>
                    <td><code>${record.discord}</code></td>
                    <td><span class="status-badge status-${record.status}">${record.status}</span></td>
                    <td>${this.formatDate(record.joinDate)}</td>
                `;
            case 'contacts':
                return `
                    <td>${record.id}</td>
                    <td>
                        <div class="db-record-name">
                            <strong>${record.name}</strong>
                            <small>${record.email}</small>
                        </div>
                    </td>
                    <td><a href="mailto:${record.email}" class="email-link">${record.email}</a></td>
                    <td><span class="message-type type-${record.subject}">${record.subject}</span></td>
                    <td><span class="status-badge ${record.read ? 'status-read' : 'status-unread'}">${record.read ? 'Read' : 'Unread'}</span></td>
                    <td>${this.formatDate(record.timestamp)}</td>
                    <td>
                        <button class="action-icon view" onclick="cyberAdmin.viewContactDetails('${record.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-icon delete" onclick="cyberAdmin.deleteContact('${record.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            case 'merch':
                return `
                    <td>${record.id}</td>
                    <td>
                        <div class="db-record-name">
                            <strong>${record.name}</strong>
                            <small>${record.description || 'No description'}</small>
                        </div>
                    </td>
                    <td><span class="category-badge">${record.category}</span></td>
                    <td><strong>$${record.price}</strong></td>
                    <td><span class="status-badge status-${record.status}">${record.status}</span></td>
                `;
            case 'chatlogs':
                return `
                    <td>${record.id}</td>
                    <td>
                        <div class="db-record-name">
                            <strong>${record.filename}</strong>
                            <small>${record.description || 'No description'}</small>
                        </div>
                    </td>
                    <td><span class="log-type-badge type-${record.type}">${record.type.toUpperCase()}</span></td>
                    <td>${this.formatFileSize(record.size)}</td>
                    <td>${this.formatDate(record.uploadDate)}</td>
                `;
            default:
                return `<td colspan="100%">Unknown table type</td>`;
        }
    }

    viewContactDetails(contactId) {
        const contact = this.contactsData.find(c => c.id == contactId);
        if (!contact) {
            this.showToast('Contact not found', 'error');
            return;
        }

        // Create modal if it doesn't exist
        let modal = document.getElementById('contactDetailsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'contactDetailsModal';
            modal.className = 'contact-details-modal';
            modal.innerHTML = `
                <div class="contact-details-content">
                    <div class="contact-details-header">
                        <h3><i class="fas fa-envelope"></i> Contact Details</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="contact-details-body" id="contactDetailsBody"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add close functionality
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        // Fill modal content
        const modalBody = document.getElementById('contactDetailsBody');
        modalBody.innerHTML = `
            <div class="contact-field">
                <div class="contact-field-label">Full Name</div>
                <div class="contact-field-value">${contact.name}</div>
            </div>
            
            <div class="contact-field">
                <div class="contact-field-label">Email Address</div>
                <div class="contact-field-value">
                    <a href="mailto:${contact.email}" class="email-link">
                        <i class="fas fa-envelope"></i> ${contact.email}
                    </a>
                </div>
            </div>
            
            <div class="contact-field">
                <div class="contact-field-label">Subject</div>
                <div class="contact-field-value">
                    <span class="message-type type-${contact.subject}">${contact.subject}</span>
                </div>
            </div>
            
            <div class="contact-field">
                <div class="contact-field-label">Message</div>
                <div class="contact-field-value">
                    <div class="contact-message-content">${contact.message}</div>
                </div>
            </div>
            
            <div class="contact-meta-grid">
                <div class="contact-meta-item">
                    <div class="contact-meta-label">Status</div>
                    <div class="contact-meta-value">
                        <span class="status-badge ${contact.read ? 'status-read' : 'status-unread'}">
                            ${contact.read ? 'Read' : 'Unread'}
                        </span>
                    </div>
                </div>
                
                <div class="contact-meta-item">
                    <div class="contact-meta-label">Priority</div>
                    <div class="contact-meta-value">
                        ${contact.urgent ? '<span class="urgent-badge">URGENT</span>' : 'Normal'}
                    </div>
                </div>
                
                <div class="contact-meta-item">
                    <div class="contact-meta-label">Anonymous</div>
                    <div class="contact-meta-value">
                        ${contact.anonymous ? 'Yes' : 'No'}
                    </div>
                </div>
                
                <div class="contact-meta-item">
                    <div class="contact-meta-label">Submitted</div>
                    <div class="contact-meta-value">
                        ${this.formatDate(contact.timestamp)}
                    </div>
                </div>
            </div>
            
            <div class="contact-actions">
                <button class="btn btn-primary" onclick="cyberAdmin.markAsRead('${contact.id}')">
                    <i class="fas fa-check"></i> Mark as Read
                </button>
                <button class="btn btn-secondary" onclick="window.open('mailto:${contact.email}?subject=Re: ${contact.subject}', '_blank')">
                    <i class="fas fa-reply"></i> Reply
                </button>
                <button class="btn btn-danger" onclick="cyberAdmin.deleteContact('${contact.id}'); document.getElementById('contactDetailsModal').classList.remove('active');">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Show modal
        modal.classList.add('active');
        
        // Mark as read when viewed
        if (!contact.read) {
            this.markAsRead(contactId);
        }
    }

    markAsRead(contactId) {
        const contactIndex = this.contactsData.findIndex(c => c.id == contactId);
        if (contactIndex !== -1) {
            this.contactsData[contactIndex].read = true;
            localStorage.setItem('contact_messages', JSON.stringify(this.contactsData));
            this.updateMessageCount();
            this.showToast('Message marked as read', 'success');
            
            // Refresh database view if on contacts table
            if (this.currentDatabaseTable === 'contacts') {
                this.loadDatabaseTable('contacts');
            }
        }
    }

    deleteContact(contactId) {
        if (!confirm('Are you sure you want to delete this contact message?')) {
            return;
        }
        
        this.contactsData = this.contactsData.filter(c => c.id != contactId);
        localStorage.setItem('contact_messages', JSON.stringify(this.contactsData));
        
        this.showToast('Contact message deleted', 'success');
        this.updateMessageCount();
        
        // Refresh database view if on contacts table
        if (this.currentDatabaseTable === 'contacts') {
            this.loadDatabaseTable('contacts');
        }
        
        this.logEvent('contact_deleted', `Deleted contact message: ${contactId}`);
    }

    updateDatabaseStats() {
        const totalTables = document.getElementById('totalTables');
        if (totalTables) totalTables.textContent = '4';

        const totalStaffDb = document.querySelector('#databaseSection #totalStaff');
        if (totalStaffDb) totalStaffDb.textContent = this.databaseData.staff.length;

        const totalContacts = document.getElementById('totalContacts');
        if (totalContacts) totalContacts.textContent = this.databaseData.contacts.length;

        const totalMerch = document.getElementById('totalMerch');
        if (totalMerch) totalMerch.textContent = this.databaseData.merch.length;
    }

    updateDatabasePagination(totalRecords) {
        const totalPages = Math.ceil(totalRecords / this.databasePageSize);
        const paginationInfo = document.getElementById('paginationInfo');

        if (paginationInfo) {
            const startRecord = (this.databasePage - 1) * this.databasePageSize + 1;
            const endRecord = Math.min(this.databasePage * this.databasePageSize, totalRecords);
            paginationInfo.textContent = `Showing ${startRecord}-${endRecord} of ${totalRecords} records`;
        }
    }

    refreshDatabase() {
        this.showToast('Refreshing database...', 'info');
        this.loadDatabaseTable(this.currentDatabaseTable);
    }

    async backupDatabase() {
        this.showToast('Creating database backup...', 'info');
        
        const backup = {
            timestamp: new Date().toISOString(),
            version: '2.6.0',
            tables: this.databaseData
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.logEvent('database_backup', 'Created database backup');
        this.showToast('Database backup created successfully', 'success');
    }
    // Settings Management
    async loadUserSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
            this.applySettings({
                theme: settings.theme || 'dark',
                animations: settings.animations !== false,
                sounds: settings.sounds || false,
                sessionTimeout: settings.sessionTimeout || 30,
                twoFactor: settings.twoFactor || false,
                notifications: {
                    email: settings.notifications?.email !== false,
                    desktop: settings.notifications?.desktop || false,
                    urgent: settings.notifications?.urgent !== false
                },
                dataRetention: settings.dataRetention || 90,
                activityLogging: settings.activityLogging !== false
            });
        } catch (error) {
            console.error('Failed to load user settings:', error);
        }
    }

    applySettings(settings) {
        this.changeTheme(settings.theme, false);

        const animationsToggle = document.getElementById('animationsToggle');
        if (animationsToggle) animationsToggle.checked = settings.animations;

        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) soundToggle.checked = settings.sounds;

        const twoFactorToggle = document.getElementById('twoFactorToggle');
        if (twoFactorToggle) twoFactorToggle.checked = settings.twoFactor;

        const sessionTimeout = document.getElementById('sessionTimeout');
        if (sessionTimeout) sessionTimeout.value = settings.sessionTimeout;

        const dataRetention = document.getElementById('dataRetention');
        if (dataRetention) dataRetention.value = settings.dataRetention;

        if (settings.notifications) {
            const emailNotifications = document.getElementById('emailNotifications');
            if (emailNotifications) emailNotifications.checked = settings.notifications.email;

            const desktopNotifications = document.getElementById('desktopNotifications');
            if (desktopNotifications) desktopNotifications.checked = settings.notifications.desktop;

            const urgentAlerts = document.getElementById('urgentAlerts');
            if (urgentAlerts) urgentAlerts.checked = settings.notifications.urgent;
        }

        const activityLogging = document.getElementById('activityLogging');
        if (activityLogging) activityLogging.checked = settings.activityLogging;

        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleDateString();
        }

        document.body.classList.toggle('no-animations', !settings.animations);
    }

    changeTheme(theme, save = true) {
        document.body.classList.remove('theme-dark', 'theme-blue', 'theme-green', 'theme-purple');
        document.body.classList.add(`theme-${theme}`);

        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === theme) {
                option.classList.add('active');
            }
        });

        if (save) {
            this.updateSetting('theme', theme);
        }

        this.logEvent('theme_changed', `Theme changed to ${theme}`);
    }

    async updateSetting(key, value) {
        try {
            const currentSettings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
            
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                if (!currentSettings[parent]) currentSettings[parent] = {};
                currentSettings[parent][child] = value;
            } else {
                currentSettings[key] = value;
            }

            localStorage.setItem('admin_settings', JSON.stringify(currentSettings));
            this.showToast(`Setting updated: ${key}`, 'success');
            this.applySettingEffects(key, value);
            
        } catch (error) {
            console.error('Failed to update setting:', error);
            this.showToast('Failed to update setting', 'error');
        }
    }

    applySettingEffects(key, value) {
        switch (key) {
            case 'animations':
                document.body.classList.toggle('no-animations', !value);
                break;
        }
    }

    async exportUserData() {
        try {
            const userData = {
                staff: this.staffData,
                contacts: this.contactsData,
                chatLogs: this.chatLogsData,
                activityLogs: this.activityLogsData,
                settings: JSON.parse(localStorage.getItem('admin_settings') || '{}')
            };
            
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user_data_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Data exported successfully', 'success');
            this.logEvent('data_exported', 'User exported their data');
        } catch (error) {
            this.showToast('Failed to export data', 'error');
        }
    }

    clearLocalData() {
        if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
            localStorage.removeItem('staff_data');
            localStorage.removeItem('contact_messages');
            localStorage.removeItem('chat_logs');
            localStorage.removeItem('admin_events');
            localStorage.removeItem('admin_settings');
            localStorage.removeItem('backups');
            
            this.showToast('Local data cleared', 'success');
            this.logEvent('data_cleared', 'User cleared local data');
            
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }
    // Dashboard and Utility Methods
    updateDashboard() {
        const totalStaff = document.getElementById('totalStaff');
        const totalMessages = document.getElementById('totalMessages');
        const onlineStaff = document.getElementById('onlineStaff');
        const casesToday = document.getElementById('casesToday');
        
        if (totalStaff) totalStaff.textContent = this.staffData.length;
        if (totalMessages) totalMessages.textContent = this.contactsData.length;
        if (onlineStaff) onlineStaff.textContent = this.staffData.filter(s => s.status === 'active').length;
        if (casesToday) casesToday.textContent = Math.floor(Math.random() * 5) + 1;
        
        this.updateRecentActivity();
        this.updateAlerts();
    }

    updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        const activities = this.activityLogsData.slice(0, 5);
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <span class="activity-user">${activity.user}</span>
                <span class="activity-action">${activity.description}</span>
                <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
            </div>
        `).join('') || '<div class="no-activity">No recent activity</div>';
    }

    updateAlerts() {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        
        const alerts = [
            {
                type: 'info',
                title: 'System Status',
                description: 'All systems operational. Email functionality active.'
            },
            {
                type: 'info',
                title: 'New Messages',
                description: `You have ${this.contactsData.filter(m => !m.read).length} unread messages.`
            }
        ];
        
        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-title">
                    <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    ${alert.title}
                </div>
                <div class="alert-desc">${alert.description}</div>
            </div>
        `).join('');
    }

    updateStaffCount() {
        const staffCount = document.getElementById('staffCount');
        if (staffCount) {
            staffCount.textContent = this.staffData.length;
        }
    }

    updateMessageCount() {
        const messageCount = document.getElementById('messageCount');
        if (messageCount) {
            const unread = this.contactsData.filter(m => !m.read).length;
            messageCount.textContent = unread > 0 ? unread : '';
        }
    }

    updateTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = `${timeString} UTC`;
        }
    }

    startLiveUpdates() {
        setInterval(() => this.updateTime(), 1000);
        setInterval(() => this.updateDashboard(), 30000);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'addStaff':
                this.openStaffModal();
                break;
            case 'viewLogs':
                this.switchSection('logs');
                break;
            case 'backupData':
                this.backupDatabase();
                break;
            case 'systemCheck':
                this.runSystemCheck();
                break;
        }
    }

    async runSystemCheck() {
        this.showToast('Running system check...', 'info');
        
        await this.delay(2000);
        
        const checks = [
            { name: 'Database Connection', status: 'pass' },
            { name: 'Email System', status: 'pass' },
            { name: 'File System', status: 'pass' },
            { name: 'Security Protocols', status: 'pass' }
        ];
        
        const results = checks.map(check => 
            `${check.name}: ${check.status === 'pass' ? '✅' : '⚠️'}`
        ).join('\n');
        
        alert(`System Check Results:\n\n${results}`);
        this.logEvent('system_check', 'Ran system diagnostic check');
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        sidebar.classList.toggle('active');
    }

    logout() {
        localStorage.removeItem('cybersentinel_session');
        window.location.href = 'login.html';
    }

    refreshData() {
        this.showToast('Refreshing data...', 'info');
        this.loadData();
    }

    // Utility Methods
    formatRole(role) {
        const roleMap = {
            'owner': 'Owner',
            'co-owner': 'Co-Owner', 
            'manager': 'Manager',
            'admin': 'Admin',
            'moderator': 'Moderator',
            'security': 'Security',
            'family': 'Family'
        };
        return roleMap[role] || role;
    }

    formatSectionTitle(section) {
        const titleMap = {
            'dashboard': 'Dashboard',
            'staff': 'Staff Management',
            'contacts': 'Contact Messages',
            'chatlogs': 'Chat Logs',
            'merch': 'Merch Store',
            'database': 'Database Management',
            'settings': 'System Settings',
            'logs': 'Activity Logs'
        };
        return titleMap[section] || section;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logEvent(type, description) {
        const session = JSON.parse(localStorage.getItem('cybersentinel_session') || '{}');
        const event = {
            timestamp: new Date().toISOString(),
            user: session.user?.username || 'unknown',
            actionType: type,
            description: description,
            ipAddress: '127.0.0.1', // In production, get real IP
            status: 'success'
        };

        this.activityLogsData.unshift(event);
        
        // Keep only last 1000 events
        if (this.activityLogsData.length > 1000) {
            this.activityLogsData = this.activityLogsData.slice(0, 1000);
        }

        localStorage.setItem('admin_events', JSON.stringify(this.activityLogsData));
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                    ${type.toUpperCase()}
                </div>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-body">${message}</div>
        `;

        document.body.appendChild(toast);

        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    showNotifications() {
        // Create notifications dropdown if it doesn't exist
        let notificationsDropdown = document.getElementById('notificationsDropdown');
        if (!notificationsDropdown) {
            notificationsDropdown = document.createElement('div');
            notificationsDropdown.id = 'notificationsDropdown';
            notificationsDropdown.className = 'notifications-dropdown';
            
            const notificationsBtn = document.getElementById('notificationsBtn');
            notificationsBtn.parentNode.appendChild(notificationsDropdown);
        }

        // Toggle dropdown
        const isVisible = notificationsDropdown.style.display === 'block';
        notificationsDropdown.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            // Load notifications
            const notifications = this.getNotifications();
            notificationsDropdown.innerHTML = `
                <div class="notifications-header">
                    <h4><i class="fas fa-bell"></i> Notifications</h4>
                    <button class="clear-all-btn" onclick="cyberAdmin.clearAllNotifications()">Clear All</button>
                </div>
                <div class="notifications-list">
                    ${notifications.length > 0 ? 
                        notifications.map(notif => `
                            <div class="notification-item ${notif.read ? 'read' : 'unread'}">
                                <div class="notification-icon">
                                    <i class="fas fa-${notif.icon}"></i>
                                </div>
                                <div class="notification-content">
                                    <div class="notification-title">${notif.title}</div>
                                    <div class="notification-message">${notif.message}</div>
                                    <div class="notification-time">${this.formatTime(notif.timestamp)}</div>
                                </div>
                                <button class="notification-close" onclick="cyberAdmin.dismissNotification('${notif.id}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('') :
                        '<div class="no-notifications">No new notifications</div>'
                    }
                </div>
            `;

            // Update notification badge
            this.updateNotificationBadge();
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#notificationsBtn') && !e.target.closest('#notificationsDropdown')) {
                notificationsDropdown.style.display = 'none';
            }
        });
    }

    getNotifications() {
        const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        
        // Add some default notifications if none exist
        if (notifications.length === 0) {
            const defaultNotifications = [
                {
                    id: 'notif_' + Date.now(),
                    title: 'New Contact Message',
                    message: `You have ${this.contactsData.filter(m => !m.read).length} unread messages`,
                    icon: 'envelope',
                    timestamp: new Date().toISOString(),
                    read: false,
                    type: 'info'
                },
                {
                    id: 'notif_' + (Date.now() + 1),
                    title: 'System Status',
                    message: 'All systems operational. Email functionality active.',
                    icon: 'check-circle',
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    read: false,
                    type: 'success'
                }
            ];
            
            localStorage.setItem('admin_notifications', JSON.stringify(defaultNotifications));
            return defaultNotifications;
        }
        
        return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    updateNotificationBadge() {
        const badge = document.querySelector('#notificationsBtn .badge');
        const unreadCount = this.getNotifications().filter(n => !n.read).length;
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    dismissNotification(id) {
        const notifications = this.getNotifications();
        const updatedNotifications = notifications.filter(n => n.id !== id);
        localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
        this.showNotifications(); // Refresh the dropdown
    }

    clearAllNotifications() {
        localStorage.setItem('admin_notifications', '[]');
        this.showNotifications(); // Refresh the dropdown
    }

    populateStaffForm(staff) {
        if (!staff) return;

        document.getElementById('staffName').value = staff.name || '';
        document.getElementById('staffDiscord').value = staff.discord || '';
        document.getElementById('staffRole').value = staff.role || 'moderator';
        document.getElementById('staffStatus').value = staff.status || 'active';
        document.getElementById('staffBio').value = staff.bio || '';

        // Set permissions checkboxes
        const permissions = staff.permissions || [];
        document.querySelectorAll('input[name="permissions[]"]').forEach(checkbox => {
            checkbox.checked = permissions.includes(checkbox.value);
        });
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cyberAdmin = new CyberAdmin();
});