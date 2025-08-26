// Authentication Manager
class AuthenticationManager {
    constructor() {
        this.users = this.initializeDemoUsers();
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredSession();
    }

    initializeDemoUsers() {
        // Demo users for testing
        return {
            admin: {
                email: 'admin@ordermanage.com',
                password: 'admin123',
                name: 'System Administrator',
                role: 'admin',
                avatar: 'assets/images/avatars/admin.jpg',
                permissions: ['manage_users', 'view_analytics', 'approve_products', 'system_settings'],
                lastLogin: null
            },
            wholesaler1: {
                email: 'john@wholesale.com',
                password: 'wholesale123',
                name: 'John Wholesaler',
                role: 'wholesaler',
                avatar: 'assets/images/avatars/wholesaler1.jpg',
                company: 'Premium Goods Co.',
                permissions: ['manage_products', 'view_orders', 'manage_inventory'],
                lastLogin: null
            },
            wholesaler2: {
                email: 'sarah@suppliers.com',
                password: 'wholesale123',
                name: 'Sarah Supplier',
                role: 'wholesaler',
                avatar: 'assets/images/avatars/wholesaler2.jpg',
                company: 'Quality Supplies Inc.',
                permissions: ['manage_products', 'view_orders', 'manage_inventory'],
                lastLogin: null
            },
            retailer1: {
                email: 'jane@retail.com',
                password: 'retail123',
                name: 'Jane Retailer',
                role: 'retailer',
                avatar: 'assets/images/avatars/retailer1.jpg',
                company: 'Best Buy Store',
                permissions: ['place_orders', 'view_products', 'manage_profile'],
                lastLogin: null
            },
            retailer2: {
                email: 'mike@shop.com',
                password: 'retail123',
                name: 'Mike Shop Owner',
                role: 'retailer',
                avatar: 'assets/images/avatars/retailer2.jpg',
                company: 'Mike\'s Electronics',
                permissions: ['place_orders', 'view_products', 'manage_profile'],
                lastLogin: null
            }
        };
    }

