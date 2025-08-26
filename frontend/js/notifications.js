/* Notifications management functionality */

// Notifications state
const NotificationsState = {
    notifications: [],
    currentPage: 1,
    unreadCount: 0,
    filters: {
        type: '',
        is_read: ''
    }
};

// Initialize notifications module
document.addEventListener('DOMContentLoaded', function() {
    setupNotificationsEventListeners();
});

function setupNotificationsEventListeners() {
    // Setup notification polling if user is authenticated
    if (AppState.token) {
        startNotificationPolling();
    }
}

// Load notifications
async function loadNotifications(page = 1) {
    if (!AppState.token) return;

    try {
        // Prepare query parameters
        const params = {
            page,
            limit: 20,
            ...NotificationsState.filters
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });

        const response = await Utils.HttpClient.get('/notifications', params);
        
        if (response.success) {
            NotificationsState.notifications = response.data.notifications;
            NotificationsState.unreadCount = response.data.unread_count;
            NotificationsState.currentPage = page;
            
            updateNotificationCount(response.data.unread_count);
            updateNotificationDropdown(response.data.notifications.slice(0, 5));
            
            return response.data;
        }
    } catch (error) {
        console.error('Failed to load notifications:', error);
        return null;
    }
}

// Get notification counts
async function loadNotificationCounts() {
    if (!AppState.token) return;

    try {
        const response = await Utils.HttpClient.get('/notifications/counts');
        
        if (response.success) {
            updateNotificationCount(response.data.overall.unread);
            return response.data;
        }
    } catch (error) {
        console.error('Failed to load notification counts:', error);
        return null;
    }
}

// Update notification count badge
function updateNotificationCount(count) {
    const badge = document.getElementById('notification-count');
    if (badge) {
        NotificationsState.unreadCount = count;
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Update notification dropdown
function updateNotificationDropdown(notifications) {
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) return;
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<li><span class="dropdown-item-text text-muted">No new notifications</span></li>';
        return;
    }

    const notificationItems = notifications.map(notification => `
        <li>
            <div class="dropdown-item notification-item ${!notification.is_read ? 'unread' : ''}" 
                 onclick="handleNotificationClick(${notification.id})">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${Utils.truncateText(notification.message, 60)}</div>
                <div class="notification-time">${Utils.formatTimeAgo(notification.created_at)}</div>
            </div>
        </li>
    `).join('');

    notificationList.innerHTML = notificationItems;
}

// Handle notification click
async function handleNotificationClick(notificationId) {
    try {
        // Mark as read if unread
        const notification = NotificationsState.notifications.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
            await markNotificationAsRead(notificationId);
        }

        // Navigate to related page if applicable
        if (notification) {
            navigateToRelatedPage(notification);
        }
    } catch (error) {
        console.error('Failed to handle notification click:', error);
    }
}

// Navigate to related page based on notification
function navigateToRelatedPage(notification) {
    switch (notification.type) {
        case 'product_upload':
        case 'product_approved':
        case 'product_rejected':
        case 'product_update':
            showPage('products');
            break;
            
        case 'sample_upload':
        case 'sample_approved':
        case 'sample_rejected':
        case 'sample_update':
            showPage('samples');
            break;
            
        case 'new_order':
        case 'order_status':
        case 'order_cancelled':
            showPage('orders');
            break;
            
        default:
            // Stay on current page
            break;
    }
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    try {
        const response = await Utils.HttpClient.put(`/notifications/${notificationId}/read`);
        
        if (response.success) {
            // Update local state
            const notification = NotificationsState.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.is_read = true;
            }
            
            // Update unread count
            NotificationsState.unreadCount = Math.max(0, NotificationsState.unreadCount - 1);
            updateNotificationCount(NotificationsState.unreadCount);
            
            return true;
        }
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return false;
    }
}

// Mark all notifications as read
async function markAllNotificationsAsRead(type = null) {
    try {
        const requestBody = type ? { type } : {};
        const response = await Utils.HttpClient.put('/notifications/read-all', requestBody);
        
        if (response.success) {
            // Update local state
            NotificationsState.notifications.forEach(notification => {
                if (!type || notification.type === type) {
                    notification.is_read = true;
                }
            });
            
            // Update unread count
            if (!type) {
                NotificationsState.unreadCount = 0;
            } else {
                NotificationsState.unreadCount = NotificationsState.notifications.filter(
                    n => !n.is_read
                ).length;
            }
            
            updateNotificationCount(NotificationsState.unreadCount);
            updateNotificationDropdown(NotificationsState.notifications.slice(0, 5));
            
            showToast(`${response.data.updated_count} notifications marked as read`, 'success');
            return true;
        }
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        showToast('Failed to mark notifications as read', 'danger');
        return false;
    }
}

