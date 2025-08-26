/* Utility functions for the Order Management System */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api'
    : '/api';

// Global state
const AppState = {
    user: null,
    token: localStorage.getItem('token'),
    notifications: [],
    currentPage: 'login'
};

// HTTP Client with token management
class HttpClient {
    static async request(url, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (AppState.token) {
            config.headers['Authorization'] = `Bearer ${AppState.token}`;
        }

        try {
            showLoading();
            const response = await fetch(`${API_BASE_URL}${url}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('HTTP Request failed:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    static async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const urlWithParams = queryString ? `${url}?${queryString}` : url;
        return this.request(urlWithParams);
    }

    static async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }

    static async upload(url, formData) {
        const config = {
            method: 'POST',
            body: formData,
            headers: {}
        };

        if (AppState.token) {
            config.headers['Authorization'] = `Bearer ${AppState.token}`;
        }

        try {
            showLoading();
            const response = await fetch(`${API_BASE_URL}${url}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }
}

// Toast notifications
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toast-container');
    const toastId = `toast-${Date.now()}`;
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${getToastIcon(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: duration });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle',
        'primary': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Loading overlay
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Page navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show target page
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.style.display = 'block';
        targetPage.classList.add('fade-in');
        AppState.currentPage = pageName;
        
        // Update URL without triggering navigation
        if (window.history && window.history.pushState) {
            window.history.pushState({ page: pageName }, '', `#${pageName}`);
        }
        
        // Load page-specific data
        loadPageData(pageName);
    }
}

function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'samples':
            loadSamples();
            break;
    }
}

// Form utilities
function getFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

function resetForm(formId) {
    document.getElementById(formId).reset();
}

function setFormData(formId, data) {
    const form = document.getElementById(formId);
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"], #${key}`);
        if (input) {
            input.value = data[key] || '';
        }
    });
}

// Date formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(dateString);
}

// Currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Text truncation
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// File utilities
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isImageFile(file) {
    return file.type.startsWith('image/');
}

function createImagePreview(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// Validation utilities
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function validatePassword(password) {
    return password.length >= 8 && 
           /[a-z]/.test(password) && 
           /[A-Z]/.test(password) && 
           /\d/.test(password);
}

// Pagination utilities
function createPagination(pagination, onPageChange) {
    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
    
    let paginationHtml = '<nav><ul class="pagination justify-content-center">';
    
    // Previous button
    paginationHtml += `
        <li class="page-item ${!hasPrevPage ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="${onPageChange}(${currentPage - 1})" ${!hasPrevPage ? 'tabindex="-1"' : ''}>
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHtml += `<li class="page-item"><a class="page-link" href="#" onclick="${onPageChange}(1)">1</a></li>`;
        if (startPage > 2) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="${onPageChange}(${i})">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHtml += `<li class="page-item"><a class="page-link" href="#" onclick="${onPageChange}(${totalPages})">${totalPages}</a></li>`;
    }
    
    // Next button
    paginationHtml += `
        <li class="page-item ${!hasNextPage ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="${onPageChange}(${currentPage + 1})" ${!hasNextPage ? 'tabindex="-1"' : ''}>
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationHtml += '</ul></nav>';
    
    return paginationHtml;
}

// Debounce function for search
function debounce(func, wait) {
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

// Local storage utilities
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to read from localStorage:', error);
        return null;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
    }
}

// Initialize utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            showPage(event.state.page);
        }
    });
    
    // Add scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollButton.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(scrollButton);
    
    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollButton.classList.add('show');
        } else {
            scrollButton.classList.remove('show');
        }
    });
});

// Export for use in other files
window.Utils = {
    HttpClient,
    showToast,
    showLoading,
    hideLoading,
    showPage,
    loadPageData,
    getFormData,
    resetForm,
    setFormData,
    formatDate,
    formatDateTime,
    formatTimeAgo,
    formatCurrency,
    truncateText,
    formatFileSize,
    isImageFile,
    createImagePreview,
    validateEmail,
    validatePhone,
    validatePassword,
    createPagination,
    debounce,
    saveToStorage,
    getFromStorage,
    removeFromStorage
};