// Main Application JavaScript
class OrderManagementApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.loadUserSession();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.handleDOMReady();
        });

        // Handle navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                this.navigate(e.target.dataset.navigate);
            }
        });

        // Handle sidebar toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('.sidebar-toggle, .sidebar-toggle *')) {
                this.toggleSidebar();
            }
        });

        // Handle role selection on landing page
        window.loginAsRole = (role) => {
            this.quickLogin(role);
        };
    }

    handleDOMReady() {
        // Initialize tooltips
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        }

        // Initialize animations
        this.initializeAnimations();

        // Setup theme
        this.setupTheme();
    }

    initializeComponents() {
        // Initialize notification system
        if (window.NotificationManager) {
            this.notifications = new NotificationManager();
        }

        // Initialize charts if on dashboard
        if (document.querySelector('.chart-container')) {
            this.initializeCharts();
        }

        // Initialize data tables
        this.initializeDataTables();

        // Initialize modals
        this.initializeModals();
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-up, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });
    }

    initializeCharts() {
        // This will be called by charts.js if Chart.js is loaded
        if (window.ChartManager) {
            this.charts = new ChartManager();
        }
    }

    initializeDataTables() {
        const tables = document.querySelectorAll('.data-table');
        tables.forEach(table => {
            this.setupTableFeatures(table);
        });
    }

    setupTableFeatures(table) {
        // Add sorting functionality
        const headers = table.querySelectorAll('th[data-sortable]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.innerHTML += ' <i class="fas fa-sort ms-1"></i>';
            
            header.addEventListener('click', () => {
                this.sortTable(table, header);
            });
        });

        // Add search functionality if search input exists
        const searchInput = document.querySelector(`[data-table-search="${table.id}"]`);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTable(table, e.target.value);
            });
        }
    }

    sortTable(table, header) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        const isNumeric = header.dataset.type === 'number';
        const currentDirection = header.dataset.direction || 'asc';
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';

        // Update header direction
        header.dataset.direction = newDirection;
        
        // Update sort icon
        const icon = header.querySelector('i');
        icon.className = `fas fa-sort-${newDirection === 'asc' ? 'up' : 'down'} ms-1`;

        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            let comparison = 0;
            if (isNumeric) {
                comparison = parseFloat(aValue) - parseFloat(bValue);
            } else {
                comparison = aValue.localeCompare(bValue);
            }
            
            return newDirection === 'asc' ? comparison : -comparison;
        });

        // Reorder rows in DOM
        rows.forEach(row => tbody.appendChild(row));
    }

    filterTable(table, searchTerm) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }

    initializeModals() {
        // Setup modal event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-target]')) {
                e.preventDefault();
                const modalId = e.target.dataset.modalTarget;
                this.openModal(modalId);
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && typeof bootstrap !== 'undefined') {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.dashboard-sidebar');
        const main = document.querySelector('.dashboard-main');
        
        if (sidebar && main) {
            if (window.innerWidth <= 992) {
                sidebar.classList.toggle('show');
            } else {
                sidebar.classList.toggle('collapsed');
                main.classList.toggle('expanded');
            }
        }
    }

    navigate(url) {
        // Handle navigation
        if (url.startsWith('http')) {
            window.location.href = url;
        } else {
            // For SPA-style navigation
            window.location.href = url;
        }
    }

    quickLogin(role) {
        // Quick demo login
        const userData = {
            role: role,
            name: this.getDemoUserName(role),
            email: `demo.${role}@ordermanage.com`,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('orderManageUser', JSON.stringify(userData));
        
        // Show loading and redirect
        this.showToast('Logging in...', 'info');
        
        setTimeout(() => {
            this.redirectToDashboard(role);
        }, 1500);
    }

    getDemoUserName(role) {
        const names = {
            admin: 'Admin User',
            wholesaler: 'John Wholesaler',
            retailer: 'Jane Retailer'
        };
        return names[role] || 'Demo User';
    }

    redirectToDashboard(role) {
        const dashboards = {
            admin: 'pages/admin-dashboard.html',
            wholesaler: 'pages/wholesaler-dashboard.html',
            retailer: 'pages/retailer-dashboard.html'
        };
        
        window.location.href = dashboards[role] || 'pages/login.html';
    }

    loadUserSession() {
        const userData = localStorage.getItem('orderManageUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUIForLoggedInUser();
            } catch (e) {
                console.error('Error parsing user data:', e);
                localStorage.removeItem('orderManageUser');
            }
        }
    }

    updateUIForLoggedInUser() {
        if (!this.currentUser) return;

        // Update user info in dashboard
        const userNameElements = document.querySelectorAll('.user-name');
        const userRoleElements = document.querySelectorAll('.user-role');
        
        userNameElements.forEach(el => el.textContent = this.currentUser.name);
        userRoleElements.forEach(el => el.textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1));

        // Set role-specific styling
        document.body.classList.add(`role-${this.currentUser.role}`);
    }

    setupTheme() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('orderManageTheme') || 'light';
        this.setTheme(savedTheme);

        // Listen for theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('.theme-toggle, .theme-toggle *')) {
                this.toggleTheme();
            }
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('orderManageTheme', theme);
        
        // Update theme toggle icon if it exists
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toastContainer = this.getOrCreateToastContainer();
        const toastId = 'toast-' + Date.now();
        
        const toastHTML = `
            <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <i class="fas fa-${this.getToastIcon(type)} text-${type} me-2"></i>
                    <strong class="me-auto">OrderManage Pro</strong>
                    <small class="text-muted">now</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        // Initialize and show toast
        if (typeof bootstrap !== 'undefined') {
            const toastElement = document.getElementById(toastId);
            const bsToast = new bootstrap.Toast(toastElement);
            bsToast.show();
            
            // Remove toast element after it's hidden
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        }
    }

    getOrCreateToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    logout() {
        localStorage.removeItem('orderManageUser');
        this.showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }

    formatDateTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application
const app = new OrderManagementApp();

// Export for other modules
window.OrderManagementApp = OrderManagementApp;