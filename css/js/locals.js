// CyberSentinel Locals Page
class LocalCommunities {
    constructor() {
        this.communities = [];
        this.init();
    }

    init() {
        console.log('Local Communities initialized');
        this.bindEvents();
        this.loadCommunities();
        this.updateTime();
        this.startLiveUpdates();
    }

    bindEvents() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchCommunities());
        }

        const locationSearch = document.getElementById('locationSearch');
        if (locationSearch) {
            locationSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchCommunities();
                }
            });
        }

        // Join community form
        const joinForm = document.getElementById('joinCommunityForm');
        if (joinForm) {
            joinForm.addEventListener('submit', (e) => this.handleJoinSubmit(e));
        }

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
    }

    loadCommunities() {
        // Demo communities data
        this.communities = [
            {
                id: 1,
                name: "Los Angeles Parent Network",
                location: "Los Angeles, CA",
                type: "parent-group",
                members: 156,
                description: "Active parent community focused on online safety education and advocacy in the LA area.",
                contact: "la-parents@cybersentinel.org",
                meetingType: "hybrid",
                established: "2023-03-15",
                verified: true
            },
            {
                id: 2,
                name: "NYC School Safety Coalition",
                location: "New York, NY",
                type: "school-district",
                members: 89,
                description: "Coalition of educators and parents working with NYC schools to implement comprehensive digital safety programs.",
                contact: "nyc-schools@cybersentinel.org",
                meetingType: "in-person",
                established: "2023-06-20",
                verified: true
            },
            {
                id: 3,
                name: "Chicago Neighborhood Watch",
                location: "Chicago, IL",
                type: "neighborhood",
                members: 234,
                description: "Community-driven initiative protecting children from online predators in Chicago neighborhoods.",
                contact: "chicago-watch@cybersentinel.org",
                meetingType: "online",
                established: "2023-01-10",
                verified: true
            },
            {
                id: 4,
                name: "Texas Advocacy Alliance",
                location: "Austin, TX",
                type: "advocacy",
                members: 78,
                description: "Statewide advocacy group working on legislation and policy changes to protect children online.",
                contact: "texas-advocacy@cybersentinel.org",
                meetingType: "hybrid",
                established: "2023-08-05",
                verified: true
            },
            {
                id: 5,
                name: "Florida Coastal Communities",
                location: "Miami, FL",
                type: "parent-group",
                members: 112,
                description: "Coastal Florida communities united in protecting children through education and awareness programs.",
                contact: "florida-coastal@cybersentinel.org",
                meetingType: "in-person",
                established: "2023-04-12",
                verified: false
            }
        ];

        this.renderCommunities();
    }

    renderCommunities(communities = this.communities) {
        const grid = document.getElementById('communitiesGrid');
        if (!grid) return;

        grid.innerHTML = '';

        communities.forEach(community => {
            const communityCard = document.createElement('div');
            communityCard.className = 'local-card';
            communityCard.innerHTML = `
                <div class="local-card-header">
                    <div class="local-icon">
                        <i class="fas fa-${this.getTypeIcon(community.type)}"></i>
                    </div>
                    <div class="local-info">
                        <h3>${community.name}</h3>
                        <p><i class="fas fa-map-marker-alt"></i> ${community.location}</p>
                    </div>
                    ${community.verified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                </div>
                
                <div class="local-description">
                    ${community.description}
                </div>
                
                <div class="community-stats">
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>${community.members} members</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-${this.getMeetingIcon(community.meetingType)}"></i>
                        <span>${this.formatMeetingType(community.meetingType)}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Est. ${this.formatDate(community.established)}</span>
                    </div>
                </div>
                
                <div class="local-actions">
                    <button class="local-btn primary" onclick="localCommunities.joinCommunity(${community.id})">
                        <i class="fas fa-plus"></i> Join Community
                    </button>
                    <button class="local-btn" onclick="localCommunities.viewCommunity(${community.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            `;

            grid.appendChild(communityCard);
        });
    }

    searchCommunities() {
        const searchInput = document.getElementById('locationSearch');
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            this.renderCommunities();
            return;
        }

        const filteredCommunities = this.communities.filter(community => 
            community.location.toLowerCase().includes(query) ||
            community.name.toLowerCase().includes(query) ||
            community.description.toLowerCase().includes(query)
        );

        this.renderCommunities(filteredCommunities);
        
        this.showMessage(
            filteredCommunities.length > 0 
                ? `Found ${filteredCommunities.length} communities matching "${query}"`
                : `No communities found matching "${query}". Consider starting one!`,
            filteredCommunities.length > 0 ? 'success' : 'info'
        );
    }

    async handleJoinSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Validate form
        if (!this.validateJoinForm(data)) {
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CREATING...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.delay(2000);
            
            // Store community request
            this.storeCommunityRequest(data);
            
            this.showMessage('Community request submitted! We\'ll contact you within 24-48 hours to help you get started.', 'success');
            e.target.reset();
            
        } catch (error) {
            this.showMessage('Error submitting request. Please try again.', 'error');
            console.error('Community join error:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateJoinForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            this.showMessage('Please enter a valid name', 'error');
            return false;
        }

        if (!data.email || !this.validateEmail(data.email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return false;
        }

        if (!data.location || data.location.trim().length < 3) {
            this.showMessage('Please enter a valid location', 'error');
            return false;
        }

        if (!data.type) {
            this.showMessage('Please select a community type', 'error');
            return false;
        }

        if (!data.agree) {
            this.showMessage('Please agree to the community guidelines', 'error');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    storeCommunityRequest(data) {
        const requests = JSON.parse(localStorage.getItem('community_requests') || '[]');
        const request = {
            ...data,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        requests.unshift(request);
        localStorage.setItem('community_requests', JSON.stringify(requests));
    }

    joinCommunity(id) {
        const community = this.communities.find(c => c.id === id);
        if (!community) return;

        this.showMessage(`Joining ${community.name}... You'll receive an invitation email shortly.`, 'success');
        
        // Store join request
        const joins = JSON.parse(localStorage.getItem('community_joins') || '[]');
        joins.unshift({
            communityId: id,
            communityName: community.name,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('community_joins', JSON.stringify(joins));
    }

    viewCommunity(id) {
        const community = this.communities.find(c => c.id === id);
        if (!community) return;

        // Create modal for community details
        this.showCommunityModal(community);
    }

    showCommunityModal(community) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('communityModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'communityModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content cyber-border">
                    <div class="modal-header">
                        <h3>Community Details</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body" id="communityModalBody"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add close functionality
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
        
        // Fill modal content
        const modalBody = document.getElementById('communityModalBody');
        modalBody.innerHTML = `
            <div class="community-modal-content">
                <div class="community-modal-header">
                    <div class="community-modal-icon">
                        <i class="fas fa-${this.getTypeIcon(community.type)}"></i>
                    </div>
                    <div class="community-modal-info">
                        <h2>${community.name}</h2>
                        <p><i class="fas fa-map-marker-alt"></i> ${community.location}</p>
                        ${community.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified Community</span>' : ''}
                    </div>
                </div>
                
                <div class="community-modal-details">
                    <div class="detail-section">
                        <h4>About This Community</h4>
                        <p>${community.description}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Community Stats</h4>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <i class="fas fa-users"></i>
                                <span class="stat-number">${community.members}</span>
                                <span class="stat-label">Members</span>
                            </div>
                            <div class="stat-card">
                                <i class="fas fa-${this.getMeetingIcon(community.meetingType)}"></i>
                                <span class="stat-number">${this.formatMeetingType(community.meetingType)}</span>
                                <span class="stat-label">Meetings</span>
                            </div>
                            <div class="stat-card">
                                <i class="fas fa-calendar-alt"></i>
                                <span class="stat-number">${this.formatDate(community.established)}</span>
                                <span class="stat-label">Established</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Contact Information</h4>
                        <p><i class="fas fa-envelope"></i> ${community.contact}</p>
                    </div>
                </div>
                
                <div class="community-modal-actions">
                    <button class="btn btn-primary" onclick="localCommunities.joinCommunity(${community.id}); document.getElementById('communityModal').classList.remove('active');">
                        <i class="fas fa-plus"></i> Join This Community
                    </button>
                    <button class="btn btn-secondary" onclick="window.open('mailto:${community.contact}', '_blank')">
                        <i class="fas fa-envelope"></i> Contact Organizers
                    </button>
                </div>
            </div>
        `;
        
        // Show modal
        modal.classList.add('active');
    }

    getTypeIcon(type) {
        const icons = {
            'parent-group': 'users',
            'school-district': 'school',
            'neighborhood': 'home',
            'advocacy': 'bullhorn',
            'other': 'circle'
        };
        return icons[type] || 'circle';
    }

    getMeetingIcon(type) {
        const icons = {
            'online': 'video',
            'in-person': 'handshake',
            'hybrid': 'globe'
        };
        return icons[type] || 'circle';
    }

    formatMeetingType(type) {
        const types = {
            'online': 'Online',
            'in-person': 'In-Person',
            'hybrid': 'Hybrid'
        };
        return types[type] || type;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    }

    updateTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = `[${timeString} UTC]`;
        }
    }

    startLiveUpdates() {
        setInterval(() => this.updateTime(), 1000);
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (navLinks) {
            navLinks.classList.toggle('active');
            
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.localCommunities = new LocalCommunities();
});