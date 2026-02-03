# Cloudflare Email & 2FA Setup Guide

This guide will help you set up Cloudflare email routing and implement 2FA for your CyberSentinel admin dashboard.

## 📧 Cloudflare Email Routing Setup

### Step 1: Enable Email Routing in Cloudflare

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select your domain (exposingwithjay.store)

2. **Navigate to Email Routing**
   - Click on "Email" in the left sidebar
   - Click "Get started" if not already enabled

3. **Configure Email Routing**
   - Add destination email addresses where you want to receive emails
   - Create routing rules for different email addresses

### Step 2: Configure Email Addresses

```bash
# Example email routing configuration:
support@exposingwithjay.store → your-personal-email@gmail.com
admin@exposingwithjay.store → your-admin-email@gmail.com
noreply@exposingwithjay.store → your-personal-email@gmail.com
```

### Step 3: Update DNS Records

Cloudflare will automatically add the required MX and TXT records:
- MX records for email routing
- SPF record for email authentication
- DKIM records for email signing

### Step 4: Test Email Routing

```bash
# Test command (replace with your actual email)
echo "Test message" | mail -s "Test Subject" support@exposingwithjay.store
```

## 🔐 2FA Implementation

### Option 1: Using Authy/Google Authenticator

1. **Install Required PHP Libraries**
```bash
composer require pragmarx/google2fa
```

2. **Update contact-handler.php for 2FA**
```php
<?php
require_once 'vendor/autoload.php';
use PragmaRX\Google2FA\Google2FA;

// Add 2FA verification
function verify2FA($secret, $code) {
    $google2fa = new Google2FA();
    return $google2fa->verifyKey($secret, $code);
}
?>
```

### Option 2: Using Email-based 2FA

1. **Create 2FA Email Template**
```php
// In contact-handler.php
function send2FACode($email, $code) {
    $subject = '[CyberSentinel] Two-Factor Authentication Code';
    $message = "Your 2FA code is: $code\n\nThis code expires in 5 minutes.";
    $headers = [
        'From: CyberSentinel Security <noreply@exposingwithjay.store>',
        'Reply-To: support@exposingwithjay.store'
    ];
    
    return mail($email, $subject, $message, implode("\r\n", $headers));
}
```

### Option 3: Using SMS 2FA (Twilio)

1. **Install Twilio SDK**
```bash
composer require twilio/sdk
```

2. **Configure SMS 2FA**
```php
<?php
require_once 'vendor/autoload.php';
use Twilio\Rest\Client;

function sendSMS2FA($phone, $code) {
    $sid = 'your_twilio_sid';
    $token = 'your_twilio_token';
    $client = new Client($sid, $token);
    
    $message = $client->messages->create(
        $phone,
        [
            'from' => '+1234567890', // Your Twilio number
            'body' => "CyberSentinel 2FA Code: $code"
        ]
    );
    
    return $message->sid;
}
?>
```

## 🗄️ Secure Database Setup

### Option 1: MySQL with SSL

1. **Create Database**
```sql
CREATE DATABASE cybersentinel_db;
CREATE USER 'cs_admin'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON cybersentinel_db.* TO 'cs_admin'@'localhost';
FLUSH PRIVILEGES;
```

2. **Create Tables**
```sql
-- Contact messages table
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject ENUM('tip', 'general', 'support') NOT NULL,
    message TEXT NOT NULL,
    urgent BOOLEAN DEFAULT FALSE,
    anonymous BOOLEAN DEFAULT FALSE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    INDEX idx_timestamp (timestamp),
    INDEX idx_read_status (read_status)
);

-- Staff members table
CREATE TABLE staff_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    discord VARCHAR(255) UNIQUE,
    role ENUM('owner', 'co-owner', 'manager', 'admin', 'moderator', 'security', 'family') NOT NULL,
    bio TEXT,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    join_date DATE NOT NULL,
    permissions JSON,
    last_active DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin sessions table
CREATE TABLE admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (session_token),
    INDEX idx_expires (expires_at)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'failure', 'warning') DEFAULT 'success',
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type)
);
```

