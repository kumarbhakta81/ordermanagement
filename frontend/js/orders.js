/* Orders management functionality */

// Orders state
const OrdersState = {
    orders: [],
    currentPage: 1,
    filters: {
        status: '',
        search: ''
    }
};

// Initialize orders module
document.addEventListener('DOMContentLoaded', function() {
    setupOrdersEventListeners();
});

function setupOrdersEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('order-search');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(filterOrders, 500));
    }

    // Status filter
    const statusFilter = document.getElementById('order-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }
}

// Load orders
async function loadOrders(page = 1) {
    const ordersListContainer = document.getElementById('orders-list');
    
    // Show loading state
    ordersListContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading orders...</p>
        </div>
    `;

    try {
        // Prepare query parameters
        const params = {
            page,
            limit: 10,
            ...OrdersState.filters
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });

        const response = await Utils.HttpClient.get('/orders', params);
        
        if (response.success) {
            OrdersState.orders = response.data.orders;
            OrdersState.currentPage = page;
            
            renderOrders(response.data.orders, response.data.pagination);
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
        showOrdersError();
    }
}

function renderOrders(orders, pagination) {
    const ordersListContainer = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersListContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Orders Found</h5>
                <p class="text-muted">Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }

    const ordersHtml = `
        <div class="row">
            ${orders.map(order => renderOrderCard(order)).join('')}
        </div>
        
        ${pagination.totalPages > 1 ? Utils.createPagination(pagination, 'loadOrders') : ''}
    `;

    ordersListContainer.innerHTML = ordersHtml;
}

function renderOrderCard(order) {
    const statusClass = getOrderStatusClass(order.status);
    const canUpdateStatus = AppState.user && 
        (AppState.user.role === 'admin' || AppState.user.role === 'wholesaler');
    const canCancel = AppState.user && 
        ((AppState.user.role === 'retailer' && AppState.user.id === order.retailer_id && order.status === 'pending') ||
         AppState.user.role === 'admin');

    return `
        <div class="col-12 mb-4">
            <div class="card order-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">
                            <i class="fas fa-shopping-cart"></i> 
                            Order #${order.order_number}
                        </h6>
                        <small class="text-muted">
                            Placed on ${Utils.formatDateTime(order.created_at)}
                        </small>
                    </div>
                    <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Customer Information</h6>
                            <p class="mb-1"><strong>Name:</strong> ${order.retailer_full_name}</p>
                            <p class="mb-1"><strong>Email:</strong> ${order.retailer_email}</p>
                            ${order.retailer_phone ? `<p class="mb-1"><strong>Phone:</strong> ${order.retailer_phone}</p>` : ''}
                        </div>
                        <div class="col-md-6">
                            <h6>Order Summary</h6>
                            <p class="mb-1"><strong>Total Amount:</strong> $${order.total_amount}</p>
                            <p class="mb-1"><strong>Items:</strong> ${order.items ? order.items.length : 0} item(s)</p>
                            ${order.tracking_number ? `<p class="mb-1"><strong>Tracking:</strong> ${order.tracking_number}</p>` : ''}
                        </div>
                    </div>
                    
                    ${order.items && order.items.length > 0 ? `
                        <hr>
                        <h6>Order Items</h6>
                        <div class="order-items">
                            ${order.items.map(item => renderOrderItem(item)).join('')}
                        </div>
                    ` : ''}
                    
                    ${order.shipping_address ? `
                        <hr>
                        <h6>Shipping Address</h6>
                        <p class="mb-0">${order.shipping_address}</p>
                    ` : ''}
                    
                    ${order.notes ? `
                        <hr>
                        <h6>Notes</h6>
                        <p class="mb-0">${order.notes}</p>
                    ` : ''}
                </div>
                <div class="card-footer d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <button type="button" class="btn btn-outline-primary btn-sm" onclick="viewOrderDetails(${order.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        ${canUpdateStatus ? `
                            <button type="button" class="btn btn-outline-warning btn-sm" onclick="updateOrderStatus(${order.id})">
                                <i class="fas fa-edit"></i> Update Status
                            </button>
                        ` : ''}
                        ${canCancel ? `
                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="cancelOrder(${order.id})" 
                                    ${order.status === 'delivered' || order.status === 'cancelled' ? 'disabled' : ''}>
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : ''}
                    </div>
                    <small class="text-muted">
                        Last updated: ${Utils.formatTimeAgo(order.updated_at)}
                    </small>
                </div>
            </div>
        </div>
    `;
}

function renderOrderItem(item) {
    return `
        <div class="order-item">
            <div class="d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.product_name}</h6>
                    <small class="text-muted">${item.category} • by ${item.wholesaler_name}</small>
                </div>
                <div class="text-end">
                    <div class="fw-bold">$${item.subtotal}</div>
                    <small class="text-muted">${item.quantity} × $${item.price}</small>
                </div>
            </div>
        </div>
    `;
}

function getOrderStatusClass(status) {
    const classes = {
        'pending': 'warning',
        'confirmed': 'info',
        'processing': 'primary',
        'shipped': 'secondary',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return classes[status] || 'secondary';
}

function filterOrders() {
    // Update filters from form inputs
    OrdersState.filters = {
        status: document.getElementById('order-status-filter')?.value || '',
        search: document.getElementById('order-search')?.value || ''
    };

    // Reset to page 1 and reload
    loadOrders(1);
}

function refreshOrders() {
    loadOrders(OrdersState.currentPage);
}

// Order actions
function viewOrderDetails(orderId) {
    // This would show a detailed order modal
    showToast('Order details modal coming soon!', 'info');
}

async function updateOrderStatus(orderId) {
    // Get current order
    const order = OrdersState.orders.find(o => o.id === orderId);
    if (!order) return;

    // Show status update modal/prompt
    const newStatus = prompt(`Current status: ${order.status}\n\nEnter new status (confirmed, processing, shipped, delivered):`, order.status);
    if (!newStatus || newStatus === order.status) return;

    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(newStatus.toLowerCase())) {
        showToast('Invalid status. Valid statuses are: confirmed, processing, shipped, delivered', 'warning');
        return;
    }

    try {
        const updateData = { status: newStatus.toLowerCase() };

        // If shipping, ask for tracking number
        if (newStatus.toLowerCase() === 'shipped') {
            const trackingNumber = prompt('Enter tracking number (optional):');
            if (trackingNumber) {
                updateData.tracking_number = trackingNumber;
            }
        }

        const response = await Utils.HttpClient.put(`/orders/${orderId}/status`, updateData);

        if (response.success) {
            showToast('Order status updated successfully!', 'success');
            refreshOrders();
        }
    } catch (error) {
        showToast(error.message || 'Failed to update order status', 'danger');
    }
}

async function cancelOrder(orderId) {
    const order = OrdersState.orders.find(o => o.id === orderId);
    if (!order) return;

    if (!confirm(`Are you sure you want to cancel order #${order.order_number}?`)) return;

    try {
        const response = await Utils.HttpClient.delete(`/orders/${orderId}`);

        if (response.success) {
            showToast('Order cancelled successfully!', 'success');
            refreshOrders();
        }
    } catch (error) {
        showToast(error.message || 'Failed to cancel order', 'danger');
    }
}

function createNewOrder() {
    // This would show a create order modal
    showToast('Create order functionality coming soon!', 'info');
}

function showOrdersError() {
    const ordersListContainer = document.getElementById('orders-list');
    ordersListContainer.innerHTML = `
        <div class="alert alert-danger text-center">
            <h5><i class="fas fa-exclamation-triangle"></i> Error Loading Orders</h5>
            <p>Unable to load orders. Please try refreshing the page.</p>
            <button type="button" class="btn btn-outline-danger" onclick="refreshOrders()">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

// Export orders functions
window.Orders = {
    loadOrders,
    filterOrders,
    refreshOrders,
    viewOrderDetails,
    updateOrderStatus,
    cancelOrder,
    createNewOrder
};

// Global function exports for onclick handlers
window.loadOrders = loadOrders;
window.filterOrders = filterOrders;
window.refreshOrders = refreshOrders;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.cancelOrder = cancelOrder;
window.createNewOrder = createNewOrder;