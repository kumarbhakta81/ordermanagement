/* Dashboard-specific functionality */

// Dashboard state
const DashboardState = {
    analytics: null,
    refreshInterval: null
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupDashboardEventListeners();
});

function setupDashboardEventListeners() {
    // Auto-refresh dashboard every 5 minutes
    DashboardState.refreshInterval = setInterval(() => {
        if (AppState.currentPage === 'dashboard' && AppState.user) {
            loadDashboard();
        }
    }, 5 * 60 * 1000);
}

// Enhanced dashboard loading with caching
async function loadDashboard() {
    if (!AppState.user) return;

    const dashboardContent = document.getElementById('dashboard-content');
    
    // Show loading state
    dashboardContent.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading dashboard...</p>
        </div>
    `;

    try {
        const response = await Utils.HttpClient.get('/analytics/dashboard');
        
        if (response.success) {
            DashboardState.analytics = response.data;
            renderDashboard(response.data);
            
            // Load additional data based on role
            await loadRoleSpecificData();
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showDashboardError();
    }
}

async function loadRoleSpecificData() {
    const role = AppState.user.role;
    
    try {
        switch (role) {
            case 'admin':
                await loadAdminDashboardData();
                break;
            case 'wholesaler':
                await loadWholesalerDashboardData();
                break;
            case 'retailer':
                await loadRetailerDashboardData();
                break;
        }
    } catch (error) {
        console.error('Failed to load role-specific data:', error);
    }
}

async function loadAdminDashboardData() {
    // Load pending approvals
    try {
        const [productsResponse, samplesResponse] = await Promise.all([
            Utils.HttpClient.get('/products/admin/pending', { limit: 5 }),
            Utils.HttpClient.get('/samples/admin/pending', { limit: 5 })
        ]);

        if (productsResponse.success) {
            updatePendingProducts(productsResponse.data.products);
        }

        if (samplesResponse.success) {
            updatePendingSamples(samplesResponse.data.samples);
        }
    } catch (error) {
        console.error('Failed to load admin dashboard data:', error);
    }
}

async function loadWholesalerDashboardData() {
    // Load product analytics
    try {
        const analyticsResponse = await Utils.HttpClient.get('/analytics/products');
        
        if (analyticsResponse.success) {
            updateProductAnalytics(analyticsResponse.data);
        }
    } catch (error) {
        console.error('Failed to load wholesaler dashboard data:', error);
    }
}

async function loadRetailerDashboardData() {
    // Load order analytics
    try {
        const analyticsResponse = await Utils.HttpClient.get('/analytics/orders', {
            period: '30',
            group_by: 'day'
        });
        
        if (analyticsResponse.success) {
            updateOrderAnalytics(analyticsResponse.data);
        }
    } catch (error) {
        console.error('Failed to load retailer dashboard data:', error);
    }
}

function updatePendingProducts(products) {
    const container = document.querySelector('.admin-quick-actions .list-group');
    if (!container) return;

    const pendingProductsItem = container.querySelector('.list-group-item:first-child .badge');
    if (pendingProductsItem) {
        pendingProductsItem.textContent = products.length;
        pendingProductsItem.className = products.length > 0 ? 'badge bg-warning rounded-pill' : 'badge bg-secondary rounded-pill';
    }
}

function updatePendingSamples(samples) {
    const container = document.querySelector('.admin-quick-actions .list-group');
    if (!container) return;

    const pendingSamplesItem = container.querySelector('.list-group-item:nth-child(2) .badge');
    if (pendingSamplesItem) {
        pendingSamplesItem.textContent = samples.length;
        pendingSamplesItem.className = samples.length > 0 ? 'badge bg-info rounded-pill' : 'badge bg-secondary rounded-pill';
    }
}

function updateProductAnalytics(analytics) {
    // Update top products section
    const topProductsContainer = document.querySelector('.top-products');
    if (topProductsContainer && analytics.performance) {
        const topProductsHtml = analytics.performance.slice(0, 5).map(product => `
            <div class="inventory-item">
                <div class="inventory-name">${product.name}</div>
                <div class="inventory-quantity">
                    ${product.total_sold} sold (${product.total_revenue})
                </div>
            </div>
        `).join('');

        const listContainer = topProductsContainer.querySelector('.performance-list') || 
                             topProductsContainer.appendChild(document.createElement('div'));
        listContainer.className = 'performance-list';
        listContainer.innerHTML = topProductsHtml || '<div class="text-muted text-center py-3">No sales data available</div>';
    }
}

function updateOrderAnalytics(analytics) {
    // This could update charts or tables with order analytics
    // For now, we'll just log the data
    console.log('Order analytics loaded:', analytics);
}

// Dashboard action handlers
function viewPendingProducts() {
    showPage('products');
    // Filter to show only pending products
    setTimeout(() => {
        if (typeof filterProducts === 'function') {
            document.getElementById('product-status-filter').value = 'pending';
            filterProducts();
        }
    }, 100);
}

function viewPendingSamples() {
    showPage('samples');
    // Filter to show only pending samples
    setTimeout(() => {
        if (typeof filterSamples === 'function') {
            document.getElementById('sample-status-filter').value = 'pending';
            filterSamples();
        }
    }, 100);
}

function viewNewOrders() {
    showPage('orders');
    // Filter to show only new orders
    setTimeout(() => {
        if (typeof filterOrders === 'function') {
            document.getElementById('order-status-filter').value = 'pending';
            filterOrders();
        }
    }, 100);
}

// Quick action buttons
function quickCreateProduct() {
    if (AppState.user.role === 'wholesaler') {
        showPage('products');
        setTimeout(() => {
            if (typeof showAddProduct === 'function') {
                showAddProduct();
            }
        }, 100);
    }
}

function quickCreateSample() {
    if (AppState.user.role === 'wholesaler') {
        showPage('samples');
        setTimeout(() => {
            if (typeof showAddSample === 'function') {
                showAddSample();
            }
        }, 100);
    }
}

function quickViewOrders() {
    showPage('orders');
}

function quickViewAnalytics() {
    showPage('analytics');
}

// Dashboard widget interactions
function expandWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    if (widget) {
        widget.classList.toggle('expanded');
    }
}

function refreshWidget(widgetType) {
    switch (widgetType) {
        case 'stats':
            loadDashboard();
            break;
        case 'activity':
            loadRoleSpecificData();
            break;
        case 'charts':
            loadAnalyticsData();
            break;
        default:
            loadDashboard();
    }
}

async function loadAnalyticsData() {
    if (!AppState.user) return;

    try {
        const [orderAnalytics, productAnalytics] = await Promise.all([
            Utils.HttpClient.get('/analytics/orders', { period: '30' }),
            Utils.HttpClient.get('/analytics/products')
        ]);

        if (orderAnalytics.success) {
            renderOrderChart(orderAnalytics.data);
        }

        if (productAnalytics.success) {
            renderProductChart(productAnalytics.data);
        }
    } catch (error) {
        console.error('Failed to load analytics data:', error);
    }
}

function renderOrderChart(data) {
    // This would integrate with a charting library like Chart.js
    // For now, we'll create a simple text representation
    const chartContainer = document.getElementById('order-chart');
    if (chartContainer && data.length > 0) {
        const chartHtml = `
            <div class="chart-container">
                <div class="chart-header">
                    <h6 class="chart-title">Order Trends (Last 30 Days)</h6>
                </div>
                <div class="chart-content">
                    ${data.slice(0, 7).map(item => `
                        <div class="chart-item d-flex justify-content-between">
                            <span>${Utils.formatDate(item.period)}</span>
                            <span>${item.order_count} orders (${item.total_revenue})</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        chartContainer.innerHTML = chartHtml;
    }
}

function renderProductChart(data) {
    // Similar chart rendering for product analytics
    const chartContainer = document.getElementById('product-chart');
    if (chartContainer && data.by_category) {
        const chartHtml = `
            <div class="chart-container">
                <div class="chart-header">
                    <h6 class="chart-title">Products by Category</h6>
                </div>
                <div class="chart-content">
                    ${data.by_category.slice(0, 5).map(category => `
                        <div class="chart-item d-flex justify-content-between">
                            <span>${category.category}</span>
                            <span>${category.product_count} products</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        chartContainer.innerHTML = chartHtml;
    }
}

// Performance indicators
function updatePerformanceIndicators(data) {
    const indicators = document.querySelectorAll('.performance-indicator');
    
    indicators.forEach((indicator, index) => {
        const value = indicator.querySelector('.performance-value');
        const change = indicator.querySelector('.performance-change');
        
        if (value && data[index]) {
            value.textContent = data[index].value;
            value.className = `performance-value ${data[index].trend}`;
            
            if (change) {
                change.textContent = data[index].change;
                change.className = `performance-change ${data[index].trend}`;
            }
        }
    });
}

// Export dashboard functions
window.Dashboard = {
    loadDashboard,
    viewPendingProducts,
    viewPendingSamples,
    viewNewOrders,
    quickCreateProduct,
    quickCreateSample,
    quickViewOrders,
    quickViewAnalytics,
    expandWidget,
    refreshWidget
};

// Global function exports for onclick handlers
window.viewPendingProducts = viewPendingProducts;
window.viewPendingSamples = viewPendingSamples;
window.viewNewOrders = viewNewOrders;
window.quickCreateProduct = quickCreateProduct;
window.quickCreateSample = quickCreateSample;
window.quickViewOrders = quickViewOrders;
window.quickViewAnalytics = quickViewAnalytics;
window.refreshWidget = refreshWidget;