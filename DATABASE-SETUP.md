# 🔒 CyberSentinel Secure Database Setup

## 🛡️ Security-First Database Architecture

This guide helps you set up a secure, production-ready database for CyberSentinel that prioritizes privacy and security.

## 🚫 **What We DON'T Store Locally**

- ❌ Personal information
- ❌ Contact form submissions
- ❌ Staff personal details
- ❌ Passwords (even hashed)
- ❌ Investigation data
- ❌ User communications

## ✅ **What We DO Store Locally**

- ✅ User interface preferences (theme, animations)
- ✅ Non-sensitive configuration settings
- ✅ Session tokens (encrypted, temporary)
- ✅ Public system information

## 🏗️ **Recommended Database Architecture**

### **Option 1: PostgreSQL with Encryption**
```sql
-- Create encrypted database
CREATE DATABASE cybersentinel_secure 
WITH ENCODING 'UTF8' 
LC_COLLATE='en_US.UTF-8' 
LC_CTYPE='en_US.UTF-8';

-- Enable row-level security
ALTER DATABASE cybersentinel_secure SET row_security = on;

-- Create encrypted tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Use bcrypt with salt
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encrypted_data TEXT NOT NULL, -- All personal data encrypted
    message_type VARCHAR(20) NOT NULL,
    priority_level INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT NOW(),
    handled_by UUID REFERENCES users(id),
    handled_at TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable encryption at rest
ALTER TABLE users SET (encryption_key_id = 1);
ALTER TABLE contact_messages SET (encryption_key_id = 1);
```

### **Option 2: MongoDB with Field-Level Encryption**
```javascript
// MongoDB with Client-Side Field Level Encryption (CSFLE)
const clientEncryption = new ClientEncryption(keyVault, {
    keyVaultNamespace: 'encryption.__keyVault',
    kmsProviders: {
        local: {
            key: masterKey
        }
    }
});

// Encrypted schema
const encryptedSchema = {
    bsonType: 'object',
    properties: {
        name: {
            encrypt: {
                keyId: dataKey,
                bsonType: 'string',
                algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
            }
        },
        email: {
            encrypt: {
                keyId: dataKey,
                bsonType: 'string',
                algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
            }
        }
    }
};
```

## 🔐 **Security Implementation**

### **1. Environment Variables (.env)**
```bash
# Database Configuration
DB_HOST=your-secure-database-host.com
DB_PORT=5432
DB_NAME=cybersentinel_secure
DB_USER=cybersentinel_admin
DB_PASSWORD=your-super-secure-password
DB_SSL=true

# Encryption Keys
ENCRYPTION_KEY=your-256-bit-encryption-key
JWT_SECRET=your-jwt-secret-key
BCRYPT_ROUNDS=12

# API Configuration
API_BASE_URL=https://your-secure-api.com
CORS_ORIGIN=https://your-domain.com

# Security Headers
SECURITY_HEADERS=true
RATE_LIMITING=true
CSRF_PROTECTION=true
```

### **2. Server-Side API (Node.js Example)**
```javascript
// server/api/secure-routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

router.use(limiter);

// Encryption utilities
const encrypt = (text) => {
    const cipher = crypto.createCipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const decrypt = (encryptedText) => {
    const decipher = crypto.createDecipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Secure contact form submission
router.post('/api/contacts', async (req, res) => {
    try {
        const { encrypted } = req.body;
        const decryptedData = decrypt(encrypted);
        const contactData = JSON.parse(decryptedData);
        
        // Validate and sanitize data
        const sanitizedData = {
            name: sanitize(contactData.name),
            email: sanitize(contactData.email),
            subject: sanitize(contactData.subject),
            message: sanitize(contactData.message),
            urgent: Boolean(contactData.urgent),
            anonymous: Boolean(contactData.anonymous)
        };
        
        // Store encrypted in database
        const encryptedForStorage = encrypt(JSON.stringify(sanitizedData));
        
        await db.query(
            'INSERT INTO contact_messages (encrypted_data, message_type, priority_level) VALUES ($1, $2, $3)',
            [encryptedForStorage, sanitizedData.subject, sanitizedData.urgent ? 5 : 1]
        );
        
        // Log the action (no personal data in logs)
        await logAuditEvent(req.user?.id, 'contact_submitted', {
            type: sanitizedData.subject,
            urgent: sanitizedData.urgent
        });
        
        res.json({ success: true, message: 'Message received securely' });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Secure password change
router.put('/api/auth/password', authenticateToken, async (req, res) => {
    try {
        const { encrypted } = req.body;
        const decryptedData = decrypt(encrypted);
        const { currentPassword, newPassword } = JSON.parse(decryptedData);
        
        // Verify current password
        const user = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
        
        if (!isValidPassword) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.user.id]);
        
        // Log security event
        await logAuditEvent(req.user.id, 'password_changed', { timestamp: new Date() });
        
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
```

