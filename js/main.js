// CyberSentinel Main Application
class CyberSentinel {
    constructor() {
        this.currentPage = 'home';
        this.staffData = [];
        this.merchData = [];
        this.activityData = [];
        this.init();
    }

    init() {
        console.log('CyberSentinel initialized');
        this.bindEvents();
        this.loadInitialData();
        this.updateSystemStatus();
        this.startLiveUpdates();
        this.initScrollSpy();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = e.target.getAttribute('href');
                
                // If it's a page link (not anchor), let it navigate normally
                if (href && !href.startsWith('#')) {
                    return; // Let the browser handle the navigation
                }
                
                // Handle anchor links
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    this.scrollToSection(targetId);
                }
                
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    this.toggleMobileMenu();
                }
            });
        });

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Learn more button
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.textContent.includes('LEARN MORE')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.scrollToSection('about');
                });
            }
        });

        // Discord join buttons
        document.querySelectorAll('.btn-secondary').forEach(btn => {
            if (btn.textContent.includes('DISCORD')) {
                btn.addEventListener('click', (e) => {
                    if (!btn.href || btn.href === '#') {
                        e.preventDefault();
                        this.showMessage('Discord server: discord.gg/X3gNqdNhyz', 'info');
                    }
                });
            }
        });

        // YouTube and TikTok buttons
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.textContent.includes('YOUTUBE') || btn.textContent.includes('Subscribe')) {
                btn.addEventListener('click', (e) => {
                    if (!btn.href || btn.href === '#') {
                        e.preventDefault();
                        this.showMessage('Opening YouTube channel: @ExposingWithJay', 'info');
                        setTimeout(() => {
                            window.open('https://youtube.com/@ExposingWithJay', '_blank');
                        }, 1000);
                    }
                });
            }
            
            if (btn.textContent.includes('TIKTOK') || btn.textContent.includes('Follow')) {
                btn.addEventListener('click', (e) => {
                    if (!btn.href || btn.href === '#') {
                        e.preventDefault();
                        this.showMessage('Opening TikTok profile: @exposingwithjay', 'info');
                        setTimeout(() => {
                            window.open('https://www.tiktok.com/@.exposingwithjay', '_blank');
                        }, 1000);
                    }
                });
            }
        });

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openLoginModal());
        }

        // Login modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            const closeBtn = document.getElementById('closeLoginModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeLoginModal());
            }
            
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    this.closeLoginModal();
                }
            });
        }

        // Admin login form
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
        }

        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navLinks = document.querySelector('.nav-links');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            
            if (navLinks && navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                this.toggleMobileMenu();
            }
        });
    }

    async loadInitialData() {
        try {
            // Check if we're running on a server or locally
            const isLocalFile = window.location.protocol === 'file:';
            
            if (isLocalFile) {
                console.log('Running locally - using demo data');
                this.loadDemoData();
                return;
            }

            // Try to load staff data
            try {
                const staffResponse = await fetch('data/staff.json');
                if (staffResponse.ok) {
                    this.staffData = await staffResponse.json();
                    this.renderStaffGrid();
                } else {
                    throw new Error('Staff data not found');
                }
            } catch (error) {
                console.log('Using demo staff data');
                this.loadDemoStaffData();
            }

            // Try to load merch data
            try {
                const merchResponse = await fetch('data/merch.json');
                if (merchResponse.ok) {
                    this.merchData = await merchResponse.json();
                    this.renderMerchGrid();
                } else {
                    throw new Error('Merch data not found');
                }
            } catch (error) {
                console.log('Using demo merch data');
                this.loadDemoMerchData();
            }

            // Load activity data
            this.activityData = await this.generateActivityData();
            this.renderActivityFeed();

            // Update counters
            this.updateCounters();

        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Using demo data for local development', 'info');
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.loadDemoStaffData();
        this.loadDemoMerchData();
        this.updateCounters();
    }

    loadDemoStaffData() {
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
                avatar: "jay"
            },
            {
                id: 2,
                name: "Linden",
                role: "co-owner",
                discord: "lindenfr",
                bio: "Social media manager and co-leader",
                status: "active",
                joinDate: "2023-02-20",
                avatar: "linden"
            }
        ];
        this.renderStaffGrid();
    }

    loadDemoMerchData() {
        // Demo merch data
        this.merchData = [
            {
                id: 1,
                name: "CyberSentinel Logo Tee",
                category: "apparel",
                price: 29.99,
                description: "Premium black t-shirt featuring the iconic CyberSentinel logo",
                status: "coming-soon"
            },
            {
                id: 2,
                name: "Guardian Hoodie",
                category: "apparel",
                price: 54.99,
                description: "Comfortable black hoodie with subtle cyber design",
                status: "coming-soon"
            },
            {
                id: 3,
                name: "Online Safety Guide",
                category: "digital",
                price: 14.99,
                description: "Comprehensive digital guide covering online safety tips",
                status: "available"
            }
        ];
        this.renderMerchGrid();
    }

    scrollToSection(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update active nav link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${targetId}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    openLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    async handleAdminLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const token = document.getElementById('adminToken').value.trim();

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AUTHENTICATING...';
        submitBtn.disabled = true;

        try {
            // Basic validation
            if (!username || !password) {
                throw new Error('Please enter both username and password');
            }

            // Simulate authentication delay
            await this.delay(1500);

            // Simple demo authentication (in production, this would be server-side)
            const validCredentials = {
                'admin_jay': 'CyberSentinel2026!',
                'admin_linden': 'SecurePass123!'
            };

            if (validCredentials[username] && validCredentials[username] === password) {
                // Create session
                const sessionData = {
                    user: {
                        username: username,
                        name: username === 'admin_jay' ? 'Jay (Owner)' : 'Linden (Co-Owner)',
                        role: username === 'admin_jay' ? 'owner' : 'co-owner'
                    },
                    timestamp: Date.now(),
                    token: this.generateSessionToken()
                };
                
                localStorage.setItem('cybersentinel_session', JSON.stringify(sessionData));
                
                this.showMessage('Authentication successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1500);
                
            } else {
                // Check if it's a staff member
                const staffCredentials = await this.checkStaffCredentials(username, password);
                if (staffCredentials) {
                    // Create staff session
                    const sessionData = {
                        user: {
                            username: username,
                            name: staffCredentials.name,
                            role: staffCredentials.role
                        },
                        timestamp: Date.now(),
                        token: this.generateSessionToken()
                    };
                    
                    localStorage.setItem('cybersentinel_session', JSON.stringify(sessionData));
                    
                    this.showMessage('Staff authentication successful! Redirecting...', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'staff-dashboard.html';
                    }, 1500);
                } else {
                    throw new Error('Invalid credentials');
                }
            }

        } catch (error) {
            this.showMessage(error.message, 'error');
            
            // Reset form
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Security delay
            await this.delay(2000);
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('adminPassword');
        const toggleIcon = document.getElementById('togglePassword');
        
        if (passwordInput && toggleIcon) {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
    }

    generateSessionToken() {
        return 'cs_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now().toString(36);
    }

    async checkStaffCredentials(username, password) {
        try {
            // Load staff data to check credentials
            const response = await fetch('data/staff.json');
            if (response.ok) {
                const staffData = await response.json();
                
                // Simple demo authentication for staff members
                // In production, this would be handled server-side with proper hashing
                const staffMember = staffData.find(staff => 
                    staff.discord === username || staff.name.toLowerCase() === username.toLowerCase()
                );
                
                if (staffMember && staffMember.status === 'active') {
                    // For demo purposes, accept any password for active staff
                    // In production, use proper password verification
                    return {
                        name: staffMember.name,
                        role: staffMember.role,
                        discord: staffMember.discord
                    };
                }
            }
        } catch (error) {
            console.error('Error checking staff credentials:', error);
        }
        
        return null;
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (navLinks) {
            navLinks.classList.toggle('active');
            
            // Update mobile menu button icon
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    if (navLinks.classList.contains('active')) {
                        icon.className = 'fas fa-times';
                    } else {
                        icon.className = 'fas fa-bars';
                    }
                }
            }
        }
    }

    renderStaffGrid() {
        const staffGrid = document.getElementById('staffGrid');
        if (!staffGrid) return;

        staffGrid.innerHTML = '';

        this.staffData.forEach(staff => {
            const roleClass = `role-${staff.role}`;
            const statusClass = `status-${staff.status}`;
            
            const staffCard = document.createElement('div');
            staffCard.className = 'staff-card cyber-border';
            staffCard.innerHTML = `
                <div class="staff-header">
                    <div class="staff-avatar">
                        <i class="fas fa-user-secret"></i>
                    </div>
                    <div class="staff-info">
                        <h3>${staff.name}</h3>
                        <span class="role-badge ${roleClass}">${this.formatRole(staff.role)}</span>
                        <span class="status-badge ${statusClass}">${staff.status}</span>
                    </div>
                </div>
                <div class="staff-body">
                    <p class="staff-bio">${staff.bio}</p>
                    <div class="staff-meta">
                        <div class="meta-item">
                            <i class="fab fa-discord"></i>
                            <span>${staff.discord}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Joined ${this.formatDate(staff.joinDate)}</span>
                        </div>
                    </div>
                </div>
                <div class="staff-actions">
                    <button class="btn-action" data-action="view" data-id="${staff.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-action" data-action="discord" data-discord="${staff.discord}">
                        <i class="fab fa-discord"></i> Message
                    </button>
                </div>
            `;

            staffGrid.appendChild(staffCard);
        });

        // Add event listeners to action buttons
        staffGrid.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const id = e.currentTarget.dataset.id;
                const discord = e.currentTarget.dataset.discord;
                
                this.handleStaffAction(action, id, discord);
            });
        });
    }

    filterStaff(filter) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // In a real app, this would filter the staff data
        // For now, just show a message
        if (filter !== 'all') {
            this.showMessage(`Filtered by: ${filter}`, 'info');
        }
    }

    renderMerchGrid() {
        const merchGrid = document.getElementById('merchGrid');
        if (!merchGrid) return;

        merchGrid.innerHTML = '';

        this.merchData.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'merch-card cyber-border';
            productCard.innerHTML = `
                <div class="product-image">
                    <i class="fas fa-tshirt"></i>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">$${product.price}</span>
                        <span class="product-status ${product.status}">${product.status.replace('-', ' ').toUpperCase()}</span>
                    </div>
                </div>
                <div class="product-actions">
                    ${product.status === 'available' ? 
                        `<button class="btn-buy" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> BUY NOW
                        </button>` :
                        `<button class="btn-coming-soon" disabled>
                            COMING SOON
                        </button>`
                    }
                </div>
            `;

            merchGrid.appendChild(productCard);
        });

        // Add event listeners to buy buttons
        merchGrid.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.handleBuyProduct(productId);
            });
        });
    }

    renderActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        activityFeed.innerHTML = '';

        this.activityData.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;

            activityFeed.appendChild(activityItem);
        });
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate form
        if (!this.validateContactForm(data)) {
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';
        submitBtn.disabled = true;

        try {
            // In production, this would send to a real API
            await this.sendContactMessage(data);
            
            this.showMessage('Message sent successfully! We\'ll respond within 24-48 hours.', 'success');
            form.reset();
            
            // Log the message
            this.logContactMessage(data);

        } catch (error) {
            this.showMessage('Error sending message. Please try again.', 'error');
            console.error('Contact form error:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateContactForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            this.showMessage('Please enter a valid name', 'error');
            return false;
        }

        if (!data.email || !this.validateEmail(data.email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return false;
        }

        if (!data.message || data.message.trim().length < 10) {
            this.showMessage('Please enter a message (minimum 10 characters)', 'error');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async sendContactMessage(data) {
        try {
            // Prepare data for PHP backend
            const requestData = {
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                urgent: data.urgent === '1' || data.urgent === 'on',
                anonymous: data.anonymous === '1' || data.anonymous === 'on'
            };

            const response = await fetch('contact-handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Network error');
            }
            
            // Show success message with auto-reply info
            let successMessage = result.message;
            if (result.auto_reply_sent && !requestData.anonymous) {
                successMessage += ' A confirmation email has been sent to your email address.';
            }
            
            this.showMessage(successMessage, 'success');
            
            return result;
        } catch (error) {
            // Fallback to localStorage if PHP backend is not available
            console.warn('PHP backend not available, using localStorage fallback:', error.message);
            
            // Store message locally as fallback
            const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            const messageEntry = {
                id: Date.now(),
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                urgent: data.urgent === '1' || data.urgent === 'on',
                anonymous: data.anonymous === '1' || data.anonymous === 'on',
                timestamp: new Date().toISOString(),
                read: false,
                status: 'pending'
            };
            
            messages.unshift(messageEntry);
            localStorage.setItem('contact_messages', JSON.stringify(messages));
            
            // Show fallback message
            this.showMessage('Message saved locally. Please ensure your server is configured for email delivery to support@exposingwithjay.store', 'info');
            
            // Simulate successful response
            return {
                success: true,
                message: 'Message stored locally. Email functionality requires server configuration.',
                id: messageEntry.id
            };
        }
    }

    logContactMessage(data) {
        const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        messages.unshift({
            ...data,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        localStorage.setItem('contact_messages', JSON.stringify(messages));
    }

    handleStaffAction(action, id, discord) {
        switch (action) {
            case 'view':
                const staff = this.staffData.find(s => s.id == id);
                this.showStaffModal(staff);
                break;
                
            case 'discord':
                this.showMessage(`Discord username: ${discord}. Click the Discord link in the footer to connect.`, 'info');
                break;
        }
    }

    handleBuyProduct(productId) {
        const product = this.merchData.find(p => p.id == productId);
        this.showMessage(`Redirecting to purchase ${product.name}...`, 'info');
        
        // In production, this would redirect to actual store
        setTimeout(() => {
            window.open('https://example-store.com/product/' + productId, '_blank');
        }, 1000);
    }

    showStaffModal(staff) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('staffModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'staffModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content cyber-border">
                    <div class="modal-header">
                        <h3>Staff Details</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body" id="staffModalBody"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add close event
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
        
        // Fill modal content
        const modalBody = document.getElementById('staffModalBody');
        modalBody.innerHTML = `
            <div class="staff-modal-content">
                <div class="staff-modal-header">
                    <div class="staff-modal-avatar">
                        <i class="fas fa-user-secret"></i>
                    </div>
                    <div class="staff-modal-info">
                        <h2>${staff.name}</h2>
                        <span class="role-badge role-${staff.role}">${this.formatRole(staff.role)}</span>
                    </div>
                </div>
                
                <div class="staff-modal-details">
                    <div class="detail-item">
                        <label><i class="fab fa-discord"></i> Discord</label>
                        <span>${staff.discord}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-calendar-alt"></i> Join Date</label>
                        <span>${this.formatDate(staff.joinDate)}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-info-circle"></i> Status</label>
                        <span class="status-badge status-${staff.status}">${staff.status}</span>
                    </div>
                </div>
                
                <div class="staff-modal-bio">
                    <h4>Bio</h4>
                    <p>${staff.bio}</p>
                </div>
            </div>
        `;
        
        // Show modal
        modal.classList.add('active');
    }

    updateCounters() {
        // Update staff count
        const staffCount = document.getElementById('teamMembers');
        if (staffCount) {
            staffCount.textContent = this.staffData.length;
        }

        // Update cases resolved (demo data)
        const casesResolved = document.getElementById('casesResolved');
        if (casesResolved) {
            casesResolved.textContent = Math.floor(Math.random() * 50) + 140;
        }

        // Update communities count (demo data)
        const communities = document.getElementById('communities');
        if (communities) {
            communities.textContent = Math.floor(Math.random() * 10) + 20;
        }
    }

    updateSystemStatus() {
        const statusElements = document.querySelectorAll('.system-status');
        statusElements.forEach(element => {
            const timestamp = new Date().toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const statusLine = element.querySelector('.timestamp');
            if (statusLine) {
                statusLine.textContent = `[${timestamp} UTC]`;
            }
        });
    }

    startLiveUpdates() {
        // Update time every second
        setInterval(() => this.updateSystemStatus(), 1000);
        
        // Update activity feed every 30 seconds
        setInterval(() => this.updateActivityFeed(), 30000);
        
        // Update counters every minute
        setInterval(() => this.updateCounters(), 60000);
    }

    async updateActivityFeed() {
        // Generate new activity
        const newActivity = await this.generateSingleActivity();
        this.activityData.unshift(newActivity);
        
        // Keep only last 10 activities
        if (this.activityData.length > 10) {
            this.activityData.pop();
        }
        
        this.renderActivityFeed();
    }

    async generateActivityData() {
        const activities = [
            {
                icon: 'fa-shield-alt',
                text: 'System security scan completed - All systems secure',
                time: '2 minutes ago'
            },
            {
                icon: 'fa-user-check',
                text: 'New staff member joined the team',
                time: '15 minutes ago'
            },
            {
                icon: 'fa-envelope',
                text: 'Contact form submission received',
                time: '1 hour ago'
            },
            {
                icon: 'fa-exclamation-triangle',
                text: 'Potential threat detected and neutralized',
                time: '3 hours ago'
            },
            {
                icon: 'fa-sync',
                text: 'System backup completed successfully',
                time: '5 hours ago'
            }
        ];
        
        return activities;
    }

    async generateSingleActivity() {
        const activities = [
            { icon: 'fa-youtube', text: 'New YouTube video published on ExposingWithJay channel' },
            { icon: 'fa-tiktok', text: 'Latest TikTok content shared on @exposingwithjay' },
            { icon: 'fa-discord', text: 'New Discord member joined the community' },
            { icon: 'fa-message', text: 'Team coordination meeting completed' },
            { icon: 'fa-search', text: 'Ongoing investigation updated' },
            { icon: 'fa-database', text: 'System maintenance completed' },
            { icon: 'fa-globe', text: 'Website traffic monitoring active' },
            { icon: 'fa-shield-alt', text: 'Security protocols updated and verified' },
            { icon: 'fa-users', text: 'Community engagement metrics updated' }
        ];
        
        const times = ['Just now', '5 minutes ago', '10 minutes ago', '20 minutes ago'];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const randomTime = times[Math.floor(Math.random() * times.length)];
        
        return {
            ...randomActivity,
            time: randomTime
        };
    }

    showMessage(message, type = 'info') {
        // Remove existing message
        const existingMessage = document.querySelector('.global-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `global-message message-${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="message-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(messageEl, container.firstChild);
        
        // Add close functionality
        messageEl.querySelector('.message-close').addEventListener('click', () => {
            messageEl.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
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
        
        return roleMap[role] || role;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initScrollSpy() {
        // Update active nav link based on scroll position
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-links a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }

    checkAuthStatus() {
        // Check if user is already logged in
        const session = localStorage.getItem('cybersentinel_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = Date.now();
                const sessionAge = now - sessionData.timestamp;
                
                if (sessionAge < 30 * 60 * 1000) { // 30 minutes
                    // Valid session - show user info
                    this.showUserInfo(sessionData.user);
                } else {
                    // Expired session
                    localStorage.removeItem('cybersentinel_session');
                }
            } catch (error) {
                localStorage.removeItem('cybersentinel_session');
            }
        }
    }

    showUserInfo(user) {
        const authSection = document.getElementById('authSection');
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (authSection && loginBtn && userInfo && userName) {
            authSection.style.display = 'flex';
            loginBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = user.name;

            // Add logout functionality
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('cybersentinel_session');
                    location.reload();
                });
            }
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.cyberSentinel = new CyberSentinel();
});