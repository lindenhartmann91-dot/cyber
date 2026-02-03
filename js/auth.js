// CyberSentinel Authentication System
class CyberAuth {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.bindEvents();
        this.startSessionTimer();
    }

    bindEvents() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Password visibility toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Session monitoring
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        window.addEventListener('beforeunload', () => this.saveSessionState());
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const twoFactor = document.getElementById('twoFactor')?.value.trim() || '';

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AUTHENTICATING...';
        submitBtn.disabled = true;

        try {
            // Validate credentials
            if (!this.validateCredentials(username, password)) {
                throw new Error('Invalid credentials format');
            }

            // Attempt login
            const user = await this.authenticate(username, password, twoFactor);
            
            // Store session
            this.createSession(user);
            
            // Show success message
            this.showMessage('Authentication successful! Redirecting...', 'success');
            
            // Redirect to admin panel
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);

        } catch (error) {
            this.showMessage(error.message, 'error');
            
            // Log failed attempt
            this.logLoginAttempt(username, false);
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Add security delay
            await this.delay(2000);
        }
    }

    validateCredentials(username, password) {
        // Admin ID format validation
        const adminIdRegex = /^admin_[a-zA-Z0-9]{4,12}$/;
        if (!adminIdRegex.test(username)) {
            throw new Error('Invalid admin ID format. Use: admin_xxxx');
        }

        // Password strength validation
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        return true;
    }

    async authenticate(username, password, twoFactor = '') {
        // Simulate API call delay
        await this.delay(1000);

        // In production, this would be a real API call
        // For demo purposes, using hardcoded admin credentials
        const validAdmins = {
            'admin_jay': {
                password: 'CyberSentinel2026!',
                twoFactor: twoFactor ? '123456' : null,
                user: {
                    id: 'admin_001',
                    username: 'admin_jay',
                    name: 'Jay (Owner)',
                    role: 'owner',
                    permissions: ['all'],
                    avatar: 'jay'
                }
            },
            'admin_linden': {
                password: 'SecurePass123!',
                twoFactor: twoFactor ? '654321' : null,
                user: {
                    id: 'admin_002',
                    username: 'admin_linden',
                    name: 'Linden (Co-Owner)',
                    role: 'co-owner',
                    permissions: ['manage_staff', 'view_contacts', 'view_logs'],
                    avatar: 'linden'
                }
            }
        };

        const admin = validAdmins[username];
        
        if (!admin) {
            throw new Error('Invalid admin credentials');
        }

        if (admin.password !== password) {
            throw new Error('Invalid password');
        }

        // Optional 2FA verification
        if (twoFactor && admin.twoFactor && admin.twoFactor !== twoFactor) {
            throw new Error('Invalid 2FA code');
        }

        // Log successful login
        this.logLoginAttempt(username, true);

        return admin.user;
    }

    createSession(user) {
        this.currentUser = user;
        
        // Store session in localStorage (in production, use secure HTTP-only cookies)
        const sessionData = {
            user: user,
            timestamp: Date.now(),
            token: this.generateSessionToken()
        };
        
        localStorage.setItem('cybersentinel_session', JSON.stringify(sessionData));
        
        // Start session timeout
        this.startSessionTimer();
    }

    checkExistingSession() {
        const sessionData = localStorage.getItem('cybersentinel_session');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const now = Date.now();
                const sessionAge = now - session.timestamp;
                
                if (sessionAge < this.sessionTimeout) {
                    this.currentUser = session.user;
                    
                    // If on login page, redirect to admin
                    if (window.location.pathname.includes('login.html')) {
                        window.location.href = 'admin-dashboard.html';
                    }
                    
                    // Update session timestamp
                    session.timestamp = now;
                    localStorage.setItem('cybersentinel_session', JSON.stringify(session));
                    
                } else {
                    // Session expired
                    this.logout();
                }
            } catch (error) {
                console.error('Session validation error:', error);
                this.logout();
            }
        }
    }

    logout() {
        // Log logout event
        if (this.currentUser) {
            this.logEvent('logout', `User ${this.currentUser.username} logged out`);
        }
        
        // Clear session data
        this.currentUser = null;
        localStorage.removeItem('cybersentinel_session');
        
        // Stop session timer
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        // Redirect to login page
        window.location.href = 'login.html';
    }

    startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            this.showMessage('Session expired due to inactivity', 'error');
            this.logout();
        }, this.sessionTimeout);
    }

    resetSessionTimer() {
        this.startSessionTimer();
    }

    handleVisibilityChange() {
        if (!document.hidden) {
            // User returned to tab, check session
            this.checkExistingSession();
        }
    }

    saveSessionState() {
        if (this.currentUser) {
            const sessionData = localStorage.getItem('cybersentinel_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                session.lastActivity = Date.now();
                localStorage.setItem('cybersentinel_session', JSON.stringify(session));
            }
        }
    }

    generateSessionToken() {
        return 'cs_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now().toString(36);
    }

    logLoginAttempt(username, success) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            username: username,
            success: success,
            ip: '127.0.0.1', // In production, get real IP
            userAgent: navigator.userAgent
        };
        
        // Save to localStorage (in production, send to server)
        const logs = JSON.parse(localStorage.getItem('login_logs') || '[]');
        logs.unshift(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.pop();
        }
        
        localStorage.setItem('login_logs', JSON.stringify(logs));
        
        // Log to console for debugging
        console.log(`Login attempt: ${username} - ${success ? 'SUCCESS' : 'FAILED'}`);
    }

    logEvent(type, description) {
        const event = {
            timestamp: new Date().toISOString(),
            type: type,
            description: description,
            user: this.currentUser?.username || 'system'
        };
        
        // Save to localStorage
        const events = JSON.parse(localStorage.getItem('admin_events') || '[]');
        events.unshift(event);
        
        if (events.length > 1000) {
            events.pop();
        }
        
        localStorage.setItem('admin_events', JSON.stringify(events));
    }

    showMessage(message, type = 'info') {
        // Could integrate with a toast/notification UI
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('.password-toggle i');
        if (passwordInput && toggleIcon) {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cyberAuth = new CyberAuth();
});