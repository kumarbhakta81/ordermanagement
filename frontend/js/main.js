/* Main application logic */

// Global state management
window.AppState = {
    user: null,
    token: localStorage.getItem('token'),
    notifications: [],
    currentPage: 'login',
    lastNotificationCheck: null
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize routing
    initializeRouting();
    
    // Initialize event listeners
    setupGlobalEventListeners();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Start with authentication check
    // Auth module will handle the rest
}

function initializeRouting() {
    // Handle initial route from URL hash
    const hash = window.location.hash.slice(1);
    if (hash && AppState.token) {
        AppState.currentPage = hash;
    }
}

function setupGlobalEventListeners() {
    // Handle escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });

    // Handle click outside modals
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // Handle form submissions globally to prevent default
    document.addEventListener('submit', function(event) {
        // Let specific form handlers manage submission
        event.preventDefault();
    });
}

function initializeTooltips() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Modal management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

function closeModal(modalElement) {
    const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
    if (bootstrapModal) {
        bootstrapModal.hide();
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }
    });
}

// Dashboard loading
async function loadDashboard() {
    if (!AppState.user) return;

    try {
        const response = await Utils.HttpClient.get('/analytics/dashboard');
        
        if (response.success) {
            renderDashboard(response.data);
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showDashboardError();
    }
}

function renderDashboard(data) {
    const dashboardContent = document.getElementById('dashboard-content');
    const role = AppState.user.role;

    let dashboardHtml = '';

    switch (role) {
        case 'admin':
            dashboardHtml = renderAdminDashboard(data);
            break;
        case 'wholesaler':
            dashboardHtml = renderWholesalerDashboard(data);
            break;
        case 'retailer':
            dashboardHtml = renderRetailerDashboard(data);
            break;
        default:
            dashboardHtml = '<div class="alert alert-warning">Dashboard not available for your role.</div>';
    }

    dashboardContent.innerHTML = dashboardHtml;
}

function renderAdminDashboard(data) {
    return `
        <div class="admin-dashboard">
            <!-- Stats Cards -->
            <div class="dashboard-grid four-column mb-4">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.users?.admin || 0}</div>
                            <div class="stat-label">Admins</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-user-shield"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card success">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.users?.wholesaler || 0}</div>
                            <div class="stat-label">Wholesalers</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-store"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card info">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.users?.retailer || 0}</div>
                            <div class="stat-label">Retailers</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-shopping-basket"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card warning">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.orders?.total_revenue || '$0.00'}</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions and Recent Activity -->
            <div class="dashboard-grid two-column">
                <div class="admin-quick-actions">
                    <h5><i class="fas fa-tasks"></i> Pending Approvals</h5>
                    <div class="list-group list-group-flush">
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <span><i class="fas fa-box text-warning"></i> Pending Products</span>
                            <span class="badge bg-warning rounded-pill">${data.products?.pending || 0}</span>
                        </div>
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <span><i class="fas fa-eye text-info"></i> Pending Samples</span>
                            <span class="badge bg-info rounded-pill">${data.samples?.pending || 0}</span>
                        </div>
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <span><i class="fas fa-shopping-cart text-primary"></i> New Orders</span>
                            <span class="badge bg-primary rounded-pill">${data.orders?.pending || 0}</span>
                        </div>
                    </div>
                </div>

                <div class="activity-feed">
                    <h5><i class="fas fa-clock"></i> Recent Activity</h5>
                    ${renderRecentActivity(data.recent_orders, data.recent_products)}
                </div>
            </div>
        </div>
    `;
}

function renderWholesalerDashboard(data) {
    return `
        <div class="wholesaler-dashboard">
            <!-- Stats Cards -->
            <div class="dashboard-grid four-column mb-4">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.products?.total || 0}</div>
                            <div class="stat-label">Total Products</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-box"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card success">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.products?.approved || 0}</div>
                            <div class="stat-label">Approved Products</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card warning">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.products?.pending || 0}</div>
                            <div class="stat-label">Pending Approval</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card info">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.orders?.total_revenue || '$0.00'}</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Products and Inventory -->
            <div class="dashboard-grid two-column">
                <div class="top-products">
                    <h5><i class="fas fa-star"></i> Top Selling Products</h5>
                    ${renderTopProducts(data.top_products)}
                </div>

                <div class="inventory-status">
                    <h5><i class="fas fa-warehouse"></i> Inventory Status</h5>
                    <div class="quick-stats">
                        <div class="quick-stats-grid">
                            <div class="quick-stat">
                                <div class="quick-stat-value">${data.products?.total_inventory || 0}</div>
                                <div class="quick-stat-label">Total Items</div>
                            </div>
                            <div class="quick-stat">
                                <div class="quick-stat-value">${data.orders?.total_items_sold || 0}</div>
                                <div class="quick-stat-label">Items Sold</div>
                            </div>
                            <div class="quick-stat">
                                <div class="quick-stat-value">${data.samples?.total || 0}</div>
                                <div class="quick-stat-label">Samples</div>
                            </div>
                            <div class="quick-stat">
                                <div class="quick-stat-value">${data.orders?.total_orders || 0}</div>
                                <div class="quick-stat-label">Orders</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRetailerDashboard(data) {
    return `
        <div class="retailer-dashboard">
            <!-- Stats Cards -->
            <div class="dashboard-grid four-column mb-4">
                <div class="stat-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.orders?.total || 0}</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card success">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.orders?.delivered || 0}</div>
                            <div class="stat-label">Delivered</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card warning">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.orders?.pending || 0}</div>
                            <div class="stat-label">Pending</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card info">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-value">${data.orders?.total_spent || '$0.00'}</div>
                            <div class="stat-label">Total Spent</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Orders and Quick Stats -->
            <div class="dashboard-grid two-column">
                <div class="recent-orders">
                    <h5><i class="fas fa-history"></i> Recent Orders</h5>
                    ${renderRecentOrders(data.recent_orders)}
                </div>

                <div class="quick-stats">
                    <h5><i class="fas fa-chart-pie"></i> Order Statistics</h5>
                    <div class="quick-stats-grid">
                        <div class="quick-stat">
                            <div class="quick-stat-value">${data.items?.total_items || 0}</div>
                            <div class="quick-stat-label">Items Purchased</div>
                        </div>
                        <div class="quick-stat">
                            <div class="quick-stat-value">${data.items?.unique_products || 0}</div>
                            <div class="quick-stat-label">Unique Products</div>
                        </div>
                        <div class="quick-stat">
                            <div class="quick-stat-value">${data.orders?.shipped || 0}</div>
                            <div class="quick-stat-label">Shipped</div>
                        </div>
                        <div class="quick-stat">
                            <div class="quick-stat-value">${data.orders?.cancelled || 0}</div>
                            <div class="quick-stat-label">Cancelled</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRecentActivity(recentOrders = [], recentProducts = []) {
    const activities = [];
    
    recentOrders.slice(0, 5).forEach(order => {
        activities.push({
            icon: 'shopping-cart',
            iconClass: 'info',
            title: `New Order ${order.order_number}`,
            description: `Order placed by ${order.retailer_name}`,
            time: order.created_at,
            amount: order.total_amount
        });
    });
    
    recentProducts.slice(0, 5).forEach(product => {
        activities.push({
            icon: 'box',
            iconClass: 'warning',
            title: `Product Pending Approval`,
            description: `${product.name} by ${product.wholesaler_name}`,
            time: product.created_at
        });
    });
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    if (activities.length === 0) {
        return '<div class="text-muted text-center py-3">No recent activity</div>';
    }
    
    return activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.iconClass}">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${Utils.formatTimeAgo(activity.time)}</div>
            </div>
            ${activity.amount ? `<div class="activity-amount">${activity.amount}</div>` : ''}
        </div>
    `).join('');
}

function renderTopProducts(products = []) {
    if (products.length === 0) {
        return '<div class="text-muted text-center py-3">No sales data available</div>';
    }
    
    return products.slice(0, 5).map(product => `
        <div class="inventory-item">
            <div class="inventory-name">${product.name}</div>
            <div class="inventory-quantity">
                ${product.total_sold} sold (${product.revenue})
            </div>
        </div>
    `).join('');
}

function renderRecentOrders(orders = []) {
    if (orders.length === 0) {
        return '<div class="text-muted text-center py-3">No recent orders</div>';
    }
    
    return orders.slice(0, 5).map(order => `
        <div class="order-summary-item">
            <div class="order-summary-info">
                <div class="order-summary-number">${order.order_number}</div>
                <div class="order-summary-date">${Utils.formatDate(order.created_at)}</div>
            </div>
            <div class="order-summary-amount">${order.total_amount}</div>
            <span class="order-status ${order.status}">${order.status}</span>
        </div>
    `).join('');
}

function showDashboardError() {
    const dashboardContent = document.getElementById('dashboard-content');
    dashboardContent.innerHTML = `
        <div class="alert alert-danger">
            <h5><i class="fas fa-exclamation-triangle"></i> Error Loading Dashboard</h5>
            <p>Unable to load dashboard data. Please try refreshing the page.</p>
            <button type="button" class="btn btn-outline-danger" onclick="loadDashboard()">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

// Expose functions globally
window.Main = {
    loadDashboard,
    showModal,
    closeModal,
    closeAllModals
};

// Convenience functions for global access
window.loadDashboard = loadDashboard;
window.showModal = showModal;
window.closeModal = closeModal;