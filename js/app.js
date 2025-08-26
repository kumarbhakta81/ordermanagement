// Main Application JavaScript for Order Management System

// Global variables
let currentUser = {
    id: 1,
    name: "Admin User",
    role: "admin",
    email: "admin@ordermanagement.com"
};

let currentRole = "admin"; // admin, wholesaler, retailer

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Order Management System initialized');
    
    // Initialize components
    initializeDashboard();
    loadRecentActivity();
    updateStats();
    setupEventListeners();
    
    // Show welcome notification
    showNotification('Welcome to Order Management System!', 'success');
});

// Initialize dashboard components
function initializeDashboard() {
    // Update user display
    const userNameElement = document.getElementById('currentUserName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
    
    // Load notification count
    updateNotificationCount();
    
    // Apply current role styling
    applyRoleBasedStyling();
}

// Load and display recent activity
function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;
    
    const activities = window.mockData.recentActivity.slice(0, 5); // Show latest 5
    
    if (activities.length === 0) {
        activityContainer.innerHTML = '<p class="text-muted">No recent activity</p>';
        return;
    }
    
    const activityHtml = activities.map(activity => `
        <div class="d-flex align-items-center mb-3 fade-in">
            <div class="flex-shrink-0">
                <i class="${activity.icon} ${activity.iconColor} fa-lg"></i>
            </div>
            <div class="flex-grow-1 ms-3">
                <p class="mb-1">${activity.message}</p>
                <small class="text-muted">${formatTimeAgo(activity.timestamp)}</small>
            </div>
        </div>
    `).join('');
    
    activityContainer.innerHTML = activityHtml;
}

// Update dashboard statistics
function updateStats() {
    // Update category count
    const totalCategoriesElement = document.getElementById('totalCategories');
    if (totalCategoriesElement) {
        totalCategoriesElement.textContent = window.mockData.categories.length;
    }
    
    // Update product count
    const totalProductsElement = document.getElementById('totalProducts');
    if (totalProductsElement) {
        totalProductsElement.textContent = window.mockData.products.length;
    }
    
    // Update pending approvals
    const pendingApprovalsElement = document.getElementById('pendingApprovals');
    if (pendingApprovalsElement) {
        const pendingCount = window.mockDataHelpers.getPendingProducts().length;
        pendingApprovalsElement.textContent = pendingCount;
    }
    
    // Update low stock items
    const lowStockItemsElement = document.getElementById('lowStockItems');
    if (lowStockItemsElement) {
        const lowStockCount = window.mockDataHelpers.getLowStockProducts().length;
        lowStockItemsElement.textContent = lowStockCount;
    }
}

// Update notification count in header
function updateNotificationCount() {
    const unreadNotifications = window.mockDataHelpers.getUnreadNotifications();
    const badge = document.querySelector('#notificationsToggle .badge');
    
    if (badge) {
        badge.textContent = unreadNotifications.length;
        badge.style.display = unreadNotifications.length > 0 ? 'block' : 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Notification toggle
    const notificationToggle = document.getElementById('notificationsToggle');
    if (notificationToggle) {
        notificationToggle.addEventListener('click', function(e) {
            e.preventDefault();
            showNotificationsModal();
        });
    }
    
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                addLoadingState(this);
                setTimeout(() => removeLoadingState(this), 1000);
            }
        });
    });
}

