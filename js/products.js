// Product Management System
class ProductManager {
    constructor() {
        this.products = this.initializeProducts();
        this.categories = ['Electronics', 'Clothing', 'Furniture', 'Books', 'Sports', 'Beauty', 'Home'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
    }

    initializeProducts() {
        return [
            {
                id: 1,
                name: 'Samsung Galaxy Smartphone',
                price: 899.00,
                category: 'Electronics',
                image: 'assets/images/products/smartphone.jpg',
                rating: 4.2,
                reviews: 156,
                stock: 25,
                description: 'Latest Samsung Galaxy smartphone with advanced features',
                wholesaler: 'TechSupply Co.',
                status: 'approved'
            },
            {
                id: 2,
                name: 'Wireless Headphones',
                price: 189.00,
                category: 'Electronics',
                image: 'assets/images/products/headphones.jpg',
                rating: 4.8,
                reviews: 89,
                stock: 50,
                description: 'Premium wireless headphones with noise cancellation',
                wholesaler: 'AudioTech Inc.',
                status: 'approved',
                isNew: true
            },
            {
                id: 3,
                name: 'Wireless Mouse',
                price: 45.00,
                originalPrice: 59.00,
                category: 'Electronics',
                image: 'assets/images/products/mouse.jpg',
                rating: 4.5,
                reviews: 234,
                stock: 75,
                description: 'Ergonomic wireless mouse with long battery life',
                wholesaler: 'PeripheralPlus',
                status: 'approved',
                onSale: true
            },
            {
                id: 4,
                name: 'Mechanical Keyboard',
                price: 159.00,
                category: 'Electronics',
                image: 'assets/images/products/keyboard.jpg',
                rating: 4.6,
                reviews: 112,
                stock: 30,
                description: 'RGB mechanical keyboard with tactile switches',
                wholesaler: 'KeyboardKing',
                status: 'approved'
            },
            {
                id: 5,
                name: 'Premium Office Chair',
                price: 299.00,
                category: 'Furniture',
                image: 'assets/images/products/chair.jpg',
                rating: 4.4,
                reviews: 67,
                stock: 15,
                description: 'Ergonomic office chair with lumbar support',
                wholesaler: 'FurniCorp Ltd.',
                status: 'pending'
            },
            {
                id: 6,
                name: 'Bluetooth Speaker',
                price: 79.00,
                category: 'Electronics',
                image: 'assets/images/products/speaker.jpg',
                rating: 4.3,
                reviews: 145,
                stock: 40,
                description: 'Portable Bluetooth speaker with excellent sound quality',
                wholesaler: 'SoundWave Co.',
                status: 'approved'
            }
        ];
    }

    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart, .add-to-cart *')) {
                e.preventDefault();
                const productId = this.getProductIdFromElement(e.target);
                this.addToCart(productId);
            }
        });

        // Add to wishlist buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-wishlist, .add-to-wishlist *')) {
                e.preventDefault();
                const productId = this.getProductIdFromElement(e.target);
                this.addToWishlist(productId);
            }
        });

        // Quick view buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quick-view, .quick-view *')) {
                e.preventDefault();
                const productId = this.getProductIdFromElement(e.target);
                this.showQuickView(productId);
            }
        });

        // Product search
        const searchInputs = document.querySelectorAll('input[placeholder*="Search"]');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        });

        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.matches('.category-filter')) {
                this.filterByCategory(e.target.dataset.category);
            }
        });
    }

    getProductIdFromElement(element) {
        // Try to find product ID from data attribute or closest product element
        const productElement = element.closest('[data-product-id]');
        if (productElement) {
            return parseInt(productElement.dataset.productId);
        }
        
        // Fallback: extract from product name or other attributes
        const productCard = element.closest('.product-card');
        if (productCard) {
            const nameElement = productCard.querySelector('.product-name');
            if (nameElement) {
                const product = this.products.find(p => p.name === nameElement.textContent.trim());
                return product ? product.id : null;
            }
        }
        
        return null;
    }

    loadProducts() {
        // Load products into catalog view
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            this.renderProductGrid(this.products.filter(p => p.status === 'approved'));
        }

        // Load featured products
        const featuredContainer = document.querySelector('.featured-products .row');
        if (featuredContainer) {
            const featuredProducts = this.products.filter(p => p.status === 'approved').slice(0, 6);
            this.renderFeaturedProducts(featuredProducts, featuredContainer);
        }
    }

    renderProductGrid(products) {
        const grid = document.querySelector('.product-grid');
        if (!grid) return;

        grid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    renderFeaturedProducts(products, container) {
        const existingCards = container.querySelectorAll('.col-md-6');
        existingCards.forEach((card, index) => {
            if (products[index]) {
                this.updateProductCard(card, products[index]);
            }
        });
    }

    updateProductCard(cardElement, product) {
        // Update existing product card with new product data
        cardElement.setAttribute('data-product-id', product.id);
        
        const image = cardElement.querySelector('.product-card-image');
        const name = cardElement.querySelector('.product-name');
        const price = cardElement.querySelector('.product-price');
        const rating = cardElement.querySelector('.product-rating');
        
        if (image) image.src = product.image;
        if (name) name.textContent = product.name;
        if (price) {
            if (product.onSale && product.originalPrice) {
                price.innerHTML = `
                    <span class="text-decoration-line-through text-muted">$${product.originalPrice.toFixed(2)}</span>
                    <span class="text-success ms-1">$${product.price.toFixed(2)}</span>
                `;
            } else {
                price.textContent = `$${product.price.toFixed(2)}`;
            }
        }
        
        if (rating) {
            const stars = this.generateStarRating(product.rating);
            rating.innerHTML = `${stars} <span class="ms-1">(${product.rating})</span>`;
        }

        // Add badges
        const imageContainer = cardElement.querySelector('.product-image-container');
        if (imageContainer) {
            // Remove existing badges
            const existingBadges = imageContainer.querySelectorAll('.product-badge');
            existingBadges.forEach(badge => badge.remove());
            
            // Add new badges
            if (product.isNew) {
                const badge = document.createElement('div');
                badge.className = 'product-badge';
                badge.textContent = 'New';
                imageContainer.appendChild(badge);
            }
            
            if (product.onSale) {
                const badge = document.createElement('div');
                badge.className = 'product-badge sale';
                badge.textContent = 'Sale';
                imageContainer.appendChild(badge);
            }
        }
    }

    createProductCard(product) {
        const stars = this.generateStarRating(product.rating);
        const priceDisplay = product.onSale && product.originalPrice 
            ? `<span class="text-decoration-line-through text-muted">$${product.originalPrice.toFixed(2)}</span>
               <span class="text-success ms-1">$${product.price.toFixed(2)}</span>`
            : `$${product.price.toFixed(2)}`;
        
        const badges = [];
        if (product.isNew) badges.push('<div class="product-badge">New</div>');
        if (product.onSale) badges.push('<div class="product-badge sale">Sale</div>');

        return `
            <div class="col-lg-4 col-md-6 mb-4" data-product-id="${product.id}">
                <div class="product-card">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="product-card-image" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiByeD0iMTIiIGZpbGw9IiNGOEY5RkEiLz4KPHA+PHBhdGggZD0iTTcwIDYwaDYwdjMwSDcwdi0zMHoiIGZpbGw9IiNERUUyRTYiLz4KPC9zdmc+'">
                        ${badges.join('')}
                        <div class="product-actions">
                            <button class="btn btn-sm btn-outline-light add-to-wishlist" title="Add to Wishlist">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-light quick-view" title="Quick View">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-card-body">
                        <h6 class="product-name">${product.name}</h6>
                        <p class="product-price">${priceDisplay}</p>
                        <div class="product-rating">
                            ${stars}
                            <span class="ms-1">(${product.rating})</span>
                        </div>
                        <button class="btn btn-primary btn-sm w-100 mt-2 add-to-cart">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="fas fa-star text-muted"></i>';
        }
        return stars;
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Get or initialize cart
        let cart = JSON.parse(localStorage.getItem('orderManageCart') || '[]');
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        // Save cart
        localStorage.setItem('orderManageCart', JSON.stringify(cart));
        
        // Update cart UI
        this.updateCartUI();
        
        // Show success message
        if (window.app && window.app.showToast) {
            window.app.showToast(`${product.name} added to cart!`, 'success');
        }
    }

    addToWishlist(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Get or initialize wishlist
        let wishlist = JSON.parse(localStorage.getItem('orderManageWishlist') || '[]');
        
        // Check if product already in wishlist
        if (wishlist.find(item => item.id === productId)) {
            if (window.app && window.app.showToast) {
                window.app.showToast(`${product.name} is already in your wishlist`, 'info');
            }
            return;
        }
        
        // Add to wishlist
        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            addedAt: new Date().toISOString()
        });
        
        // Save wishlist
        localStorage.setItem('orderManageWishlist', JSON.stringify(wishlist));
        
        // Update wishlist UI
        this.updateWishlistUI();
        
        // Show success message
        if (window.app && window.app.showToast) {
            window.app.showToast(`${product.name} added to wishlist!`, 'success');
        }
    }

    showQuickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Create and show quick view modal
        const modalHTML = this.createQuickViewModal(product);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('quickViewModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    createQuickViewModal(product) {
        const stars = this.generateStarRating(product.rating);
        const priceDisplay = product.onSale && product.originalPrice 
            ? `<span class="text-decoration-line-through text-muted fs-5">$${product.originalPrice.toFixed(2)}</span>
               <span class="text-success fs-4 fw-bold ms-2">$${product.price.toFixed(2)}</span>`
            : `<span class="fs-4 fw-bold text-primary">$${product.price.toFixed(2)}</span>`;

        return `
            <div class="modal fade" id="quickViewModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${product.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src="${product.image}" alt="${product.name}" class="img-fluid rounded" 
                                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiByeD0iMTIiIGZpbGw9IiNGOEY5RkEiLz4KPC9zdmc+'">
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <span class="badge bg-primary">${product.category}</span>
                                        ${product.onSale ? '<span class="badge bg-danger ms-1">Sale</span>' : ''}
                                        ${product.isNew ? '<span class="badge bg-success ms-1">New</span>' : ''}
                                    </div>
                                    <div class="mb-3">
                                        ${priceDisplay}
                                    </div>
                                    <div class="mb-3">
                                        ${stars}
                                        <span class="ms-2">${product.rating} (${product.reviews} reviews)</span>
                                    </div>
                                    <div class="mb-3">
                                        <p class="text-muted">${product.description}</p>
                                    </div>
                                    <div class="mb-3">
                                        <small class="text-muted">Sold by: <strong>${product.wholesaler}</strong></small>
                                    </div>
                                    <div class="mb-3">
                                        <span class="text-success">
                                            <i class="fas fa-check-circle"></i> ${product.stock} in stock
                                        </span>
                                    </div>
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                                            <i class="fas fa-cart-plus"></i> Add to Cart
                                        </button>
                                        <button class="btn btn-outline-danger add-to-wishlist" data-product-id="${product.id}">
                                            <i class="fas fa-heart"></i> Add to Wishlist
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartUI() {
        const cart = JSON.parse(localStorage.getItem('orderManageCart') || '[]');
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Update cart badge
        document.querySelectorAll('.notification-badge').forEach(badge => {
            if (badge.closest('.cart-dropdown')) {
                badge.textContent = cartCount;
                badge.style.display = cartCount > 0 ? 'block' : 'none';
            }
        });
        
        // Update cart dropdown
        const cartItems = document.querySelector('.cart-items');
        const cartTotalElement = document.querySelector('.cart-total');
        
        if (cartItems) {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8L3N2Zz4='">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
                    </div>
                </div>
            `).join('');
        }
        
        if (cartTotalElement) {
            cartTotalElement.innerHTML = `<strong>Total: $${cartTotal.toFixed(2)}</strong>`;
        }
    }

    updateWishlistUI() {
        const wishlist = JSON.parse(localStorage.getItem('orderManageWishlist') || '[]');
        
        // Update wishlist badge in sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.href.includes('#wishlist')) {
                let badge = link.querySelector('.badge');
                if (badge) {
                    badge.textContent = wishlist.length;
                }
            }
        });
    }

    searchProducts(query) {
        if (!query.trim()) {
            this.loadProducts();
            return;
        }
        
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderProductGrid(filteredProducts);
    }

    filterByCategory(category) {
        let filteredProducts;
        if (category === 'all') {
            filteredProducts = this.products.filter(p => p.status === 'approved');
        } else {
            filteredProducts = this.products.filter(p => 
                p.status === 'approved' && p.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        this.renderProductGrid(filteredProducts);
    }

    // Public API methods
    getCartItems() {
        return JSON.parse(localStorage.getItem('orderManageCart') || '[]');
    }

    getWishlistItems() {
        return JSON.parse(localStorage.getItem('orderManageWishlist') || '[]');
    }

    clearCart() {
        localStorage.removeItem('orderManageCart');
        this.updateCartUI();
    }

    removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('orderManageCart') || '[]');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('orderManageCart', JSON.stringify(cart));
        this.updateCartUI();
    }

    removeFromWishlist(productId) {
        let wishlist = JSON.parse(localStorage.getItem('orderManageWishlist') || '[]');
        wishlist = wishlist.filter(item => item.id !== productId);
        localStorage.setItem('orderManageWishlist', JSON.stringify(wishlist));
        this.updateWishlistUI();
    }
}

// Initialize product manager
document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
});

// Export for other modules
window.ProductManager = ProductManager;