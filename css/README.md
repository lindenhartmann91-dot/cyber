# CyberSentinel Website

A cybersecurity-themed website for protecting children online. Built with HTML, CSS, and JavaScript.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher) - Download from [nodejs.org](https://nodejs.org/)

### Running the Development Server

#### Option 1: Using the Batch File (Windows)
1. Double-click `start-server.bat`
2. The server will start automatically
3. Open your browser to `http://localhost:3000`

#### Option 2: Using the Shell Script (Linux/Mac)
1. Make the script executable: `chmod +x start-server.sh`
2. Run: `./start-server.sh`
3. Open your browser to `http://localhost:3000`

#### Option 3: Manual Start
1. Open terminal/command prompt in the project directory
2. Run: `node server.js`
3. Open your browser to `http://localhost:3000`

#### Option 4: Using npm (if you have live-server installed)
1. Install live-server globally: `npm install -g live-server`
2. Run: `npm start`

## 📁 Project Structure

```
cybersentinel-website/
├── index.html              # Main homepage
├── login.html              # Admin login page
├── admin-dashboard.html     # Admin panel
├── css/
│   ├── style.css           # Main styles
│   ├── auth.css            # Authentication styles
│   ├── admin.css           # Admin panel styles
│   └── responsive.css      # Color themes and responsive design
├── js/
│   ├── config.js           # Configuration settings
│   ├── main.js             # Main application logic
│   ├── auth.js             # Authentication system
│   └── admin.js            # Admin panel functionality
├── data/
│   └── staff.json          # Staff member data
├── server.js               # Development server
├── package.json            # Project configuration
└── README.md               # This file
```

## 🔐 Admin Access

### Demo Credentials
- **Username:** `admin_jay` | **Password:** `CyberSentinel2026!`
- **Username:** `admin_linden` | **Password:** `SecurePass123!`

### Accessing Admin Panel
1. Click the "ADMIN LOGIN" button in the header
2. Enter credentials in the modal
3. Or go directly to `/login.html`

## ✨ Features

### Public Features
- **Responsive Design** - Works on all devices
- **Cyber Theme** - Futuristic cybersecurity aesthetic
- **Contact Form** - Secure message submission
- **Staff Directory** - Team member information
- **Mission Statement** - Organization goals and methods

### Admin Features
- **Dashboard** - Overview of system status
- **Staff Management** - Add, edit, delete team members
- **Contact Messages** - View and respond to submissions
- **Activity Logs** - System event tracking
- **Secure Authentication** - Protected admin access

## 🛠️ Development

### File Watching
The development server automatically serves files with no-cache headers for development.

### Debugging
- Use browser developer tools
- Check console for JavaScript errors
- Server logs appear in terminal

### Making Changes
1. Edit HTML, CSS, or JavaScript files
2. Refresh browser to see changes
3. No build process required

## 🎨 Customization

### Colors and Themes
Edit `css/responsive.css` to modify color schemes:
- Dark theme (default)
- Light theme
- Blue theme
- Purple theme
- Red theme
- Green theme

### Configuration
Edit `js/config.js` to modify:
- API endpoints
- Feature flags
- Social media links
- Authentication settings

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🔒 Security Notes

### For Development
- Uses localStorage for demo authentication
- No real server-side validation
- CORS disabled for local development

### For Production
- Implement proper server-side authentication
- Use HTTPS
- Validate all inputs server-side
- Use secure session management
- Enable CORS restrictions

## 🐛 Troubleshooting

### Server Won't Start
1. Check if Node.js is installed: `node --version`
2. Make sure you're in the project directory
3. Check if port 3000 is available
4. Try a different port: `node server.js` (edit server.js to change port)

### Page Not Loading
1. Verify server is running
2. Check browser console for errors
3. Try hard refresh (Ctrl+F5)
4. Clear browser cache

### Admin Login Issues
1. Use exact credentials (case-sensitive)
2. Check browser console for errors
3. Clear localStorage: `localStorage.clear()`

### Styling Issues
1. Check if CSS files are loading
2. Verify file paths are correct
3. Check browser developer tools

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify all files are in correct locations
3. Ensure Node.js is properly installed
4. Try restarting the server

## 📄 License

This project is for educational and demonstration purposes.

---

**CyberSentinel v2.6.0** - Protecting children online through technology and community.