// Switch user role
function switchRole(role) {
    currentRole = role;
    currentUser.role = role;
    
    // Update user display
    const roleNames = {
        'admin': 'Admin User',
        'wholesaler': 'Wholesaler User',
        'retailer': 'Retailer User'
    };
    
    currentUser.name = roleNames[role] || 'User';
    
    const userNameElement = document.getElementById('currentUserName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
    
    // Apply role-based styling
    applyRoleBasedStyling();
    
    // Show success message
    showNotification(`Switched to ${role} view`, 'success');
    
    // Redirect to appropriate dashboard if not on main page
    setTimeout(() => {
        if (role === 'wholesaler') {
            window.location.href = 'pages/wholesaler-dashboard.html';
        } else if (role === 'retailer') {
            window.location.href = 'pages/retailer-dashboard.html';
        }
    }, 1500);
}

// Apply role-based styling
function applyRoleBasedStyling() {
    const body = document.body;
    
    // Remove existing role classes
    body.classList.remove('role-admin', 'role-wholesaler', 'role-retailer');
    
    // Add current role class
    body.classList.add(`role-${currentRole}`);
    
    // Update navigation based on role
    updateNavigationForRole();
}

// Update navigation based on user role
function updateNavigationForRole() {
    const navItems = document.querySelectorAll('.nav-item, .dropdown-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href') || item.querySelector('a')?.getAttribute('href');
        
        if (href) {
            // Show/hide items based on role
            if (currentRole === 'retailer') {
                // Retailers can't access category/product management
                if (href.includes('category-') || href.includes('product-form')) {
                    item.style.display = 'none';
                }
            } else if (currentRole === 'wholesaler') {
                // Wholesalers have limited access
                if (href.includes('retailer-dashboard')) {
                    item.style.display = 'none';
                }
            }
            // Admin has access to everything
        }
    });
}

// Show category modal
function showCategoryModal() {
    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="categoryModal" tabindex="-1" aria-labelledby="categoryModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="categoryModalLabel">
                            <i class="fas fa-tags me-2"></i>Add New Category
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="categoryForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="categoryName" class="form-label">Category Name *</label>
                                        <input type="text" class="form-control" id="categoryName" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="categoryParent" class="form-label">Parent Category</label>
                                        <select class="form-select" id="categoryParent">
                                            <option value="">No Parent (Root Category)</option>
                                            ${generateCategoryOptions()}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="categoryDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="categoryDescription" rows="3"></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="categorySlug" class="form-label">URL Slug</label>
                                        <input type="text" class="form-control" id="categorySlug">
                                        <small class="form-text text-muted">Auto-generated from name if empty</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="categoryStatus" class="form-label">Status</label>
                                        <select class="form-select" id="categoryStatus">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="categoryImage" class="form-label">Category Image</label>
                                <div class="image-upload-area" onclick="document.getElementById('categoryImageInput').click()">
                                    <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                                    <p class="text-muted">Click to upload or drag and drop</p>
                                    <input type="file" id="categoryImageInput" class="d-none" accept="image/*">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveCategoryModal()">
                            <i class="fas fa-save me-2"></i>Save Category
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('categoryModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
    
    // Setup form auto-generation
    setupCategoryFormHandlers();
}

// Generate category options for parent dropdown
function generateCategoryOptions() {
    const rootCategories = window.mockDataHelpers.getRootCategories();
    return rootCategories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
}

// Setup category form handlers
function setupCategoryFormHandlers() {
    const nameInput = document.getElementById('categoryName');
    const slugInput = document.getElementById('categorySlug');
    
    if (nameInput && slugInput) {
        nameInput.addEventListener('input', function() {
            if (!slugInput.value) {
                slugInput.value = this.value.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
        });
    }
    
    // Setup image upload preview
    const imageInput = document.getElementById('categoryImageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                previewImage(file, document.querySelector('.image-upload-area'));
            }
        });
    }
}

