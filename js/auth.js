// CyberSentinel Authentication System
class CyberAuth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.googleUser = null;
        this.init();
    }
    
    init() {
        this.checkExistingSession();
        this.bindEvents();
        this.initGoogleSignIn();
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
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
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
        
        // Handle Google Sign-In callback
        window.handleGoogleSignIn = (response) => this.handleGoogleSignIn(response);
    }
    
    initGoogleSignIn() {
        if (!SecurityConfig.FEATURES.enableGoogleSignIn) return;
        
        // Google Sign-In initialization
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: SecurityConfig.GOOGLE_CONFIG.clientId,
                callback: this.handleGoogleSignIn.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });
            
            // Render button if element exists
            const googleBtn = document.querySelector('.g_id_signin');
            if (googleBtn) {
                google.accounts.id.renderButton(
                    googleBtn,
                    { theme: "filled_blue", size: "large", type: "standard" }
                );
            }
        }
    }
    
    async handleGoogleSignIn(response) {
        try {
            // Decode the JWT token
            const token = response.credential;
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Verify email is authorized
            const authorizedEmails = SecurityConfig.GOOGLE_CONFIG.authorizedEmails;
            if (!authorizedEmails.includes(payload.email)) {
                this.showMessage('This Google account is not authorized for admin access.', 'error');
                return;
            }
            
            // Create user session
            this.googleUser = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                token: token
            };
            
            // Create session
            const session = {
                user: {
                    name: payload.name,
                    email: payload.email,
                    role: 'admin',
                    source: 'google'
                },
                token: this.generateSessionToken(),
                expires: Date.now() + SecurityConfig.SECURITY.sessionTimeout
            };
            
            // Store session
            window.secureStorage.storeSession(session);
            
            // Update UI
            this.currentUser = session.user;
            this.sessionToken = session.token;
            this.isAuthenticated = true;
            
            this.showMessage('Google authentication successful!', 'success');
            this.hideLoginModal();
            this.updateAuthUI();
            
            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            console.error('Google Sign-In error:', error);
            this.showMessage('Google authentication failed. Please try again.', 'error');
        }
    }
    
    async handleAdminLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const token = document.getElementById('adminToken')?.value.trim() || '';
        
        // Check if locked out
        if (window.secureStorage.isLockedOut(username)) {
            this.showMessage('Account locked. Please try again later.', 'error');
            return;
        }
        
        // Validate credentials
        const isValid = this.validateAdminCredentials(username, password);
        
        if (isValid) {
            // Successful login
            window.secureStorage.logAttempt(username, true);
            
            // Create session
            const user = SecurityConfig.ADMIN_CREDENTIALS[username];
            const session = {
                user: {
                    name: user.name,
                    username: username,
                    role: user.role,
                    permissions: user.permissions,
                    source: 'admin'
                },
                token: this.generateSessionToken(),
                expires: Date.now() + SecurityConfig.SECURITY.sessionTimeout
            };
            
            // Store session
            window.secureStorage.storeSession(session);
            
            // Update state
            this.currentUser = session.user;
            this.sessionToken = session.token;
            this.isAuthenticated = true;
            
            this.showMessage('Admin authentication successful!', 'success');
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
            window.secureStorage.logAttempt(username, false);
            const failedAttempts = window.secureStorage.getFailedAttempts(username);
            const remaining = SecurityConfig.SECURITY.maxLoginAttempts - failedAttempts;
            
            if (remaining > 0) {
                this.showMessage(`Invalid credentials. ${remaining} attempts remaining.`, 'error');
            } else {
                this.showMessage('Account locked. Please try again in 15 minutes.', 'error');
            }
        }
    }
    
    validateAdminCredentials(username, password) {
        // Check if username exists
        if (!SecurityConfig.ADMIN_CREDENTIALS[username]) {
            return false;
        }
        
        // Check password (admin+ user: login password: 120520)
        const user = SecurityConfig.ADMIN_CREDENTIALS[username];
        return user.password === password;
    }
    
    checkExistingSession() {
        try {
            // Check for stored session
            const sessionData = localStorage.getItem('cybersentinel_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                // Validate session
                if (window.secureStorage.validateSession(session.token)) {
                    this.currentUser = session.user;
                    this.sessionToken = session.token;
                    this.isAuthenticated = true;
                    this.updateAuthUI();
                    
                    // If on login page, redirect to dashboard
                    if (window.location.pathname.includes('login.html')) {
                        window.location.href = 'dashboard.html';
                    }
                } else {
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
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
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
    
    logout() {
        // Clear session
        if (this.sessionToken) {
            window.secureStorage.removeSession(this.sessionToken);
        }
        
        // Clear local storage
