// CyberSentinel Authentication System
class CyberAuth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.init();
    }
    
    init() {
        this.checkExistingSession();
        this.bindEvents();
        this.setupAutoLogout();
    }
    
    bindEvents() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        // Close modal button
        const closeModal = document.getElementById('closeLoginModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideLoginModal());
        }
        
        // Admin login form
        const adminForm = document.getElementById('adminLoginForm');
        if (adminForm) {
            adminForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
        }
        
        // Logout buttons
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        const dashboardLogout = document.getElementById('dashboardLogout');
        if (dashboardLogout) {
            dashboardLogout.addEventListener('click', () => this.logout());
        }
        
        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }
        
        // Close modal on outside click
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideLoginModal();
                }
            });
        }
    }
    
    // Admin credentials (hidden in production - use server-side validation)
    ADMIN_CREDENTIALS = {
        'admin': {
            password: '120520', // admin+ user: login password: 120520
            name: 'System Administrator',
            role: 'owner',
            permissions: ['all']
        },
        'jay': {
            password: 'CyberSentinel2024',
            name: 'Jay (Owner)',
            role: 'owner',
            permissions: ['all']
        },
        'linden': {
            password: 'SecurePass123',
            name: 'Linden (Co-Owner)',
            role: 'co-owner',
            permissions: ['manage_staff', 'view_contacts']
        }
    };
    
    async handleAdminLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        
        // Validate credentials
        const isValid = this.validateAdminCredentials(username, password);
        
        if (isValid) {
            // Successful login
            const user = this.ADMIN_CREDENTIALS[username];
            const session = {
                user: {
                    name: user.name,
                    username: username,
                    role: user.role,
                    permissions: user.permissions
                },
                token: this.generateSessionToken(),
                expires: Date.now() + (30 * 60 * 1000) // 30 minutes
            };
            
            // Store session
            localStorage.setItem('cybersentinel_session', JSON.stringify(session));
            
            // Update state
            this.currentUser = session.user;
            this.sessionToken = session.token;
            this.isAuthenticated = true;
            
            this.showMessage('Authentication successful! Redirecting...', 'success');
            this.hideLoginModal();
            this.updateAuthUI();
            
            // Clear form
            form.reset();
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            // Failed login
            this.showMessage('Invalid credentials. Please try again.', 'error');
        }
    }
    
    validateAdminCredentials(username, password) {
        // Check if username exists
        if (!this.ADMIN_CREDENTIALS[username]) {
            return false;
        }
        
        // Check password
        const user = this.ADMIN_CREDENTIALS[username];
        return user.password === password;
    }
    
    checkExistingSession() {
        try {
            const sessionData = localStorage.getItem('cybersentinel_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                // Check if session expired
                if (session.expires > Date.now()) {
                    this.currentUser = session.user;
                    this.sessionToken = session.token;
                    this.isAuthenticated = true;
                    this.updateAuthUI();
                    
                    // Update admin info in dashboard
                    this.updateAdminInfo();
                    
                    // If on login page, redirect to dashboard
                    if (window.location.pathname.includes('login.html')) {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    // Session expired
                    this.logout();
                }
            }
        } catch (error) {
            console.error('Session check failed:', error);
            this.logout();
        }
    }
    
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Clear any messages
            const authMessage = document.getElementById('authMessage');
            if (authMessage) {
                authMessage.style.display = 'none';
            }
        }
    }
    
    updateAuthUI() {
        const authSection = document.getElementById('authSection');
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const secureNotice = document.getElementById('secureNotice');
        
        if (this.isAuthenticated && this.currentUser) {
            // User is logged in
            if (authSection) authSection.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.name;
            if (secureNotice) secureNotice.style.display = 'block';
        } else {
            // User is not logged in
            if (authSection) authSection.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
            if (secureNotice) secureNotice.style.display = 'block';
        }
    }
    
    updateAdminInfo() {
        const adminName = document.getElementById('adminName');
        const adminRole = document.getElementById('adminRole');
        const adminAvatar = document.getElementById('adminAvatar');
        
        if (this.currentUser) {
            if (adminName) adminName.textContent = this.currentUser.name;
            if (adminRole) adminRole.textContent = this.currentUser.role.toUpperCase();
            
            // Set avatar based on role
            if (adminAvatar) {
                const icon = this.getRoleIcon(this.currentUser.role);
                adminAvatar.innerHTML = `<i class="fas fa-${icon}"></i>`;
            }
        }
    }
    
    getRoleIcon(role) {
        const icons = {
            'owner': 'crown',
            'co-owner': 'user-shield',
            'admin': 'user-tie',
            'manager': 'user-cog',
            'moderator': 'user-check',
            'security': 'user-secret'
        };
        return icons[role] || 'user';
    }
    
    logout() {
        // Clear session
        localStorage.removeItem('cybersentinel_session');
        
        // Reset state
        this.currentUser = null;
        this.sessionToken = null;
        this.isAuthenticated = false;
        
        // Update UI
        this.updateAuthUI();
        
        // Redirect to home page if on dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
        
        // Show logout message
        this.showMessage('Successfully logged out.', 'success');
    }
    
    generateSessionToken() {
        return 'cs_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now().toString(36);
    }
    
    showMessage(message, type = 'info') {
        const authMessage = document.getElementById('authMessage');
        if (authMessage) {
            authMessage.textContent = message;
            authMessage.className = `auth-message ${type}`;
            authMessage.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                authMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('adminPassword');
        const toggleIcon = document.getElementById('togglePassword');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }
    
    setupAutoLogout() {
        // Check session every minute
        setInterval(() => {
            if (this.isAuthenticated) {
                const sessionData = localStorage.getItem('cybersentinel_session');
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    if (session.expires <= Date.now()) {
                        this.logout();
                        this.showMessage('Session expired. Please login again.', 'error');
                    }
                }
            }
        }, 60000);
    }
    
    // Public methods
    isAdmin() {
        return this.isAuthenticated && this.currentUser?.role === 'admin';
    }
    
    hasPermission(permission) {
        if (!this.isAuthenticated || !this.currentUser) return false;
        if (this.currentUser.permissions?.includes('all')) return true;
        return this.currentUser.permissions?.includes(permission);
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    window.cyberAuth = new CyberAuth();
});
