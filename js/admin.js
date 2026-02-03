// CyberSentinel Admin Panel
class CyberAdmin {
    constructor() {
        this.currentSection = 'dashboard';
        this.staffData = [];
        this.contactsData = [];
        this.selectedStaff = new Set();
        this.selectedMessage = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
        this.loadData();
        this.initCharts();
        this.updateTime();
        this.startLiveUpdates();
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
            
            if (sessionAge > 30 * 60 * 1000) { // 30 minutes
                this.showToast('Session expired. Please login again.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            // Update admin info
            this.updateAdminInfo(sessionData.user);

            // Update session timestamp
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

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Add staff button
        const addStaffBtn = document.getElementById('addStaffBtn');
        if (addStaffBtn) {
            addStaffBtn.addEventListener('click', () => this.openStaffModal());
        }

        // Staff modal
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Staff form
        const staffForm = document.getElementById('staffForm');
        if (staffForm) {
            staffForm.addEventListener('submit', (e) => this.handleStaffSubmit(e));
        }

        // Staff search
        const staffSearch = document.getElementById('staffSearch');
        if (staffSearch) {
            staffSearch.addEventListener('input', (e) => this.searchStaff(e.target.value));
        }

        // Staff filter
        const roleFilter = document.getElementById('roleFilter');
        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => this.filterStaff());
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => this.filterStaff());
        }

        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }

        // Bulk actions
        const applyBulkAction = document.getElementById('applyBulkAction');
        if (applyBulkAction) {
            applyBulkAction.addEventListener('click', () => this.applyBulkAction());
        }

        // Delete all messages
        const deleteAllMessages = document.getElementById('deleteAllMessages');
        if (deleteAllMessages) {
            deleteAllMessages.addEventListener('click', () => this.deleteAllMessages());
        }

        // Message filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.filterMessages(type);
            });
        });

        // Message search
        const messageSearch = document.getElementById('messageSearch');
        if (messageSearch) {
            messageSearch.addEventListener('input', (e) => this.searchMessages(e.target.value));
        }

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('click', (e) => this.handleGlobalClick(e));
    }

    async loadData() {
        try {
            // Load staff data
            const staffResponse = await fetch('data/staff.json');
            this.staffData = await staffResponse.json();
            this.renderStaffTable();

            // Load contacts data
            this.contactsData = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            this.renderMessagesList();

            // Load activity logs
            await this.loadActivityLogs();

            // Update dashboard
            this.updateDashboard();

        } catch (error) {
            console.error('Error loading admin data:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        // Demo staff data
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

        // Demo contact messages
        this.contactsData = [
            {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                subject: "tip",
                message: "I have information about suspicious activity on platform X.",
                timestamp: "2024-01-15T08:30:00Z",
                read: false,
                urgent: true
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane@example.com",
                subject: "general",
                message: "I'd like to volunteer for your organization.",
                timestamp: "2024-01-14T14:20:00Z",
                read: true,
                urgent: false
            }
        ];

        this.renderStaffTable();
        this.renderMessagesList();
        this.updateDashboard();
    }

    async loadActivityLogs() {
        // Load from localStorage or API
        const logs = JSON.parse(localStorage.getItem('admin_events') || '[]');
        this.renderActivityLogs(logs.slice(0, 10));
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

            // Load section-specific data
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
            case 'dashboard':
                this.updateDashboard();
                break;
        }
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

        // Add event listeners
        this.bindStaffRowEvents();
    }

    bindStaffRowEvents() {
        // Checkboxes
        document.querySelectorAll('.staff-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.value;
                if (e.target.checked) {
                    this.selectedStaff.add(id);
                } else {
                    this.selectedStaff.delete(id);
                }
                this.updateSelectAllState();
            });
        });

        // Action buttons
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
            // Edit mode
            modalTitle.textContent = 'Edit Staff Member';
            this.populateStaffForm(staff);
        } else {
            // Add mode
            modalTitle.textContent = 'Add Staff Member';
            form.reset();
        }
        
        modal.classList.add('active');
    }

    populateStaffForm(staff) {
        const form = document.getElementById('staffForm');
        form.dataset.editId = staff.id;
        
        // Populate form fields
        document.getElementById('staffName').value = staff.name;
        document.getElementById('staffDiscord').value = staff.discord;
        document.getElementById('staffRole').value = staff.role;
        document.getElementById('staffStatus').value = staff.status;
        document.getElementById('staffBio').value = staff.bio || '';
        
        // Set permissions
        const permissions = staff.permissions || [];
        document.querySelectorAll('input[name="permissions[]"]').forEach(checkbox => {
            checkbox.checked = permissions.includes(checkbox.value);
        });
    }

    closeModal() {
        const modal = document.getElementById('staffModal');
        modal.classList.remove('active');
        const form = document.getElementById('staffForm');
        form.reset();
        delete form.dataset.editId;
    }

    async handleStaffSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Get permissions
        data.permissions = Array.from(form.querySelectorAll('input[name="permissions[]"]:checked'))
            .map(cb => cb.value);
        
        // Validate
        if (!this.validateStaffForm(data)) {
            return;
        }
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SAVING...';
        submitBtn.disabled = true;
        
        try {
            if (form.dataset.editId) {
                // Update existing staff
                await this.updateStaff(form.dataset.editId, data);
                this.showToast('Staff member updated successfully', 'success');
            } else {
                // Add new staff
                await this.addStaff(data);
                this.showToast('Staff member added successfully', 'success');
            }
            
            this.closeModal();
            this.loadData();
            
        } catch (error) {
            this.showToast('Error saving staff member: ' + error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateStaffForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            this.showToast('Please enter a valid name', 'error');
            return false;
        }
        
        if (!data.discord || !data.discord.includes('#')) {
            this.showToast('Please enter a valid Discord username (format: username#0000)', 'error');
            return false;
        }
        
        return true;
    }

    async addStaff(data) {
        // Generate ID
        const id = Date.now();
        const staff = {
            id: id,
            ...data,
            joinDate: new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString()
        };
        
        // Add to data
        this.staffData.push(staff);
        
        // Save to localStorage (in production, API call)
        localStorage.setItem('staff_data', JSON.stringify(this.staffData));
        
        // Log event
        this.logEvent('staff_added', `Added staff member: ${data.name}`);
    }

    async updateStaff(id, data) {
        const index = this.staffData.findIndex(s => s.id == id);
        if (index === -1) {
            throw new Error('Staff member not found');
        }
        
        // Update staff
        this.staffData[index] = {
            ...this.staffData[index],
            ...data
        };
        
        // Save to localStorage
        localStorage.setItem('staff_data', JSON.stringify(this.staffData));
        
        // Log event
        this.logEvent('staff_updated', `Updated staff member: ${data.name}`);
    }

    async deleteStaff(id) {
        if (!confirm('Are you sure you want to delete this staff member?')) {
            return;
        }
        
        const staff = this.staffData.find(s => s.id == id);
        if (!staff) return;
        
        // Remove from data
        this.staffData = this.staffData.filter(s => s.id != id);
        
        // Save to localStorage
        localStorage.setItem('staff_data', JSON.stringify(this.staffData));
        
        // Log event
        this.logEvent('staff_deleted', `Deleted staff member: ${staff.name}`);
        
        this.showToast('Staff member deleted', 'success');
        this.renderStaffTable();
    }

    viewStaff(id) {
        const staff = this.staffData.find(s => s.id == id);
        if (!staff) return;
        
        // Create view modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content cyber-border">
                <div class="modal-header">
                    <h3>Staff Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="staff-detail-view">
                        <div class="detail-header">
                            <div class="detail-avatar">
                                <i class="fas fa-user-secret"></i>
                            </div>
                            <div class="detail-info">
                                <h2>${staff.name}</h2>
                                <span class="role-badge role-${staff.role}">${this.formatRole(staff.role)}</span>
                            </div>
                        </div>
                        
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Discord</label>
                                <span>${staff.discord}</span>
                            </div>
                            <div class="detail-item">
                                <label>Status</label>
                                <span class="status-badge status-${staff.status}">${staff.status}</span>
                            </div>
                            <div class="detail-item">
                                <label>Join Date</label>
                                <span>${this.formatDate(staff.joinDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Last Active</label>
                                <span>${this.formatTime(staff.lastActive)}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Bio</h4>
                            <p>${staff.bio || 'No bio provided'}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Permissions</h4>
                            <div class="permissions-list">
                                ${(staff.permissions || []).map(perm => 
                                    `<span class="permission-badge">${perm}</span>`
                                ).join('') || '<em>No special permissions</em>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close event
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        modal.classList.add('active');
    }

    searchStaff(query) {
        const rows = document.querySelectorAll('#staffTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    filterStaff() {
        const role = document.getElementById('roleFilter').value;
        const status = document.getElementById('statusFilter').value;
        
        const rows = document.querySelectorAll('#staffTableBody tr');
        rows.forEach(row => {
            const rowRole = row.querySelector('.role-badge').textContent.toLowerCase();
            const rowStatus = row.querySelector('.status-badge').textContent.toLowerCase();
            
            const roleMatch = role === 'all' || rowRole.includes(role);
            const statusMatch = status === 'all' || rowStatus === status;
            
            row.style.display = roleMatch && statusMatch ? '' : 'none';
        });
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.staff-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checked;
            const id = cb.value;
            if (checked) {
                this.selectedStaff.add(id);
            } else {
                this.selectedStaff.delete(id);
            }
        });
    }

    updateSelectAllState() {
        const selectAll = document.getElementById('selectAll');
        if (!selectAll) return;
        
        const checkboxes = document.querySelectorAll('.staff-checkbox');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        selectAll.checked = checkedCount === checkboxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }

    applyBulkAction() {
        const action = document.getElementById('bulkAction').value;
        if (!action || this.selectedStaff.size === 0) {
            this.showToast('Please select staff members and choose an action', 'error');
            return;
        }
        
        if (!confirm(`Apply ${action} to ${this.selectedStaff.size} selected staff members?`)) {
            return;
        }
        
        // Apply action to selected staff
        this.selectedStaff.forEach(id => {
            const staff = this.staffData.find(s => s.id == id);
            if (staff) {
                switch (action) {
                    case 'activate':
                        staff.status = 'active';
                        break;
                    case 'deactivate':
                        staff.status = 'inactive';
                        break;
                    case 'promote':
                        // Promotion logic
                        break;
                    case 'demote':
                        // Demotion logic
                        break;
                    case 'delete':
                        this.staffData = this.staffData.filter(s => s.id != id);
                        break;
                }
            }
        });
        
        // Save changes
        localStorage.setItem('staff_data', JSON.stringify(this.staffData));
        
        // Log event
        this.logEvent('bulk_action', `Applied ${action} to ${this.selectedStaff.size} staff members`);
        
        // Refresh
        this.renderStaffTable();
        this.selectedStaff.clear();
        document.getElementById('bulkAction').value = '';
        
        this.showToast(`Action applied to ${this.selectedStaff.size} staff members`, 'success');
    }

    renderMessagesList() {
        const container = document.getElementById('messagesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.contactsData.forEach(message => {
            const item = document.createElement('div');
            item.className = `message-item ${message.read ? '' : 'unread'}`;
            item.dataset.id = message.id;
            
            item.innerHTML = `
                <div class="message-preview">
                    <div class="message-sender">${message.name}</div>
                    <div class="message-subject">${this.formatSubject(message.subject)}</div>
                    <div class="message-excerpt">${message.message.substring(0, 80)}...</div>
                    <div class="message-meta">
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                        <span class="message-type type-${message.subject}">${message.subject}</span>
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // Add click events
        this.bindMessageEvents();
    }

    bindMessageEvents() {
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.viewMessage(id);
            });
        });
        
        // Message action buttons
        const replyBtn = document.getElementById('replyBtn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => this.replyToMessage());
        }
        
        const deleteMessageBtn = document.getElementById('deleteMessageBtn');
        if (deleteMessageBtn) {
            deleteMessageBtn.addEventListener('click', () => this.deleteSelectedMessage());
        }
        
        const markReadBtn = document.getElementById('markReadBtn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => this.markMessageRead());
        }
    }

    viewMessage(id) {
        const message = this.contactsData.find(m => m.id == id);
        if (!message) return;
        
        this.selectedMessage = message;
        
        // Update UI
        document.querySelectorAll('.message-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.id == id) {
                item.classList.add('selected');
            }
        });
        
        // Show message details
        const container = document.getElementById('messageDetail');
        container.innerHTML = `
            <div class="message-detail-content">
                <div class="detail-header">
                    <div class="detail-sender">${message.name}</div>
                    <div class="detail-email"><i class="fas fa-envelope"></i> ${message.email}</div>
                    <div class="detail-time"><i class="fas fa-clock"></i> ${this.formatTime(message.timestamp)}</div>
                    <div class="detail-subject">
                        <span class="message-type type-${message.subject}">${message.subject.toUpperCase()}</span>
                        ${message.urgent ? '<span class="urgent-badge">URGENT</span>' : ''}
                        ${!message.read ? '<span class="unread-badge">UNREAD</span>' : ''}
                    </div>
                </div>
                
                <div class="detail-body">
                    <h4>Message:</h4>
                    <p>${message.message.replace(/\n/g, '<br>')}</p>
                </div>
                
                ${message.response ? `
                    <div class="detail-response">
                        <h4>Your Response:</h4>
                        <p>${message.response}</p>
                        <small>Sent: ${this.formatTime(message.responseTime)}</small>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Mark as read if unread
        if (!message.read) {
            message.read = true;
            this.updateMessageInStorage(message);
            
            // Update UI
            const messageItem = document.querySelector(`.message-item[data-id="${id}"]`);
            if (messageItem) {
                messageItem.classList.remove('unread');
            }
            
            this.updateMessageCount();
        }
    }

    filterMessages(type) {
        const items = document.querySelectorAll('.message-item');
        
        items.forEach(item => {
            if (type === 'all') {
                item.style.display = '';
            } else if (type === 'unread') {
                const isUnread = item.classList.contains('unread');
                item.style.display = isUnread ? '' : 'none';
            } else {
                const messageType = item.querySelector('.message-type').textContent.toLowerCase();
                item.style.display = messageType === type ? '' : 'none';
            }
        });
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });
    }

    searchMessages(query) {
        const items = document.querySelectorAll('.message-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    deleteAllMessages() {
        if (this.contactsData.length === 0) {
            this.showToast('No messages to delete', 'info');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ALL ${this.contactsData.length} messages? This cannot be undone.`)) {
            return;
        }
        
        this.contactsData = [];
        localStorage.setItem('contact_messages', JSON.stringify([]));
        
        this.renderMessagesList();
        document.getElementById('messageDetail').innerHTML = `
            <div class="no-selection">
                <i class="fas fa-envelope-open"></i>
                <p>Select a message to view details</p>
            </div>
        `;
        
        this.updateMessageCount();
        this.logEvent('messages_deleted', 'Deleted all contact messages');
        this.showToast('All messages deleted', 'success');
    }

    deleteSelectedMessage() {
        if (!this.selectedMessage) {
            this.showToast('No message selected', 'error');
            return;
        }
        
        if (!confirm('Delete this message?')) {
            return;
        }
        
        this.contactsData = this.contactsData.filter(m => m.id !== this.selectedMessage.id);
        localStorage.setItem('contact_messages', JSON.stringify(this.contactsData));
        
        this.selectedMessage = null;
        this.renderMessagesList();
        document.getElementById('messageDetail').innerHTML = `
            <div class="no-selection">
                <i class="fas fa-envelope-open"></i>
                <p>Select a message to view details</p>
            </div>
        `;
        
        this.updateMessageCount();
        this.logEvent('message_deleted', 'Deleted a contact message');
        this.showToast('Message deleted', 'success');
    }

    markMessageRead() {
        if (!this.selectedMessage) {
            this.showToast('No message selected', 'error');
            return;
        }
        
        this.selectedMessage.read = true;
        this.updateMessageInStorage(this.selectedMessage);
        
        // Update UI
        const messageItem = document.querySelector(`.message-item[data-id="${this.selectedMessage.id}"]`);
        if (messageItem) {
            messageItem.classList.remove('unread');
        }
        
        this.updateMessageCount();
        this.showToast('Marked as read', 'success');
    }

    replyToMessage() {
        if (!this.selectedMessage) {
            this.showToast('No message selected', 'error');
            return;
        }
        
        // Create reply modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content cyber-border">
                <div class="modal-header">
                    <h3>Reply to ${this.selectedMessage.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="replyForm">
                        <div class="form-group">
                            <label>To:</label>
                            <input type="text" value="${this.selectedMessage.name} <${this.selectedMessage.email}>" disabled>
                        </div>
                        <div class="form-group">
                            <label>Subject:</label>
                            <input type="text" value="Re: ${this.formatSubject(this.selectedMessage.subject)}" required>
                        </div>
                        <div class="form-group">
                            <label>Message:</label>
                            <textarea rows="8" required placeholder="Type your response..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary cancel-reply">Cancel</button>
                            <button type="submit" class="btn btn-primary">Send Reply</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add events
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-reply').addEventListener('click', () => modal.remove());
        modal.querySelector('#replyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendReply(e.target);
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        modal.classList.add('active');
    }

    sendReply(form) {
        const message = form.querySelector('textarea').value;
        
        // Update message with response
        this.selectedMessage.response = message;
        this.selectedMessage.responseTime = new Date().toISOString();
        this.selectedMessage.read = true;
        
        this.updateMessageInStorage(this.selectedMessage);
        
        // In production, this would send an actual email
        this.showToast('Reply sent successfully', 'success');
        this.logEvent('message_replied', `Replied to message from ${this.selectedMessage.name}`);
        
        // Refresh message view
        this.viewMessage(this.selectedMessage.id);
    }

    updateMessageInStorage(message) {
        const index = this.contactsData.findIndex(m => m.id === message.id);
        if (index !== -1) {
            this.contactsData[index] = message;
            localStorage.setItem('contact_messages', JSON.stringify(this.contactsData));
        }
    }

    updateDashboard() {
        // Update counts
        const totalStaff = document.getElementById('totalStaff');
        const totalMessages = document.getElementById('totalMessages');
        const onlineStaff = document.getElementById('onlineStaff');
        const casesToday = document.getElementById('casesToday');
        
        if (totalStaff) totalStaff.textContent = this.staffData.length;
        if (totalMessages) totalMessages.textContent = this.contactsData.length;
        if (onlineStaff) onlineStaff.textContent = this.staffData.filter(s => s.status === 'active').length;
        if (casesToday) casesToday.textContent = Math.floor(Math.random() * 5) + 1;
        
        // Update recent activity
        this.updateRecentActivity();
        
        // Update alerts
        this.updateAlerts();
    }

    updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        const activities = JSON.parse(localStorage.getItem('admin_events') || '[]').slice(0, 5);
        
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
                type: 'warning',
                title: 'System Backup Required',
                description: 'Last backup was 6 days ago. Schedule a backup soon.'
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

    initCharts() {
        // Initialize dashboard charts
        // This would use Chart.js or similar in production
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
        // Update time every second
        setInterval(() => this.updateTime(), 1000);
        
        // Update dashboard every 30 seconds
        setInterval(() => this.updateDashboard(), 30000);
    }

    handleResize() {
        // Handle responsive adjustments
        if (window.innerWidth > 1200) {
            const sidebar = document.querySelector('.admin-sidebar');
            sidebar.classList.remove('active');
        }
    }

    handleGlobalClick(e) {
        // Close dropdowns when clicking outside
        // Implementation depends on specific dropdown components
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
                this.backupData();
                break;
            case 'systemCheck':
                this.runSystemCheck();
                break;
        }
    }

    async backupData() {
        this.showToast('Starting backup...', 'info');
        
        // Simulate backup process
        await this.delay(2000);
        
        // Create backup object
        const backup = {
            timestamp: new Date().toISOString(),
            staff: this.staffData,
            messages: this.contactsData,
            logs: JSON.parse(localStorage.getItem('admin_events') || '[]')
        };
        
        // Save to localStorage
        const backups = JSON.parse(localStorage.getItem('backups') || '[]');
        backups.unshift(backup);
        
        // Keep only last 5 backups
        if (backups.length > 5) {
            backups.pop();
        }
        
        localStorage.setItem('backups', JSON.stringify(backups));
        
        this.logEvent('backup_created', 'Created system backup');
        this.showToast('Backup completed successfully', 'success');
    }

    async runSystemCheck() {
        this.showToast('Running system check...', 'info');
        
        // Simulate system check
        await this.delay(3000);
        
        const checks = [
            { name: 'Database Connection', status: 'pass' },
            { name: 'File System', status: 'pass' },
            { name: 'Security Protocols', status: 'pass' },
            { name: 'API Endpoints', status: 'warning' },
            { name: 'Backup System', status: 'pass' }
        ];
        
        // Show results
        const results = checks.map(check => 
            `${check.name}: ${check.status === 'pass' ? '✅' : '⚠️'}`
        ).join('\n');
        
        alert(`System Check Results:\n\n${results}`);
        
        this.logEvent('system_check', 'Ran system diagnostic check');
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                    ${type.toUpperCase()}
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Add close event
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

    logEvent(type, description) {
        const event = {
            timestamp: new Date().toISOString(),
            type: type,
            description: description,
            user: 'admin' // In production, get from session
        };
        
        const events = JSON.parse(localStorage.getItem('admin_events') || '[]');
        events.unshift(event);
        
        // Keep only last 1000 events
        if (events.length > 1000) {
            events.pop();
        }
        
        localStorage.setItem('admin_events', JSON.stringify(events));
    }

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
        
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return this.formatDate(dateString);
        }
    }

    formatSubject(subject) {
        const subjectMap = {
            'tip': 'Predator Tip',
            'general': 'General Inquiry',
            'support': 'Support Request',
            'collaboration': 'Collaboration',
            'other': 'Other'
        };
        
        return subjectMap[subject] || subject;
    }

    formatSectionTitle(section) {
        const titles = {
            'dashboard': 'Dashboard',
            'staff': 'Staff Management',
            'contacts': 'Contact Messages',
            'chatlogs': 'Chat Logs',
            'merch': 'Merch Store',
            'settings': 'System Settings',
            'logs': 'Activity Logs'
        };
        
        return titles[section] || section;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    window.cyberAdmin = new CyberAdmin();
});