// Save category from modal
function saveCategoryModal() {
    const form = document.getElementById('categoryForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const categoryData = {
        id: Date.now(), // Simple ID generation
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        parentId: document.getElementById('categoryParent').value || null,
        slug: document.getElementById('categorySlug').value,
        status: document.getElementById('categoryStatus').value,
        productCount: 0,
        image: "https://via.placeholder.com/300x200/007bff/ffffff?text=" + encodeURIComponent(document.getElementById('categoryName').value),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to mock data
    window.mockData.categories.push(categoryData);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
    modal.hide();
    
    // Update stats
    updateStats();
    
    // Show success message
    showNotification(`Category "${categoryData.name}" created successfully!`, 'success');
}

// Show product modal
function showProductModal() {
    window.location.href = 'pages/products/product-form.html';
}

// Show reports modal
function showReportsModal() {
    showNotification('Reports feature coming soon!', 'info');
}

// Show notifications modal
function showNotificationsModal() {
    const notifications = window.mockData.notifications;
    
    const modalHtml = `
        <div class="modal fade" id="notificationsModal" tabindex="-1" aria-labelledby="notificationsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="notificationsModalLabel">
                            <i class="fas fa-bell me-2"></i>Notifications
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${notifications.length === 0 ? 
                            '<p class="text-muted text-center">No notifications</p>' :
                            notifications.map(notif => `
                                <div class="d-flex align-items-start mb-3 ${notif.read ? 'opacity-75' : ''}" data-notification-id="${notif.id}">
                                    <div class="flex-shrink-0">
                                        <i class="fas fa-${getNotificationIcon(notif.type)} text-${notif.type} fa-lg"></i>
                                    </div>
                                    <div class="flex-grow-1 ms-3">
                                        <h6 class="mb-1">${notif.title}</h6>
                                        <p class="mb-1">${notif.message}</p>
                                        <small class="text-muted">${formatTimeAgo(notif.timestamp)}</small>
                                    </div>
                                    <div class="flex-shrink-0">
                                        ${!notif.read ? '<span class="badge bg-primary">New</span>' : ''}
                                        <button class="btn btn-sm btn-outline-secondary ms-2" onclick="markNotificationRead(${notif.id})">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" onclick="markAllNotificationsRead()">
                            Mark All Read
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('notificationsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('notificationsModal'));
    modal.show();
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        'warning': 'exclamation-triangle',
        'info': 'info-circle',
        'success': 'check-circle',
        'error': 'times-circle'
    };
    return icons[type] || 'bell';
}

// Mark notification as read
function markNotificationRead(notificationId) {
    const notification = window.mockData.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        updateNotificationCount();
        
        // Update the notification display
        const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationElement) {
            notificationElement.classList.add('opacity-75');
            notificationElement.querySelector('.badge')?.remove();
        }
    }
}

// Mark all notifications as read
function markAllNotificationsRead() {
    window.mockData.notifications.forEach(notification => {
        notification.read = true;
    });
    
    updateNotificationCount();
    
    // Update all notification displays
    document.querySelectorAll('[data-notification-id]').forEach(element => {
        element.classList.add('opacity-75');
        element.querySelector('.badge')?.remove();
    });
    
    showNotification('All notifications marked as read', 'success');
}

// Utility function to show notifications
function showNotification(message, type = 'info', duration = 3000) {
    const notificationHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed" 
             style="top: 80px; right: 20px; z-index: 9999; min-width: 300px;" 
             role="alert">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', notificationHtml);
    
    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            const alerts = document.querySelectorAll('.alert.position-fixed');
            if (alerts.length > 0) {
                alerts[alerts.length - 1].remove();
            }
        }, duration);
    }
}

// Utility function to format time ago
function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Utility function to add loading state to button
function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.dataset.originalText = originalText;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
    button.disabled = true;
}

// Utility function to remove loading state from button
function removeLoadingState(button) {
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
    }
    button.disabled = false;
}

// Utility function to preview uploaded image
function previewImage(file, container) {
    const reader = new FileReader();
    reader.onload = function(e) {
        container.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="img-fluid rounded" style="max-height: 200px;">
            <p class="mt-2 mb-0 text-muted">${file.name}</p>
        `;
    };
    reader.readAsDataURL(file);
}

// Export functions for global access
window.orderManagementApp = {
    switchRole,
    showCategoryModal,
    showProductModal,
    showReportsModal,
    showNotificationsModal,
    markNotificationRead,
    markAllNotificationsRead,
    showNotification,
    updateStats,
    loadRecentActivity
};