3. **Database Configuration File**
```php
<?php
// config/database.php
class Database {
    private $host = 'localhost';
    private $db_name = 'cybersentinel_db';
    private $username = 'cs_admin';
    private $password = 'secure_password_here';
    private $conn;
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_SSL_CA => '/path/to/ca-cert.pem',
                    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true
                ]
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
        }
        
        return $this->conn;
    }
}
?>
```

### Option 2: PostgreSQL with SSL

1. **Create Database**
```sql
CREATE DATABASE cybersentinel_db;
CREATE USER cs_admin WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE cybersentinel_db TO cs_admin;
```

2. **Enable SSL in postgresql.conf**
```conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'ca.crt'
```

### Option 3: Cloud Database (Recommended)

#### Using PlanetScale (MySQL-compatible)
1. Create account at [planetscale.com](https://planetscale.com)
2. Create database: `cybersentinel-prod`
3. Get connection string with SSL enabled
4. Use connection string in your PHP configuration

#### Using Supabase (PostgreSQL)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Use provided connection details with SSL

## 🔒 SSL Certificate Setup

### Using Cloudflare SSL

1. **Enable Full SSL in Cloudflare**
   - Go to SSL/TLS → Overview
   - Set encryption mode to "Full (strict)"

2. **Generate Origin Certificate**
   - Go to SSL/TLS → Origin Server
   - Create certificate for your domain
   - Install on your server

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Generate certificate
sudo certbot --apache -d exposingwithjay.store -d www.exposingwithjay.store

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 Production Deployment Checklist

### Server Security
- [ ] Enable firewall (UFW/iptables)
- [ ] Disable root SSH login
- [ ] Use SSH keys instead of passwords
- [ ] Keep server updated
- [ ] Configure fail2ban

### PHP Security
- [ ] Disable dangerous functions
- [ ] Set proper file permissions
- [ ] Enable OPcache
- [ ] Configure error logging
- [ ] Use HTTPS only

### Database Security
- [ ] Use strong passwords
- [ ] Enable SSL connections
- [ ] Regular backups
- [ ] Limit database user permissions
- [ ] Monitor for suspicious activity

### Application Security
- [ ] Input validation and sanitization
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Session security
- [ ] Regular security audits

## 📝 Environment Variables

Create a `.env` file:
```env
# Database
DB_HOST=localhost
DB_NAME=cybersentinel_db
DB_USER=cs_admin
DB_PASS=secure_password_here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 2FA
GOOGLE_2FA_SECRET=your-2fa-secret
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
```

## 🧪 Testing

### Test Email Functionality
```bash
# Test contact form
curl -X POST https://exposingwithjay.store/contact-handler.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","subject":"tip","message":"Test message"}'
```

### Test 2FA
```bash
# Test 2FA endpoint
curl -X POST https://exposingwithjay.store/verify-2fa.php \
  -H "Content-Type: application/json" \
  -d '{"code":"123456","token":"user-session-token"}'
```

### Test Database Connection
```php
<?php
// test-db.php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "Database connection successful!";
} else {
    echo "Database connection failed!";
}
?>
```

## 📞 Support

If you need help with setup:
1. Check server error logs: `/var/log/apache2/error.log`
2. Check PHP error logs: `/var/log/php_errors.log`
3. Test email delivery with mail() function
4. Verify DNS records are propagated
5. Check SSL certificate validity

## 🔄 Maintenance

### Regular Tasks
- [ ] Update server packages monthly
- [ ] Backup database weekly
- [ ] Review activity logs weekly
- [ ] Update SSL certificates (auto-renewal)
- [ ] Monitor email delivery rates
- [ ] Test 2FA functionality monthly

### Monitoring
- Set up uptime monitoring
- Monitor email delivery
- Track failed login attempts
- Monitor database performance
- Set up alerts for critical errors