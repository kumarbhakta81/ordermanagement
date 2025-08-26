/* Authentication module */

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupAuthForms();
});

function initializeAuth() {
    const token = localStorage.getItem('token');
    
    if (token) {
        // Verify token and get user info
        verifyToken()
            .then(() => {
                showAuthenticatedState();
                // Redirect to dashboard if on login page
                if (AppState.currentPage === 'login') {
                    showPage('dashboard');
                }
            })
            .catch(() => {
                // Token is invalid, clear it and show login
                logout();
            });
    } else {
        showUnauthenticatedState();
        showPage('login');
    }
}

function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
    }

    if (!Utils.validateEmail(email)) {
        showToast('Please enter a valid email address', 'warning');
        return;
    }

    try {
        const response = await Utils.HttpClient.post('/auth/login', {
            email,
            password
        });

        if (response.success) {
            // Store token and user info
            localStorage.setItem('token', response.data.token);
            AppState.token = response.data.token;
            AppState.user = response.data.user;

            showToast(`Welcome back, ${response.data.user.full_name}!`, 'success');
            showAuthenticatedState();
            showPage('dashboard');
            
            // Reset form
            Utils.resetForm('login-form');
        }
    } catch (error) {
        showToast(error.message || 'Login failed', 'danger');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const full_name = document.getElementById('register-full-name').value.trim();
    const role = document.getElementById('register-role').value;
    const phone = document.getElementById('register-phone').value.trim();
    const address = document.getElementById('register-address').value.trim();

    // Validation
    if (!username || !email || !password || !full_name) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    if (!Utils.validateEmail(email)) {
        showToast('Please enter a valid email address', 'warning');
        return;
    }

    if (!Utils.validatePassword(password)) {
        showToast('Password must be at least 8 characters with uppercase, lowercase, and number', 'warning');
        return;
    }

    if (phone && !Utils.validatePhone(phone)) {
        showToast('Please enter a valid phone number', 'warning');
        return;
    }

    try {
        const registerData = {
            username,
            email,
            password,
            full_name,
            role
        };

        if (phone) registerData.phone = phone;
        if (address) registerData.address = address;

        const response = await Utils.HttpClient.post('/auth/register', registerData);

        if (response.success) {
            // Store token and user info
            localStorage.setItem('token', response.data.token);
            AppState.token = response.data.token;
            AppState.user = response.data.user;

            showToast(`Welcome, ${response.data.user.full_name}! Your account has been created.`, 'success');
            showAuthenticatedState();
            showPage('dashboard');
            
            // Reset form
            Utils.resetForm('register-form');
        }
    } catch (error) {
        showToast(error.message || 'Registration failed', 'danger');
    }
}

async function verifyToken() {
    try {
        const response = await Utils.HttpClient.get('/auth/me');
        
        if (response.success) {
            AppState.user = response.data;
            return true;
        }
        throw new Error('Token verification failed');
    } catch (error) {
        throw error;
    }
}

function logout() {
    // Clear stored data
    localStorage.removeItem('token');
    AppState.token = null;
    AppState.user = null;
    AppState.notifications = [];

    // Show unauthenticated state
    showUnauthenticatedState();
    
    // Redirect to login
    showPage('login');
    
    showToast('You have been logged out', 'info');
}

function showAuthenticatedState() {
    if (!AppState.user) return;

    // Show user dropdown and hide login button
    document.getElementById('user-dropdown').style.display = 'block';
    document.getElementById('login-button').style.display = 'none';
    document.getElementById('notifications-dropdown').style.display = 'block';

    // Update user name in dropdown
    document.getElementById('user-name').textContent = AppState.user.full_name;

    // Setup navigation based on user role
    setupRoleBasedNavigation();

    // Start notification polling
    startNotificationPolling();
}

function showUnauthenticatedState() {
    // Hide user dropdown and show login button
    document.getElementById('user-dropdown').style.display = 'none';
    document.getElementById('login-button').style.display = 'block';
    document.getElementById('notifications-dropdown').style.display = 'none';

    // Clear navigation
    clearNavigation();

    // Stop notification polling
    stopNotificationPolling();
}

function setupRoleBasedNavigation() {
    const navbarNav = document.querySelector('.navbar-nav.me-auto');
    const role = AppState.user.role;

    // Clear existing navigation items except dashboard
    const navItems = navbarNav.querySelectorAll('.nav-item:not(:first-child)');
    navItems.forEach(item => item.remove());

    // Add role-specific navigation
    const navItems_data = getNavigationItems(role);
    
    navItems_data.forEach(item => {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        navItem.innerHTML = `
            <a class="nav-link" href="#" onclick="showPage('${item.page}')">
                <i class="${item.icon}"></i> ${item.label}
            </a>
        `;
        navbarNav.appendChild(navItem);
    });
}