### **3. Database Backup & Security**
```bash
#!/bin/bash
# backup-script.sh

# Encrypted database backup
pg_dump --host=$DB_HOST --port=$DB_PORT --username=$DB_USER --dbname=$DB_NAME \
    --format=custom --compress=9 --verbose \
    --file="backup_$(date +%Y%m%d_%H%M%S).dump"

# Encrypt backup file
gpg --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
    --s2k-digest-algo SHA512 --s2k-count 65536 --symmetric \
    --output "backup_$(date +%Y%m%d_%H%M%S).dump.gpg" \
    "backup_$(date +%Y%m%d_%H%M%S).dump"

# Remove unencrypted backup
rm "backup_$(date +%Y%m%d_%H%M%S).dump"

# Upload to secure cloud storage
aws s3 cp "backup_$(date +%Y%m%d_%H%M%S).dump.gpg" \
    s3://your-secure-backup-bucket/ \
    --server-side-encryption AES256
```

## 🔧 **Frontend Integration**

### **Update js/config.js for Production**
```javascript
const CONFIG = {
    // Production API
    API_BASE_URL: 'https://your-secure-api.com',
    
    // Database settings
    DATABASE: {
        ENCRYPTION: true,
        NO_LOCAL_STORAGE: true,
        GDPR_COMPLIANCE: true
    },
    
    // Security
    SECURITY: {
        ENCRYPTION_ALGORITHM: 'AES-256-GCM',
        SESSION_ENCRYPTION: true,
        DATA_ANONYMIZATION: true
    }
};
```

## 🛡️ **Security Checklist**

### **Database Security**
- [ ] Enable SSL/TLS encryption in transit
- [ ] Configure encryption at rest
- [ ] Set up row-level security
- [ ] Implement field-level encryption for sensitive data
- [ ] Regular security audits
- [ ] Automated backups with encryption
- [ ] Access logging and monitoring

### **Application Security**
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Secure session management
- [ ] Password hashing with salt
- [ ] Two-factor authentication

### **Infrastructure Security**
- [ ] Firewall configuration
- [ ] VPN access for admin
- [ ] Regular security updates
- [ ] Intrusion detection system
- [ ] Log monitoring and alerting
- [ ] Disaster recovery plan

## 🚀 **Deployment Steps**

### **1. Set Up Secure Database Server**
```bash
# Install PostgreSQL with encryption
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configure SSL
sudo nano /etc/postgresql/13/main/postgresql.conf
# ssl = on
# ssl_cert_file = '/path/to/server.crt'
# ssl_key_file = '/path/to/server.key'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **2. Deploy API Server**
```bash
# Clone your secure API repository
git clone https://github.com/your-username/cybersentinel-api.git
cd cybersentinel-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
nano .env

# Start with PM2 for production
npm install -g pm2
pm2 start server.js --name "cybersentinel-api"
pm2 startup
pm2 save
```

### **3. Configure HTTPS**
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📞 **Support & Maintenance**

### **Monitoring**
- Set up database performance monitoring
- Configure alerting for security events
- Regular backup verification
- Automated security scanning

### **Updates**
- Keep database software updated
- Regular security patches
- Monitor for vulnerabilities
- Update encryption standards as needed

---

**🔒 Remember: Security is an ongoing process, not a one-time setup. Regularly review and update your security measures.**