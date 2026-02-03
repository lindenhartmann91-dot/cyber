// CyberSentinel Security Configuration
// This file contains encrypted/hidden credentials
// DO NOT SHARE OR COMMIT TO PUBLIC REPOSITORIES

const SecurityConfig = {
    // Admin Credentials (encrypted)
    ADMIN_CREDENTIALS: {
        // Encrypted using simple obfuscation (not for production)
        // In production, use environment variables and server-side validation
        'admin_jay': {
            password: '120520', // admin+ user: login password: 120520
            name: 'Jay (Owner)',
            role: 'owner',
            permissions: ['all']
        },
        'admin_linden': {
            password: 'SecurePass2026!',
            name: 'Linden (Co-Owner)',
            role: 'co-owner',
            permissions: ['manage_staff', 'view_contacts']
        },
        'admin_angelina': {
            password: 'Angelina814!',
            name: 'Angelina (Manager)',
            role: 'manager',
            permissions: ['view_logs']
        }
    },
    
    // Google OAuth Configuration
    GOOGLE_CONFIG: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        // In production, this should be on server-side
        authorizedEmails: [
            'jay@exposingwithjay.com',
            'linden@exposingwithjay.com',
            'angelina@cybersentinel.com'
        ]
    },
    
    // Security Settings
    SECURITY: {
        maxLoginAttempts: 3,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        requireTwoFactor: false,
        ipWhitelist: [] // Empty means all IPs allowed
    },
    
    // API Endpoints
    API: {
        baseUrl: '/api/',
        endpoints: {
            login: 'auth/login',
            verify: 'auth/verify',
            logout: 'auth/logout',
            staff: 'staff',
            messages: 'messages'
        }
    },
    
    // Feature Flags
    FEATURES: {
        enableGoogleSignIn: true,
        enableAdminLogin: true,
        enableGuestView: false,
        maintenanceMode: false
    }
};

// Encrypt function (simple obfuscation for demo)
function encrypt(text) {
    return btoa(unescape(encodeURIComponent(text)));
}

function decrypt(encrypted) {
    return decodeURIComponent(escape(atob(encrypted)));
}

// Secure credential storage
class SecureStorage {
    constructor() {
        this.storageKey = 'cs_secure_data';
        this.initialized = false;
        this.init();
    }
    
    init() {
        // Initialize secure storage
        try {
            const existing = localStorage.getItem(this.storageKey);
            if (!existing) {
                localStorage.setItem(this.storageKey, JSON.stringify({
                    sessions: [],
                    attempts: [],
                    logs: []
                }));
            }
            this.initialized = true;
        } catch (error) {
            console.error('Secure storage initialization failed:', error);
        }
    }
    
    storeSession(session) {
        if (!this.initialized) return null;
        
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            const encryptedSession = {
                ...session,
                token: encrypt(session.token),
                timestamp: Date.now()
            };
            
            data.sessions.push(encryptedSession);
            
            // Keep only last 10 sessions
            if (data.sessions.length > 10) {
                data.sessions.shift();
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return encryptedSession.token;
        } catch (error) {
            console.error('Session storage failed:', error);
            return null;
        }
    }
    
    validateSession(token) {
        if (!this.initialized) return false;
        
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            const session = data.sessions.find(s => decrypt(s.token) === token);
            
            if (!session) return false;
            
            // Check if session expired
            const now = Date.now();
            const sessionAge = now - session.timestamp;
            
            if (sessionAge > SecurityConfig.SECURITY.sessionTimeout) {
                this.removeSession(token);
                return false;
            }
            
            // Update session timestamp
            session.timestamp = now;
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            
            return true;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }
    
    removeSession(token) {
        if (!this.initialized) return;
        
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            data.sessions = data.sessions.filter(s => decrypt(s.token) !== token);
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Session removal failed:', error);
        }
    }
    
    logAttempt(username, success, ip = 'unknown') {
        if (!this.initialized) return;
        
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            data.attempts.push({
                username,
                success,
                ip,
                timestamp: Date.now()
            });
            
            // Keep only last 50 attempts
            if (data.attempts.length > 50) {
                data.attempts.shift();
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Log attempt failed:', error);
        }
    }
    
    getFailedAttempts(username) {
        if (!this.initialized) return 0;
        
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            const now = Date.now();
            const lockoutDuration = SecurityConfig.SECURITY.lockoutDuration;
            
            return data.attempts.filter(a => 
                a.username === username && 
                !a.success && 
                (now - a.timestamp) < lockoutDuration
            ).length;
        } catch (error) {
            console.error('Get failed attempts failed:', error);
            return 0;
        }
    }
    
    isLockedOut(username) {
        const failedAttempts = this.getFailedAttempts(username);
        return failedAttempts >= SecurityConfig.SECURITY.maxLoginAttempts;
    }
    
    clearLogs() {
        if (!this.initialized) return;
        
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            data.attempts = [];
            data.logs = [];
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Clear logs failed:', error);
        }
    }
}

// Create secure storage instance
window.secureStorage = new SecureStorage();

// Export configuration
window.SecurityConfig = SecurityConfig;
