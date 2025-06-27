// Authentication system
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.initDefaultAdmin();
        this.init();
    }

    initDefaultAdmin() {
        // Ensure default admin exists
        const adminExists = this.users.find(user => user.username === 'admin');
        if (!adminExists) {
            this.users.push({
                id: 1,
                username: 'admin',
                password: 'admin2020',
                role: 'admin',
                name: 'Site Yöneticisi',
                email: 'admin@e-horoz.com',
                status: 'approved'
            });
            localStorage.setItem('users', JSON.stringify(this.users));
        }
    }

    init() {
        this.initEventListeners();
        this.checkCurrentPage();
    }

    initEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Role selector
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectRole(e));
        });
    }

    checkCurrentPage() {
        // Redirect if already logged in
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
            const user = JSON.parse(currentUser);
            if (user.role === 'admin') {
                window.location.href = 'admin-panel.html';
            } else {
                window.location.href = '../index.html';
            }
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const user = this.users.find(u => u.username === username && u.password === password);
            
            if (!user) {
                this.showError('Kullanıcı adı veya şifre hatalı!');
                return;
            }

            if (user.status !== 'approved' && user.role !== 'admin') {
                this.showError('Hesabınız henüz onaylanmamış. Lütfen admin onayını bekleyin.');
                return;
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect based on role
            if (user.role === 'admin') {
                window.location.href = 'admin-panel.html';
            } else {
                window.location.href = '../index.html';
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Giriş sırasında bir hata oluştu!');
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = {
            id: Date.now(),
            name: formData.get('name'),
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: document.querySelector('.role-btn.active').dataset.role,
            status: 'pending',
            registrationDate: new Date().toISOString()
        };

        try {
            // Check if username already exists
            if (this.users.find(u => u.username === userData.username)) {
                this.showError('Bu kullanıcı adı zaten kullanılıyor!');
                return;
            }

            // Check if email already exists
            if (this.users.find(u => u.email === userData.email)) {
                this.showError('Bu e-posta adresi zaten kullanılıyor!');
                return;
            }

            // Business owner specific data
            if (userData.role === 'business') {
                userData.businessName = formData.get('businessName');
                
                // Handle file upload (proof of support)
                const supportProof = formData.get('supportProof');
                if (supportProof && supportProof.size > 0) {
                    // In a real application, you would upload this to a server
                    // For demo purposes, we'll just store the filename
                    userData.supportProof = supportProof.name;
                }

                if (!userData.businessName) {
                    this.showError('İşletme adı zorunludur!');
                    return;
                }
            }

            this.users.push(userData);
            localStorage.setItem('users', JSON.stringify(this.users));

            this.showSuccess('Kayıt başarılı! Admin onayından sonra giriş yapabilirsiniz.');
            
            // Clear form
            event.target.reset();
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            this.showError('Kayıt sırasında bir hata oluştu!');
        }
    }

    selectRole(event) {
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        const businessFields = document.getElementById('businessFields');
        if (businessFields) {
            if (event.target.dataset.role === 'business') {
                businessFields.style.display = 'block';
                businessFields.querySelectorAll('input').forEach(input => input.required = true);
            } else {
                businessFields.style.display = 'none';
                businessFields.querySelectorAll('input').forEach(input => input.required = false);
            }
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
            ${message}
        `;

        const form = document.querySelector('.auth-form');
        form.insertBefore(messageDiv, form.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }

    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let messages = [];

    if (password.length >= 8) {
        strength += 1;
    } else {
        messages.push('En az 8 karakter olmalı');
    }

    if (/[a-z]/.test(password)) {
        strength += 1;
    } else {
        messages.push('Küçük harf içermeli');
    }

    if (/[A-Z]/.test(password)) {
        strength += 1;
    } else {
        messages.push('Büyük harf içermeli');
    }

    if (/[0-9]/.test(password)) {
        strength += 1;
    } else {
        messages.push('Rakam içermeli');
    }

    return {
        strength: strength,
        messages: messages,
        isStrong: strength >= 3
    };
}

// Add password strength indicator
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        passwordInput.parentNode.appendChild(strengthIndicator);

        passwordInput.addEventListener('input', (e) => {
            const result = checkPasswordStrength(e.target.value);
            strengthIndicator.innerHTML = `
                <div class="strength-bar">
                    <div class="strength-fill" style="width: ${(result.strength / 4) * 100}%"></div>
                </div>
                <div class="strength-messages">
                    ${result.messages.map(msg => `<small>${msg}</small>`).join('')}
                </div>
            `;
        });
    }
});