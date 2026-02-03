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
        this.bindEvents();
        this.loadInitialData();
        this.initPageTransitions();
        this.updateSystemStatus();
        this.startLiveUpdates();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            });
        });

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Learn more button
        const learnMoreBtn = document.querySelector('.learn-more-btn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('about');
            });
        }

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

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Staff filtering
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filterStaff(btn.dataset.filter));
        });
    }

    async loadInitialData() {
        try {
            // Load staff data
            const staffResponse = await fetch('data/staff.json');
            this.staffData = await staffResponse.json();
            this.renderStaffGrid();

            // Load merch data
            const merchResponse = await fetch('data/merch.json');
            this.merchData = await merchResponse.json();
            this.renderMerchGrid();

            // Load activity data
            this.activityData = await this.generateActivityData();
            this.renderActivityFeed();

            // Update counters
            this.updateCounters();

        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading data. Using demo data.', 'error');
            this.loadDemoData();
        }
    }

    loadDemoData() {
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
            }
        ];

        this.renderStaffGrid();
        this.renderMerchGrid();
        this.updateCounters();
    }

    navigateTo(page) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // Update pages
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });

        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Update URL hash
            window.history.pushState({}, '', `#${page}`);
        }
    }

    initPageTransitions() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.substring(1) || 'home';
            this.navigateTo(hash);
        });

        // Initial page from hash
        const initialPage = window.location.hash.substring(1) || 'home';
        this.navigateTo(initialPage);
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
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
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In production, this would be a real API call
                // For demo, simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
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
            { icon: 'fa-user-plus', text: 'New Discord member joined the community' },
            { icon: 'fa-message', text: 'Team coordination meeting completed' },
            { icon: 'fa-search', text: 'Ongoing investigation updated' },
            { icon: 'fa-database', text: 'System maintenance completed' },
            { icon: 'fa-globe', text: 'Website traffic monitoring active' }
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
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.cyberSentinel = new CyberSentinel();
});