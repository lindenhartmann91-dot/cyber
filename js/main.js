// CyberSentinel Main Application
class CyberSentinelApp {
    constructor() {
        this.currentTime = new Date();
        this.init();
    }
    
    init() {
        this.updateCurrentTime();
        this.updateCounters();
        this.bindEvents();
        this.startLiveUpdates();
    }
    
    bindEvents() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
        
        // Update counters every 30 seconds
        setInterval(() => this.updateCounters(), 30000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElements = document.querySelectorAll('#currentTime, #dashboardTime');
        timeElements.forEach(element => {
            if (element) {
                element.textContent = `[${timeString} UTC]`;
            }
        });
    }
    
    updateCounters() {
        // These would normally come from an API
        const casesResolved = document.getElementById('casesResolved');
        const teamMembers = document.getElementById('teamMembers');
        const communities = document.getElementById('communities');
        
        if (casesResolved) {
            // Simulate increasing cases
            const current = parseInt(casesResolved.textContent) || 147;
            casesResolved.textContent = current + Math.floor(Math.random() * 3);
        }
        
        if (teamMembers) {
            // Simulate team growth
            const current = parseInt(teamMembers.textContent) || 42;
            teamMembers.textContent = current + Math.floor(Math.random() * 2);
        }
        
        if (communities) {
            // Simulate community growth
            const current = parseInt(communities.textContent) || 28;
            communities.textContent = current + Math.floor(Math.random());
        }
    }
    
    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        }
    }
    
    startLiveUpdates() {
        // System status animation
        const badges = document.querySelectorAll('.badge');
        badges.forEach(badge => {
            setInterval(() => {
                badge.style.opacity = badge.style.opacity === '0.7' ? '1' : '0.7';
            }, 2000);
        });
        
        // Status indicator pulse
        const indicators = document.querySelectorAll('.status-indicator.online');
        indicators.forEach(indicator => {
            setInterval(() => {
                indicator.style.boxShadow = indicator.style.boxShadow === 'var(--glow-green)' ? 
                    '0 0 20px var(--accent-green)' : 'var(--glow-green)';
            }, 1000);
        });
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.cyberApp = new CyberSentinelApp();
});
