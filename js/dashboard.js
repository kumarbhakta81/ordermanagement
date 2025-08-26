// Dashboard Management
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.initializeRealTimeUpdates();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link:not(.logout-btn)')) {
                this.handleNavigation(e.target);
            }
        });

        // Table sorting
        document.addEventListener('click', (e) => {
            if (e.target.matches('th[data-sortable]')) {
                this.sortTable(e.target);
            }
        });

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn[title="Approve"], .btn[title="Approve"] *')) {
                e.preventDefault();
                this.approveProduct(e.target.closest('tr'));
            }
            
            if (e.target.matches('.btn[title="Reject"], .btn[title="Reject"] *')) {
                e.preventDefault();
                this.rejectProduct(e.target.closest('tr'));
            }
            
            if (e.target.matches('.btn[title="View Details"], .btn[title="View Details"] *')) {
                e.preventDefault();
                this.viewProductDetails(e.target.closest('tr'));
            }
        });

        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }

        // Notification items
        document.addEventListener('click', (e) => {
            if (e.target.matches('.notification-item, .notification-item *')) {
                this.markNotificationAsRead(e.target.closest('.notification-item'));
            }
        });
    }

    loadDashboardData() {
        // Load user session data
        const userData = localStorage.getItem('orderManageUser') || sessionStorage.getItem('orderManageUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.updateUserInfo(user);
                this.loadRoleSpecificData(user.role);
            } catch (e) {
                console.error('Error loading user data:', e);
            }
        }

        // Load dashboard statistics
        this.loadStatistics();
        
        // Load recent activity
        this.loadRecentActivity();
        
        // Load notifications
        this.loadNotifications();
    }

    updateUserInfo(user) {
        // Update user name and role displays
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = user.name;
        });
        
        document.querySelectorAll('.user-role').forEach(el => {
            el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        });

        // Update avatar
        const avatars = document.querySelectorAll('img[alt="Admin"], img[alt="Wholesaler"], img[alt="Retailer"]');
        avatars.forEach(img => {
            if (user.avatar) {
                img.src = user.avatar;
            }
        });
    }

    loadRoleSpecificData(role) {
        switch (role) {
            case 'admin':
                this.loadAdminData();
                break;
            case 'wholesaler':
                this.loadWholesalerData();
                break;
            case 'retailer':
                this.loadRetailerData();
                break;
        }
    }

    loadAdminData() {
        // Load admin-specific data
        this.loadPendingApprovals();
        this.loadUserManagement();
        this.loadSystemAnalytics();
    }

    loadWholesalerData() {
        // Load wholesaler-specific data
        this.loadProductInventory();
        this.loadOrderManagement();
        this.loadBusinessAnalytics();
    }

    loadRetailerData() {
        // Load retailer-specific data
        this.loadProductCatalog();
        this.loadShoppingCart();
        this.loadOrderHistory();
    }

    loadStatistics() {
        // Simulate loading statistics with animation
        const statNumbers = document.querySelectorAll('.stats-number');
        statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const isNumber = !finalValue.includes('$') && !finalValue.includes('+');
            
            if (isNumber) {
                this.animateCounter(stat, parseInt(finalValue.replace(/,/g, '')), finalValue);
            }
        });
    }

    animateCounter(element, target, originalText) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = originalText;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 20);
    }

    loadPendingApprovals() {
        // This would typically fetch data from an API
        // For demo purposes, the data is already in the HTML
        console.log('Loading pending approvals...');
    }

    loadRecentActivity() {
        // Simulate real-time activity updates
        setTimeout(() => {
            this.addNewActivity({
                icon: 'fas fa-user-plus',
                iconClass: 'bg-success',
                title: 'New User Registration',
                description: 'Sarah Supplier joined as wholesaler',
                time: 'Just now'
            });
        }, 30000); // Add new activity after 30 seconds
    }

    addNewActivity(activity) {
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon ${activity.iconClass}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `;
            activityList.insertBefore(activityItem, activityList.firstChild);
            
            // Remove last item if more than 5 activities
            const items = activityList.querySelectorAll('.activity-item');
            if (items.length > 5) {
                activityList.removeChild(items[items.length - 1]);
            }
            
            // Highlight new activity
            activityItem.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
            setTimeout(() => {
                activityItem.style.backgroundColor = '';
            }, 3000);
        }
    }

    loadNotifications() {
        // Update notification badge count
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const unreadNotifications = document.querySelectorAll('.notification-item.unread').length;
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            badge.textContent = unreadNotifications;
            badge.style.display = unreadNotifications > 0 ? 'block' : 'none';
        });
    }

    markNotificationAsRead(notificationItem) {
        if (notificationItem.classList.contains('unread')) {
            notificationItem.classList.remove('unread');
            this.updateNotificationBadge();
            
            // Show toast
            if (window.app && window.app.showToast) {
                window.app.showToast('Notification marked as read', 'success');
            }
        }
    }

    handleNavigation(navLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        navLink.classList.add('active');
        
        // Get the target section
        const target = navLink.getAttribute('href').substring(1);
        
        // Show appropriate content (in a real app, this would load different pages/components)
        console.log(`Navigating to: ${target}`);
        
        // Update page title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = this.getPageTitle(target);
        }
        
        // Show toast for navigation
        if (window.app && window.app.showToast) {
            window.app.showToast(`Navigated to ${target}`, 'info');
        }
    }

    getPageTitle(section) {
        const titles = {
            dashboard: 'Dashboard',
            users: 'User Management',
            products: 'Product Management',
            orders: 'Order Management',
            analytics: 'Analytics',
            notifications: 'Notifications',
            settings: 'Settings',
            inventory: 'Inventory Management',
            catalog: 'Product Catalog',
            cart: 'Shopping Cart',
            history: 'Order History'
        };
        return titles[section] || 'Dashboard';
    }

    approveProduct(row) {
        const productName = row.querySelector('.fw-semibold').textContent;
        
        // Update status
        const statusBadge = row.querySelector('.status-badge');
        statusBadge.className = 'status-badge status-approved';
        statusBadge.textContent = 'Approved';
        
        // Disable action buttons
        const buttons = row.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
        
        // Show success message
        if (window.app && window.app.showToast) {
            window.app.showToast(`${productName} has been approved`, 'success');
        }
        
        // Add to recent activity
        this.addNewActivity({
            icon: 'fas fa-check',
            iconClass: 'bg-success',
            title: 'Product Approved',
            description: `${productName} approved by admin`,
            time: 'Just now'
        });
    }

    rejectProduct(row) {
        const productName = row.querySelector('.fw-semibold').textContent;
        
        // Update status
        const statusBadge = row.querySelector('.status-badge');
        statusBadge.className = 'status-badge status-rejected';
        statusBadge.textContent = 'Rejected';
        
        // Disable action buttons
        const buttons = row.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
        
        // Show warning message
        if (window.app && window.app.showToast) {
            window.app.showToast(`${productName} has been rejected`, 'warning');
        }
        
        // Add to recent activity
        this.addNewActivity({
            icon: 'fas fa-times',
            iconClass: 'bg-danger',
            title: 'Product Rejected',
            description: `${productName} rejected by admin`,
            time: 'Just now'
        });
    }

    viewProductDetails(row) {
        const productName = row.querySelector('.fw-semibold').textContent;
        
        // In a real app, this would open a modal or navigate to a detail page
        if (window.app && window.app.showToast) {
            window.app.showToast(`Viewing details for ${productName}`, 'info');
        }
        
        console.log(`Viewing details for: ${productName}`);
    }

    performSearch(query) {
        if (!query.trim()) {
            // Show all rows
            document.querySelectorAll('tbody tr').forEach(row => {
                row.style.display = '';
            });
            return;
        }
        
        // Filter table rows based on search query
        document.querySelectorAll('tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }

    sortTable(header) {
        const table = header.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        const isNumeric = header.dataset.type === 'number';
        const isDate = header.dataset.type === 'date';
        const currentDirection = header.dataset.direction || 'asc';
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';

        // Update header direction
        header.dataset.direction = newDirection;
        
        // Reset all other headers
        header.parentNode.querySelectorAll('th[data-sortable]').forEach(th => {
            if (th !== header) {
                delete th.dataset.direction;
                const icon = th.querySelector('i');
                if (icon) icon.className = 'fas fa-sort ms-1';
            }
        });
        
        // Update sort icon
        const icon = header.querySelector('i');
        if (icon) {
            icon.className = `fas fa-sort-${newDirection === 'asc' ? 'up' : 'down'} ms-1`;
        }

        // Sort rows
        rows.sort((a, b) => {
            let aValue = a.cells[columnIndex].textContent.trim();
            let bValue = b.cells[columnIndex].textContent.trim();
            
            let comparison = 0;
            if (isNumeric) {
                comparison = parseFloat(aValue) - parseFloat(bValue);
            } else if (isDate) {
                comparison = new Date(aValue) - new Date(bValue);
            } else {
                comparison = aValue.localeCompare(bValue);
            }
            
            return newDirection === 'asc' ? comparison : -comparison;
        });

        // Reorder rows in DOM
        rows.forEach(row => tbody.appendChild(row));
    }

    initializeRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateTimestamps();
        }, 60000); // Update every minute
        
        setInterval(() => {
            this.updateStatistics();
        }, 300000); // Update statistics every 5 minutes
    }

    updateTimestamps() {
        // Update relative timestamps
        document.querySelectorAll('.activity-time, .notification-time').forEach(timeEl => {
            const time = timeEl.textContent;
            if (time.includes('minutes ago')) {
                const minutes = parseInt(time.match(/\d+/)[0]) + 1;
                timeEl.textContent = `${minutes} minutes ago`;
            }
        });
    }

    updateStatistics() {
        // Simulate statistics updates
        const statsNumbers = document.querySelectorAll('.stats-number');
        statsNumbers.forEach(stat => {
            const currentValue = stat.textContent;
            if (currentValue.includes(',')) {
                const numValue = parseInt(currentValue.replace(/,/g, ''));
                const increase = Math.floor(Math.random() * 10) + 1;
                const newValue = numValue + increase;
                stat.textContent = newValue.toLocaleString();
            }
        });
    }

    // Public methods for external access
    refreshDashboard() {
        this.loadDashboardData();
    }

    exportData(type) {
        // Export functionality
        console.log(`Exporting ${type} data...`);
        if (window.app && window.app.showToast) {
            window.app.showToast(`${type} data exported successfully`, 'success');
        }
    }

    generateReport(type) {
        // Report generation
        console.log(`Generating ${type} report...`);
        if (window.app && window.app.showToast) {
            window.app.showToast(`${type} report generated successfully`, 'success');
        }
    }
}

// Initialize dashboard manager
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});

// Export for other modules
window.DashboardManager = DashboardManager;