function getNavigationItems(role) {
    const commonItems = [
        { page: 'products', label: 'Products', icon: 'fas fa-box' },
        { page: 'orders', label: 'Orders', icon: 'fas fa-shopping-cart' }
    ];

    switch (role) {
        case 'admin':
            return [
                ...commonItems,
                { page: 'samples', label: 'Samples', icon: 'fas fa-eye' },
                { page: 'users', label: 'Users', icon: 'fas fa-users' },
                { page: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
            ];

        case 'wholesaler':
            return [
                ...commonItems,
                { page: 'samples', label: 'My Samples', icon: 'fas fa-eye' },
                { page: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
            ];

        case 'retailer':
            return [
                ...commonItems,
                { page: 'samples', label: 'Samples', icon: 'fas fa-eye' }
            ];

        default:
            return commonItems;
    }
}

function clearNavigation() {
    const navbarNav = document.querySelector('.navbar-nav.me-auto');
    const navItems = navbarNav.querySelectorAll('.nav-item:not(:first-child)');
    navItems.forEach(item => item.remove());
}

function showLogin() {
    showPage('login');
}

function showRegister() {
    showPage('register');
}

async function showProfile() {
    // This would show a profile modal or page
    // For now, we'll just show user info in a toast
    if (AppState.user) {
        showToast(`Profile: ${AppState.user.full_name} (${AppState.user.role})`, 'info');
    }
}

// Notification polling
let notificationPollingInterval;

function startNotificationPolling() {
    // Poll every 30 seconds
    notificationPollingInterval = setInterval(pollNotifications, 30000);
    
    // Initial load
    pollNotifications();
}

function stopNotificationPolling() {
    if (notificationPollingInterval) {
        clearInterval(notificationPollingInterval);
        notificationPollingInterval = null;
    }
}

async function pollNotifications() {
    if (!AppState.token) return;

    try {
        const response = await Utils.HttpClient.get('/notifications/recent', {
            since: AppState.lastNotificationCheck || new Date(Date.now() - 30000).toISOString()
        });

        if (response.success) {
            AppState.lastNotificationCheck = response.data.timestamp;
            
            // Update notification count
            updateNotificationCount(response.data.unread_count);
            
            // Show new notifications as toasts
            if (response.data.notifications.length > 0) {
                response.data.notifications.forEach(notification => {
                    if (!notification.is_read) {
                        showNotificationToast(notification);
                    }
                });
            }
            
            // Update notification dropdown
            updateNotificationDropdown(response.data.notifications.slice(0, 5));
        }
    } catch (error) {
        console.error('Failed to poll notifications:', error);
    }
}

function updateNotificationCount(count) {
    const badge = document.getElementById('notification-count');
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function updateNotificationDropdown(notifications) {
    const notificationList = document.getElementById('notification-list');
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<li><span class="dropdown-item-text text-muted">No new notifications</span></li>';
        return;
    }

    const notificationItems = notifications.map(notification => `
        <li>
            <div class="dropdown-item notification-item ${!notification.is_read ? 'unread' : ''}" 
                 onclick="markNotificationAsRead(${notification.id})">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${Utils.truncateText(notification.message, 60)}</div>
                <div class="notification-time">${Utils.formatTimeAgo(notification.created_at)}</div>
            </div>
        </li>
    `).join('');

    notificationList.innerHTML = notificationItems;
}

function showNotificationToast(notification) {
    const type = notification.type.includes('error') || notification.type.includes('reject') ? 'danger' :
                 notification.type.includes('success') || notification.type.includes('approve') ? 'success' :
                 notification.type.includes('warning') ? 'warning' : 'info';
    
    showToast(`${notification.title}: ${notification.message}`, type, 8000);
}

async function markNotificationAsRead(notificationId) {
    try {
        await Utils.HttpClient.put(`/notifications/${notificationId}/read`);
        // Refresh notifications
        pollNotifications();
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

function showNotifications() {
    // This would show a full notifications page
    showToast('Notifications page coming soon!', 'info');
}

// Export functions for global use
window.Auth = {
    handleLogin,
    handleRegister,
    logout,
    showLogin,
    showRegister,
    showProfile,
    markNotificationAsRead,
    showNotifications
};