    setupEventListeners() {
        // Login form submission
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#loginForm')) {
                e.preventDefault();
                this.handleLogin(e.target);
            }
        });

        // Registration form submission
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#registerForm')) {
                e.preventDefault();
                this.handleRegistration(e.target);
            }
        });

        // Role selection in registration
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[name="role"]')) {
                this.updateRoleSelection(e.target.value);
            }
        });

        // Password strength checking
        document.addEventListener('input', (e) => {
            if (e.target.matches('#password')) {
                this.checkPasswordStrength(e.target.value);
            }
        });

        // Logout handling
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn, .logout-btn *')) {
                e.preventDefault();
                this.logout();
            }
        });

        // Demo login buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.demo-login')) {
                e.preventDefault();
                const role = e.target.dataset.role;
                const userId = e.target.dataset.userId;
                this.demoLogin(role, userId);
            }
        });
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember') === 'on';

        // Show loading state
        const submitBtn = form.querySelector('.auth-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Signing In...';
        submitBtn.disabled = true;

        try {
            // Simulate API call delay
            await this.delay(1500);

            const user = this.authenticateUser(email, password);
            
            if (user) {
                this.loginSuccess(user, remember);
            } else {
                this.loginError('Invalid email or password');
            }
        } catch (error) {
            this.loginError('Login failed. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    authenticateUser(email, password) {
        // Find user by email and verify password
        const user = Object.values(this.users).find(u => 
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            return { ...user };
        }

        return null;
    }

    loginSuccess(user, remember = false) {
        this.currentUser = user;
        
        // Store user session
        const sessionData = {
            ...user,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };
        
        if (remember) {
            localStorage.setItem('orderManageUser', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('orderManageUser', JSON.stringify(sessionData));
        }

        // Show success message
        if (window.app && window.app.showToast) {
            window.app.showToast('Login successful! Redirecting...', 'success');
        }

        // Redirect to appropriate dashboard
        setTimeout(() => {
            this.redirectToDashboard(user.role);
        }, 1000);
    }

    loginError(message) {
        // Show error message
        if (window.app && window.app.showToast) {
            window.app.showToast(message, 'error');
        }

        // Shake the form
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                authCard.style.animation = '';
            }, 500);
        }
    }

    async handleRegistration(form) {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            role: formData.get('role'),
            company: formData.get('company') || ''
        };

        // Validate form
        const validation = this.validateRegistration(userData);
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.auth-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating Account...';
        submitBtn.disabled = true;

        try {
            // Simulate API call delay
            await this.delay(2000);

            // Check if email already exists
            const existingUser = Object.values(this.users).find(u => 
                u.email.toLowerCase() === userData.email.toLowerCase()
            );

            if (existingUser) {
                throw new Error('Email already registered');
            }

            // Create new user
            const newUser = this.createUser(userData);
            
            // Auto-login the new user
            this.loginSuccess(newUser, false);

        } catch (error) {
            this.registrationError(error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateRegistration(userData) {
        const errors = [];

        // Name validation
        if (!userData.name || userData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userData.email || !emailRegex.test(userData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Password validation
        if (!userData.password || userData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        // Confirm password validation
        if (userData.password !== userData.confirmPassword) {
            errors.push('Passwords do not match');
        }

        // Role validation
        if (!userData.role) {
            errors.push('Please select a role');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    showValidationErrors(errors) {
        if (window.app && window.app.showToast) {
            errors.forEach(error => {
                window.app.showToast(error, 'error');
            });
        }
    }

    createUser(userData) {
        const userId = `${userData.role}${Date.now()}`;
        const newUser = {
            id: userId,
            email: userData.email,
            password: userData.password, // In real app, this would be hashed
            name: userData.name,
            role: userData.role,
            company: userData.company,
            avatar: `assets/images/avatars/default-${userData.role}.jpg`,
            permissions: this.getRolePermissions(userData.role),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        // Add to users collection
        this.users[userId] = newUser;

        return { ...newUser };
    }

    getRolePermissions(role) {
        const permissions = {
            admin: ['manage_users', 'view_analytics', 'approve_products', 'system_settings'],
            wholesaler: ['manage_products', 'view_orders', 'manage_inventory'],
            retailer: ['place_orders', 'view_products', 'manage_profile']
        };

        return permissions[role] || [];
    }

    registrationError(message) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, 'error');
        }
    }

    demoLogin(role, userId = null) {
        let user;
        
        if (userId && this.users[userId]) {
            user = this.users[userId];
        } else {
            // Find first user with the specified role
            user = Object.values(this.users).find(u => u.role === role);
        }

        if (user) {
            this.loginSuccess(user, false);
        } else {
            this.loginError('Demo user not found');
        }
    }

    loadStoredSession() {
        // Check for stored session
        let sessionData = localStorage.getItem('orderManageUser') || 
                         sessionStorage.getItem('orderManageUser');

        if (sessionData) {
            try {
                this.currentUser = JSON.parse(sessionData);
                
                // Validate session (check if not expired, etc.)
                if (this.isValidSession(this.currentUser)) {
                    // Auto-redirect if on login page
                    if (window.location.pathname.includes('login.html') || 
                        window.location.pathname.includes('register.html')) {
                        this.redirectToDashboard(this.currentUser.role);
                    }
                } else {
                    this.clearSession();
                }
            } catch (e) {
                console.error('Error parsing stored session:', e);
                this.clearSession();
            }
        }
    }

    isValidSession(user) {
        if (!user || !user.loginTime) return false;
        
        // Check if session is not older than 24 hours
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        return hoursDiff < 24;
    }

    clearSession() {
        localStorage.removeItem('orderManageUser');
        sessionStorage.removeItem('orderManageUser');
        this.currentUser = null;
    }

    logout() {
        this.clearSession();
        
        if (window.app && window.app.showToast) {
            window.app.showToast('Logged out successfully', 'success');
        }

        setTimeout(() => {
            window.location.href = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
        }, 1000);
    }

    redirectToDashboard(role) {
        const dashboards = {
            admin: 'admin-dashboard.html',
            wholesaler: 'wholesaler-dashboard.html',
            retailer: 'retailer-dashboard.html'
        };

        const dashboard = dashboards[role] || 'login.html';
        const basePath = window.location.pathname.includes('pages/') ? '' : 'pages/';
        
        window.location.href = basePath + dashboard;
    }

    updateRoleSelection(selectedRole) {
        // Update UI based on selected role
        const roleOptions = document.querySelectorAll('.role-option');
        roleOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.querySelector(`input[value="${selectedRole}"]`)) {
                option.classList.add('selected');
            }
        });

        // Show/hide company field for wholesaler and retailer
        const companyField = document.querySelector('#companyField');
        if (companyField) {
            if (selectedRole === 'wholesaler' || selectedRole === 'retailer') {
                companyField.style.display = 'block';
                companyField.querySelector('input').required = true;
            } else {
                companyField.style.display = 'none';
                companyField.querySelector('input').required = false;
            }
        }
    }

    checkPasswordStrength(password) {
        const strengthIndicator = document.querySelector('.password-strength');
        if (!strengthIndicator) return;

        const strength = this.calculatePasswordStrength(password);
        const strengthText = strengthIndicator.querySelector('.strength-text');
        
        // Remove existing classes
        strengthIndicator.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
        
        if (strength.score === 0) {
            strengthIndicator.style.display = 'none';
        } else {
            strengthIndicator.style.display = 'block';
            strengthIndicator.classList.add(`strength-${strength.level}`);
            strengthText.textContent = `Password strength: ${strength.level}`;
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let level = 'weak';

        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score >= 4) {
            level = 'strong';
        } else if (score >= 3) {
            level = 'medium';
        }

        return { score, level };
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API methods
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    hasPermission(permission) {
        return this.currentUser && 
               this.currentUser.permissions && 
               this.currentUser.permissions.includes(permission);
    }

    getUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }
}

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize authentication manager
const authManager = new AuthenticationManager();

// Export for other modules
window.AuthenticationManager = AuthenticationManager;
window.authManager = authManager;