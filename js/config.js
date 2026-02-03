// CyberSentinel Configuration
const CONFIG = {
    // API Configuration
    API_BASE_URL: window.location.origin,
    API_TIMEOUT: 10000,
    
    // Authentication
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 3,
    
    // Google OAuth (replace with actual client ID)
    GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    
    // Application Settings
    APP_NAME: "CyberSentinel",
    APP_VERSION: "2.6.0",
    
    // Feature Flags
    FEATURES: {
        GOOGLE_AUTH: false, // Set to true when Google OAuth is configured
        TWO_FACTOR: true,
        CHAT_LOGS: true,
        MERCH_STORE: false // Coming soon
    },
    
    // UI Settings
    THEME: "dark",
    ANIMATIONS: true,
    AUTO_REFRESH: true,
    REFRESH_INTERVAL: 30000, // 30 seconds
    
    // Database Configuration (Production)
    DATABASE: {
        HOST: 'your-secure-database-host.com',
        PORT: 5432,
        NAME: 'cybersentinel_secure',
        SSL: true,
        ENCRYPTION: 'AES-256',
        BACKUP_FREQUENCY: '24h',
        RETENTION_POLICY: '90d'
    },
    
    // Security Configuration
    SECURITY: {
        ENCRYPTION_ALGORITHM: 'AES-256-GCM',
        HASH_ALGORITHM: 'SHA-256',
        SESSION_ENCRYPTION: true,
        DATA_ANONYMIZATION: true,
        GDPR_COMPLIANCE: true,
        NO_LOCAL_STORAGE: true // No personal data stored locally
    },
    
    // Contact Form Settings
    CONTACT_SUBJECTS: [
        { value: "tip", label: "Predator Tip" },
        { value: "general", label: "General Inquiry" },
        { value: "support", label: "Support Request" },
        { value: "collaboration", label: "Collaboration" },
        { value: "other", label: "Other" }
    ],
    
    // Staff Roles
    STAFF_ROLES: [
        { value: "owner", label: "Owner", level: 10 },
        { value: "co-owner", label: "Co-Owner", level: 9 },
        { value: "manager", label: "Manager", level: 8 },
        { value: "admin", label: "Admin", level: 7 },
        { value: "moderator", label: "Moderator", level: 6 },
        { value: "security", label: "Security", level: 5 },
        { value: "family", label: "Family", level: 4 }
    ],
    
    // Permissions
    PERMISSIONS: [
        { value: "all", label: "All Permissions" },
        { value: "manage_staff", label: "Manage Staff" },
        { value: "view_contacts", label: "View Contact Messages" },
        { value: "view_logs", label: "View Chat Logs" },
        { value: "post_alerts", label: "Post System Alerts" },
        { value: "backup_data", label: "Backup System Data" },
        { value: "system_settings", label: "Modify System Settings" }
    ],
    
    // Social Links
    SOCIAL_LINKS: {
        discord: "https://discord.gg/X3gNgdNhyz",
        youtube: "https://youtube.com/@ExposingWithJay",
        tiktok: "https://www.tiktok.com/@.exposingwithjay"
    },
    
    // Development Settings
    DEBUG: false,
    LOG_LEVEL: "info" // debug, info, warn, error
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;