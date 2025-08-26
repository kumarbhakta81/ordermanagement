/* Products management functionality */

// Products state
const ProductsState = {
    products: [],
    categories: [],
    currentPage: 1,
    filters: {
        category: '',
        search: '',
        min_price: '',
        max_price: '',
        status: ''
    }
};

// Initialize products module
document.addEventListener('DOMContentLoaded', function() {
    setupProductsEventListeners();
});

function setupProductsEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(filterProducts, 500));
    }

    // Filter inputs
    const categoryFilter = document.getElementById('product-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }

    const minPriceFilter = document.getElementById('product-min-price');
    if (minPriceFilter) {
        minPriceFilter.addEventListener('input', Utils.debounce(filterProducts, 1000));
    }

    const maxPriceFilter = document.getElementById('product-max-price');
    if (maxPriceFilter) {
        maxPriceFilter.addEventListener('input', Utils.debounce(filterProducts, 1000));
    }
}

// Load products
async function loadProducts(page = 1) {
    const productsListContainer = document.getElementById('products-list');
    
    // Show loading state
    productsListContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading products...</p>
        </div>
    `;

    try {
        // Load categories first if not loaded
        if (ProductsState.categories.length === 0) {
            await loadCategories();
        }

        // Prepare query parameters
        const params = {
            page,
            limit: 12,
            ...ProductsState.filters
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });

        const response = await Utils.HttpClient.get('/products', params);
        
        if (response.success) {
            ProductsState.products = response.data.products;
            ProductsState.currentPage = page;
            
            renderProducts(response.data.products, response.data.pagination);
            
            // Show add product button for wholesalers
            if (AppState.user && AppState.user.role === 'wholesaler') {
                document.getElementById('add-product-btn').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        showProductsError();
    }
}

async function loadCategories() {
    try {
        const response = await Utils.HttpClient.get('/products/categories');
        if (response.success) {
            ProductsState.categories = response.data;
            populateCategoryFilter();
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('product-category-filter');
    if (categoryFilter && ProductsState.categories.length > 0) {
        const options = ProductsState.categories.map(category => 
            `<option value="${category.name}">${category.name}</option>`
        ).join('');
        
        categoryFilter.innerHTML = `
            <option value="">All Categories</option>
            ${options}
        `;
    }
}

function renderProducts(products, pagination) {
    const productsListContainer = document.getElementById('products-list');
    
    if (products.length === 0) {
        productsListContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Products Found</h5>
                <p class="text-muted">Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }

    const productsHtml = `
        <div class="product-grid">
            ${products.map(product => renderProductCard(product)).join('')}
        </div>
        
        ${pagination.totalPages > 1 ? Utils.createPagination(pagination, 'loadProducts') : ''}
    `;

    productsListContainer.innerHTML = productsHtml;
}

function renderProductCard(product) {
    const statusBadge = getStatusBadge(product.status);
    const imageUrl = product.images && product.images.length > 0 
        ? `/uploads/${product.images[0]}` 
        : '/images/placeholder-product.jpg';
    
    const canEdit = AppState.user && 
        (AppState.user.role === 'admin' || 
         (AppState.user.role === 'wholesaler' && AppState.user.id === product.wholesaler_id));

    return `
        <div class="card product-card">
            <div class="product-image" style="background-image: url('${imageUrl}')">
                ${statusBadge}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h6 class="product-title">${product.name}</h6>
                <p class="product-description">${Utils.truncateText(product.description || '', 100)}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="product-price">$${product.price}</div>
                    <small class="text-muted">Stock: ${product.quantity || 0}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <small class="text-muted">by ${product.wholesaler_name}</small>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary" onclick="viewProduct(${product.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${canEdit ? `
                            <button type="button" class="btn btn-outline-warning" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${AppState.user.role === 'admin' && product.status === 'pending' ? `
                                <button type="button" class="btn btn-outline-success" onclick="approveProduct(${product.id})">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button type="button" class="btn btn-outline-danger" onclick="rejectProduct(${product.id})">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        ` : ''}
                        ${AppState.user && AppState.user.role === 'retailer' && product.status === 'approved' ? `
                            <button type="button" class="btn btn-primary" onclick="addToCart(${product.id})">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-warning product-status-badge">Pending</span>',
        'approved': '<span class="badge bg-success product-status-badge">Approved</span>',
        'rejected': '<span class="badge bg-danger product-status-badge">Rejected</span>'
    };
    return badges[status] || '';
}

function filterProducts() {
    // Update filters from form inputs
    ProductsState.filters = {
        category: document.getElementById('product-category-filter')?.value || '',
        search: document.getElementById('product-search')?.value || '',
        min_price: document.getElementById('product-min-price')?.value || '',
        max_price: document.getElementById('product-max-price')?.value || ''
    };

    // Reset to page 1 and reload
    loadProducts(1);
}

function refreshProducts() {
    loadProducts(ProductsState.currentPage);
}

// Product actions
function viewProduct(productId) {
    // This would show a product detail modal
    showToast('Product details modal coming soon!', 'info');
}

function editProduct(productId) {
    // This would show an edit product modal
    showToast('Edit product modal coming soon!', 'info');
}

async function approveProduct(productId) {
    if (!confirm('Are you sure you want to approve this product?')) return;

    try {
        const response = await Utils.HttpClient.put(`/products/${productId}/status`, {
            status: 'approved'
        });

        if (response.success) {
            showToast('Product approved successfully!', 'success');
            refreshProducts();
        }
    } catch (error) {
        showToast(error.message || 'Failed to approve product', 'danger');
    }
}

async function rejectProduct(productId) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
        const response = await Utils.HttpClient.put(`/products/${productId}/status`, {
            status: 'rejected',
            rejection_reason: reason
        });

        if (response.success) {
            showToast('Product rejected successfully!', 'success');
            refreshProducts();
        }
    } catch (error) {
        showToast(error.message || 'Failed to reject product', 'danger');
    }
}

function addToCart(productId) {
    // This would add the product to cart
    showToast('Add to cart functionality coming soon!', 'info');
}

function showAddProduct() {
    // This would show an add product modal
    showToast('Add product modal coming soon!', 'info');
}

function showProductsError() {
    const productsListContainer = document.getElementById('products-list');
    productsListContainer.innerHTML = `
        <div class="alert alert-danger text-center">
            <h5><i class="fas fa-exclamation-triangle"></i> Error Loading Products</h5>
            <p>Unable to load products. Please try refreshing the page.</p>
            <button type="button" class="btn btn-outline-danger" onclick="refreshProducts()">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

// Export products functions
window.Products = {
    loadProducts,
    filterProducts,
    refreshProducts,
    viewProduct,
    editProduct,
    approveProduct,
    rejectProduct,
    addToCart,
    showAddProduct
};

// Global function exports for onclick handlers
window.loadProducts = loadProducts;
window.filterProducts = filterProducts;
window.refreshProducts = refreshProducts;
window.viewProduct = viewProduct;
window.editProduct = editProduct;
window.approveProduct = approveProduct;
window.rejectProduct = rejectProduct;
window.addToCart = addToCart;
window.showAddProduct = showAddProduct;