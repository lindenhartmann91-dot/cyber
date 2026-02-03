// CyberSentinel Staff Dashboard
class StaffDashboard {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.checkStaffAuth();
        this.bindEvents();
        this.updateDateTime();
        this.loadStaffData();
    }

    checkStaffAuth() {
        const session = localStorage.getItem('cybersentinel_session');
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const sessionData = JSON.parse(session);
            const now = Date.now();
            const sessionAge = now - sessionData.timestamp;

            // Check session validity (30 minutes)
            if (sessionAge > 30 * 60 * 1000) {
                localStorage.removeItem('cybersentinel_session');
                window.location.href = 'login.html';
                return;
            }

            // Check if user is staff (not owner/co-owner)
            const userRole = sessionData.user.role;
            if (userRole === 'owner' || userRole === 'co-owner') {
                // Redirect owners/co-owners to admin dashboard
                window.location.href = 'admin-dashboard.html';
                return;
            }

            this.currentUser = sessionData.user;
            this.updateUserInfo();

        } catch (error) {
            console.error('Session validation error:', error);
            localStorage.removeItem('cybersentinel_session');
            window.location.href = 'login.html';
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        // Update all user name elements
        const nameElements = [
            'staffName', 'headerStaffName', 'welcomeStaffName', 'profileName'
        ];
        nameElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.currentUser.name || this.currentUser.username;
            }
        });

        // Update role elements
        const roleElements = [
            'staffRole', 'headerStaffRole', 'profileRole'
        ];
        roleElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.formatRole(this.currentUser.role);
            }
        });
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.admin-sidebar').classList.toggle('collapsed');
            });
        }

        // Settings
        this.bindSettingsEvents();

        // 2FA Setup
        const enable2FABtn = document.getElementById('enable2FABtn');
        if (enable2FABtn) {
            enable2FABtn.addEventListener('click', () => {
                this.setup2FA();
            });
        }

        // Change Password
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.showChangePasswordModal();
            });
        }
    }

    bindSettingsEvents() {
        // Theme change
        const themeSelect = document.getElementById('staffTheme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
            
            // Load saved theme
            const savedTheme = localStorage.getItem('staff_theme') || 'dark';
            themeSelect.value = savedTheme;
            this.changeTheme(savedTheme);
        }

        // Animations toggle
        const animationsToggle = document.getElementById('staffAnimations');
        if (animationsToggle) {
            animationsToggle.addEventListener('change', (e) => {
                this.toggleAnimations(e.target.checked);
            });
            
            // Load saved setting
            const savedAnimations = localStorage.getItem('staff_animations') !== 'false';
            animationsToggle.checked = savedAnimations;
            this.toggleAnimations(savedAnimations);
        }

        // Email notifications
        const emailNotifications = document.getElementById('emailNotifications');
        if (emailNotifications) {
            emailNotifications.addEventListener('change', (e) => {
                this.updateNotificationSettings('email', e.target.checked);
            });
            
            // Load saved setting
            const savedEmail = localStorage.getItem('staff_email_notifications') !== 'false';
            emailNotifications.checked = savedEmail;
        }

        // Desktop notifications
        const desktopNotifications = document.getElementById('desktopNotifications');
        if (desktopNotifications) {
            desktopNotifications.addEventListener('change', (e) => {
                this.updateNotificationSettings('desktop', e.target.checked);
            });
            
            // Load saved setting
            const savedDesktop = localStorage.getItem('staff_desktop_notifications') === 'true';
            desktopNotifications.checked = savedDesktop;
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update page title
        const titles = {
            dashboard: 'Staff Dashboard',
            profile: 'My Profile',
            tasks: 'My Tasks',
            reports: 'Reports',
            settings: 'Settings'
        };
        
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'Staff Dashboard';
        }

        this.currentSection = sectionName;
    }

    async loadStaffData() {
        try {
            // Load staff member data from the staff.json file
            const response = await fetch('data/staff.json');
            if (response.ok) {
                const staffData = await response.json();
                const currentStaff = staffData.find(member => 
                    member.name === this.currentUser.name || 
                    member.discord === this.currentUser.username
                );

                if (currentStaff) {
                    this.updateProfileData(currentStaff);
                }
            }

            // Update dashboard stats
            this.updateDashboardStats();

        } catch (error) {
            console.error('Error loading staff data:', error);
        }
    }

    updateProfileData(staffData) {
        // Update profile information
        const profileBio = document.getElementById('profileBio');
        if (profileBio) {
            profileBio.textContent = staffData.bio || 'No bio available.';
        }

        const profileDiscord = document.getElementById('profileDiscord');
        if (profileDiscord) {
            profileDiscord.textContent = staffData.discord || 'Not set';
        }

        const profileJoinDate = document.getElementById('profileJoinDate');
        if (profileJoinDate) {
            profileJoinDate.textContent = new Date(staffData.joinDate).toLocaleDateString();
        }

        const profileStatus = document.getElementById('profileStatus');
        if (profileStatus) {
            profileStatus.textContent = staffData.status || 'Active';
            profileStatus.className = `status-badge status-${staffData.status}`;
        }
    }

    updateDashboardStats() {
        // Simulate staff-specific stats
        const stats = {
            myTasks: Math.floor(Math.random() * 10) + 1,
            completedTasks: Math.floor(Math.random() * 20) + 5,
            pendingTasks: Math.floor(Math.random() * 5) + 1,
            myRating: (4.5 + Math.random() * 0.5).toFixed(1)
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });
    }

    updateDateTime() {
        const todayDate = document.getElementById('todayDate');
        if (todayDate) {
            todayDate.textContent = new Date().toLocaleDateString();
        }

        // Update every minute
        setInterval(() => {
            if (todayDate) {
                todayDate.textContent = new Date().toLocaleDateString();
            }
        }, 60000);
    }

    changeTheme(theme) {
        document.body.className = `admin-body ${theme}-theme`;
        localStorage.setItem('staff_theme', theme);
        this.showMessage(`Theme changed to ${theme}`, 'success');
    }

    toggleAnimations(enabled) {
        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
        localStorage.setItem('staff_animations', enabled);
    }

    updateNotificationSettings(type, enabled) {
        localStorage.setItem(`staff_${type}_notifications`, enabled);
        this.showMessage(`${type} notifications ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    setup2FA() {
        // Show 2FA setup modal
        this.show2FAModal();
    }

    show2FAModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-mobile-alt"></i> Setup Two-Factor Authentication</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="twofa-setup">
                        <div class="step active" id="step1">
                            <h4>Step 1: Choose 2FA Method</h4>
                            <div class="twofa-methods">
                                <button class="twofa-method-btn" data-method="app">
                                    <i class="fas fa-mobile-alt"></i>
                                    <span>Authenticator App</span>
                                    <small>Google Authenticator, Authy, etc.</small>
                                </button>
                                <button class="twofa-method-btn" data-method="sms">
                                    <i class="fas fa-sms"></i>
                                    <span>SMS</span>
                                    <small>Text message to your phone</small>
                                </button>
                                <button class="twofa-method-btn" data-method="email">
                                    <i class="fas fa-envelope"></i>
                                    <span>Email</span>
                                    <small>Code sent to your email</small>
                                </button>
                            </div>
                        </div>
                        
                        <div class="step" id="step2">
                            <h4>Step 2: Scan QR Code</h4>
                            <div class="qr-code-container">
                                <div class="qr-code-placeholder">
                                    <i class="fas fa-qrcode"></i>
                                    <p>QR Code will appear here</p>
                                </div>
                                <p>Scan this QR code with your authenticator app</p>
                                <div class="backup-codes">
                                    <h5>Backup Codes (Save these safely):</h5>
                                    <div class="codes-list" id="backupCodes"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step" id="step3">
                            <h4>Step 3: Verify Setup</h4>
                            <div class="verification-form">
                                <label for="verificationCode">Enter the 6-digit code from your app:</label>
                                <input type="text" id="verificationCode" maxlength="6" placeholder="000000">
                                <button class="btn btn-primary" id="verify2FABtn">Verify & Enable 2FA</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind modal events
        this.bind2FAModalEvents(modal);
    }

    bind2FAModalEvents(modal) {
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Method selection
        modal.querySelectorAll('.twofa-method-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method;
                this.setup2FAMethod(method, modal);
            });
        });

        // Verification
        const verifyBtn = modal.querySelector('#verify2FABtn');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', () => {
                this.verify2FASetup(modal);
            });
        }
    }

    setup2FAMethod(method, modal) {
        // Hide step 1, show step 2
        modal.querySelector('#step1').classList.remove('active');
        modal.querySelector('#step2').classList.add('active');

        // Generate backup codes
        const backupCodes = this.generateBackupCodes();
        const codesContainer = modal.querySelector('#backupCodes');
        codesContainer.innerHTML = backupCodes.map(code => 
            `<div class="backup-code">${code}</div>`
        ).join('');

        // Simulate QR code generation
        setTimeout(() => {
            const qrPlaceholder = modal.querySelector('.qr-code-placeholder');
            qrPlaceholder.innerHTML = `
                <div class="qr-code-generated">
                    <i class="fas fa-qrcode" style="font-size: 100px; color: #333;"></i>
                    <p>QR Code Generated</p>
                    <small>Secret: JBSWY3DPEHPK3PXP</small>
                </div>
            `;
            
            // Show step 3
            setTimeout(() => {
                modal.querySelector('#step2').classList.remove('active');
                modal.querySelector('#step3').classList.add('active');
            }, 2000);
        }, 1000);
    }

    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
        }
        return codes;
    }

    verify2FASetup(modal) {
        const code = modal.querySelector('#verificationCode').value;
        
        if (code.length !== 6) {
            this.showMessage('Please enter a 6-digit code', 'error');
            return;
        }

        // Simulate verification
        setTimeout(() => {
            localStorage.setItem('staff_2fa_enabled', 'true');
            this.showMessage('2FA enabled successfully!', 'success');
            modal.remove();
            
            // Update button text
            const enable2FABtn = document.getElementById('enable2FABtn');
            if (enable2FABtn) {
                enable2FABtn.innerHTML = '<i class="fas fa-shield-check"></i> 2FA Enabled';
                enable2FABtn.disabled = true;
                enable2FABtn.classList.add('btn-success');
            }
        }, 1500);
    }

    showChangePasswordModal() {
        // Implementation for password change modal
        this.showMessage('Password change feature coming soon!', 'info');
    }

    logout() {
        localStorage.removeItem('cybersentinel_session');
        window.location.href = 'login.html';
    }

    formatRole(role) {
        const roleMap = {
            'manager': 'Manager',
            'admin': 'Admin',
            'moderator': 'Moderator',
            'security': 'Security',
            'family': 'Family'
        };
        return roleMap[role] || role;
    }

    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `admin-message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="message-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(messageEl);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
        
        // Add close functionality
        messageEl.querySelector('.message-close').addEventListener('click', () => {
            messageEl.remove();
        });
    }
}

// Initialize staff dashboard
document.addEventListener('DOMContentLoaded', () => {
    new StaffDashboard();
});