// Delete notification
async function deleteNotification(notificationId) {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
        const response = await Utils.HttpClient.delete(`/notifications/${notificationId}`);
        
        if (response.success) {
            // Remove from local state
            NotificationsState.notifications = NotificationsState.notifications.filter(
                n => n.id !== notificationId
            );
            
            // Update UI
            updateNotificationDropdown(NotificationsState.notifications.slice(0, 5));
            showToast('Notification deleted', 'success');
            
            return true;
        }
    } catch (error) {
        console.error('Failed to delete notification:', error);
        showToast('Failed to delete notification', 'danger');
        return false;
    }
}

// Show notification toast
function showNotificationToast(notification) {
    const type = getNotificationToastType(notification.type);
    const message = `${notification.title}: ${Utils.truncateText(notification.message, 100)}`;
    
    showToast(message, type, 8000);
}

function getNotificationToastType(notificationType) {
    if (notificationType.includes('error') || notificationType.includes('reject') || notificationType.includes('cancel')) {
        return 'danger';
    } else if (notificationType.includes('success') || notificationType.includes('approve') || notificationType.includes('deliver')) {
        return 'success';
    } else if (notificationType.includes('warning') || notificationType.includes('pending')) {
        return 'warning';
    } else {
        return 'info';
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
                
                // Update dropdown with recent notifications
                updateNotificationDropdown(response.data.notifications.slice(0, 5));
            }
        }
    } catch (error) {
        // Silently fail for polling to avoid spam
        console.debug('Notification polling failed:', error.message);
    }
}

// Show notifications page
function showNotifications() {
    // This would show a full notifications page
    // For now, we'll show a modal with notifications
    showNotificationsModal();
}

function showNotificationsModal() {
    // Create a simple notifications modal
    const modalHtml = `
        <div class="modal fade" id="notificationsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-bell"></i> Notifications
                            ${NotificationsState.unreadCount > 0 ? `<span class="badge bg-primary ms-2">${NotificationsState.unreadCount}</span>` : ''}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="btn-group btn-group-sm">
                                <button type="button" class="btn btn-outline-primary" onclick="loadNotifications(1)">
                                    <i class="fas fa-refresh"></i> Refresh
                                </button>
                                <button type="button" class="btn btn-outline-success" onclick="markAllNotificationsAsRead()">
                                    <i class="fas fa-check-double"></i> Mark All Read
                                </button>
                            </div>
                        </div>
                        <div id="notifications-modal-content">
                            <div class="text-center py-3">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
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

    // Load notifications
    loadNotificationsForModal();
}

async function loadNotificationsForModal() {
    const content = document.getElementById('notifications-modal-content');
    if (!content) return;

    try {
        const data = await loadNotifications(1);
        if (data && data.notifications) {
            renderNotificationsInModal(data.notifications);
        }
    } catch (error) {
        content.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                Failed to load notifications
            </div>
        `;
    }
}

function renderNotificationsInModal(notifications) {
    const content = document.getElementById('notifications-modal-content');
    if (!content) return;

    if (notifications.length === 0) {
        content.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="fas fa-bell-slash fa-3x mb-3"></i>
                <h6>No notifications</h6>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }

    const notificationsHtml = notifications.map(notification => `
        <div class="notification-item ${!notification.is_read ? 'unread' : ''} border-bottom py-3"
             onclick="handleNotificationClick(${notification.id})">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="notification-title mb-1">${notification.title}</h6>
                    <p class="notification-message mb-2">${notification.message}</p>
                    <small class="notification-time text-muted">${Utils.formatTimeAgo(notification.created_at)}</small>
                </div>
                <div class="ms-3">
                    ${!notification.is_read ? '<i class="fas fa-circle text-primary" style="font-size: 0.5rem;"></i>' : ''}
                    <button type="button" class="btn btn-sm btn-outline-danger ms-2" 
                            onclick="event.stopPropagation(); deleteNotification(${notification.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    content.innerHTML = notificationsHtml;
}

// Export notifications functions
window.Notifications = {
    loadNotifications,
    loadNotificationCounts,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    showNotifications,
    startNotificationPolling,
    stopNotificationPolling,
    pollNotifications
};

// Global function exports for onclick handlers
window.handleNotificationClick = handleNotificationClick;
window.markNotificationAsRead = markNotificationAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.deleteNotification = deleteNotification;
window.showNotifications = showNotifications;