// Main Application
class EHorozApp {
    constructor() {
        this.currentUser = null;
        this.businesses = [];
        this.donations = [];
        this.reviews = [];
        this.users = [];
        this.pendingUsers = [];
        this.currentCategory = 'all';
        this.selectedRating = 0;
        this.currentBusinessId = null;
        this.init();
    }

    init() {
        this.loadData();
        this.initEventListeners();
        this.renderBusinesses();
        this.renderDonations();
        this.updateCategoryCounts();
        this.checkAuthStatus();
    }

    loadData() {
        // Load data from localStorage
        this.businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
        this.donations = JSON.parse(localStorage.getItem('donations') || '[]');
        this.reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');

        // Initialize with sample data if empty
        if (this.businesses.length === 0) {
            this.initSampleData();
        }

        // Initialize admin user if not exists
        if (!this.users.find(u => u.username === 'admin')) {
            this.users.push({
                id: 1,
                username: 'admin',
                email: 'admin@e-horoz.com',
                password: 'admin2020',
                role: 'admin',
                firstName: 'Site',
                lastName: 'Yöneticisi',
                status: 'approved'
            });
            this.saveData();
        }
    }

    initSampleData() {
        const sampleBusinesses = [
            {
                id: 1,
                name: "Lezzet Durağı Restaurant",
                category: "restaurants",
                status: "approved",
                logo: "🍽️",
                photos: [
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
                    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400"
                ],
                phone: "+90 258 123 4567",
                address: "Pamukkale Mh. Denizli Merkez",
                website: "https://lezzetduragi.com",
                description: "Denizlispor'u destekleyen, geleneksel Türk mutfağının en lezzetli yemeklerini sunan aile restoranı.",
                socialMedia: {
                    facebook: "https://facebook.com/lezzetduragi",
                    instagram: "https://instagram.com/lezzetduragi"
                },
                ownerId: 2
            },
            {
                id: 2,
                name: "Moda Butik Denizli",
                category: "clothing",
                status: "approved",
                logo: "👕",
                photos: [
                    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
                    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400"
                ],
                phone: "+90 258 765 4321",
                address: "Sümer Mh. Denizli Merkez",
                website: "https://modabutik.com",
                description: "En son moda trendlerini takip eden, kaliteli giyim ürünleri sunan butik mağaza.",
                socialMedia: {
                    instagram: "https://instagram.com/modabutikdenizli"
                },
                ownerId: 3
            },
            {
                id: 3,
                name: "Eğlence Merkezi Denizli",
                category: "entertainment",
                status: "approved",
                logo: "🎮",
                photos: [
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
                    "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400"
                ],
                phone: "+90 258 555 0123",
                address: "Çamlaraltı Mh. Denizli Merkez",
                website: "https://eglencemerkezi.com",
                description: "Bowling, bilardo, video oyunları ve daha fazlası. Denizlispor maç günlerinde özel etkinlikler.",
                socialMedia: {
                    facebook: "https://facebook.com/eglencemerkezi",
                    instagram: "https://instagram.com/eglencemerkezi"
                },
                ownerId: 4
            }
        ];

        const sampleDonations = [
            { id: 1, name: "Ahmet Yılmaz", amount: 500, date: "2024-01-15", status: "approved" },
            { id: 2, name: "Mehmet Kaya", amount: 750, date: "2024-01-14", status: "approved" },
            { id: 3, name: "Fatma Aydın", amount: 300, date: "2024-01-13", status: "approved" },
            { id: 4, name: "Ali Çelik", amount: 1000, date: "2024-01-12", status: "approved" }
        ];

        const sampleReviews = [
            {
                id: 1,
                businessId: 1,
                userId: 2,
                userName: "Ahmet Yılmaz",
                rating: 5,
                text: "Harika bir restoran! Yemekler çok lezzetli ve personel çok ilgili.",
                date: "2024-01-15"
            },
            {
                id: 2,
                businessId: 1,
                userId: 3,
                userName: "Mehmet Kaya",
                rating: 4,
                text: "Güzel bir mekan, fiyatlar uygun. Denizlispor maçlarını burada izlemek keyifli.",
                date: "2024-01-14"
            }
        ];

        this.businesses = sampleBusinesses;
        this.donations = sampleDonations;
        this.reviews = sampleReviews;
        this.saveData();
    }

    saveData() {
        localStorage.setItem('businesses', JSON.stringify(this.businesses));
        localStorage.setItem('donations', JSON.stringify(this.donations));
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('pendingUsers', JSON.stringify(this.pendingUsers));
    }

    initEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchBusinesses(e.target.value);
        });

        // Form submissions
        this.initFormListeners();

        // Modal events
        this.initModalEvents();

        // Star rating
        this.initStarRating();
    }

    initFormListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // User register form
        const userRegisterForm = document.getElementById('userRegisterForm');
        if (userRegisterForm) {
            userRegisterForm.addEventListener('submit', (e) => this.handleUserRegister(e));
        }

        // Business register form
        const businessRegisterForm = document.getElementById('businessRegisterForm');
        if (businessRegisterForm) {
            businessRegisterForm.addEventListener('submit', (e) => this.handleBusinessRegister(e));
        }

        // Donation form
        const donationForm = document.getElementById('donationForm');
        if (donationForm) {
            donationForm.addEventListener('submit', (e) => this.handleDonation(e));
        }

        // Review form
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => this.handleReview(e));
        }

        // User settings form
        const userSettingsForm = document.getElementById('userSettingsForm');
        if (userSettingsForm) {
            userSettingsForm.addEventListener('submit', (e) => this.handleUserSettings(e));
        }
    }

    initModalEvents() {
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    initStarRating() {
        const stars = document.querySelectorAll('#starRating .star');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.selectedRating = index + 1;
                this.updateStarDisplay();
            });
            star.addEventListener('mouseover', () => {
                this.highlightStars(index + 1);
            });
        });

        const starRating = document.getElementById('starRating');
        if (starRating) {
            starRating.addEventListener('mouseleave', () => {
                this.updateStarDisplay();
            });
        }
    }

    updateStarDisplay() {
        const stars = document.querySelectorAll('#starRating .star');
        stars.forEach((star, index) => {
            if (index < this.selectedRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('#starRating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffd700';
            } else {
                star.style.color = '#666';
            }
        });
    }

    // Authentication
    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        const user = this.users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === password &&
            u.status === 'approved'
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateAuthUI();
            this.closeModal('loginModal');
            this.showToast('Giriş başarılı! Hoş geldiniz.', 'success');
            
            // Redirect admin to admin panel if needed
            if (user.role === 'admin') {
                setTimeout(() => {
                    window.location.href = 'pages/admin-panel.html';
                }, 1000);
            }
        } else {
            this.showToast('Kullanıcı adı/e-posta veya şifre hatalı!', 'error');
        }
    }

    handleUserRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        if (formData.get('password') !== formData.get('passwordConfirm')) {
            this.showToast('Şifreler eşleşmiyor!', 'error');
            return;
        }

        if (this.users.find(u => u.username === formData.get('username'))) {
            this.showToast('Bu kullanıcı adı zaten kullanılıyor!', 'error');
            return;
        }

        if (this.users.find(u => u.email === formData.get('email'))) {
            this.showToast('Bu e-posta adresi zaten kullanılıyor!', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            role: 'user',
            status: 'approved',
            registrationDate: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveData();
        this.closeModal('registerModal');
        this.showToast('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
        e.target.reset();
    }

    handleBusinessRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        if (formData.get('password') !== formData.get('passwordConfirm')) {
            this.showToast('Şifreler eşleşmiyor!', 'error');
            return;
        }

        if (this.users.find(u => u.username === formData.get('username'))) {
            this.showToast('Bu kullanıcı adı zaten kullanılıyor!', 'error');
            return;
        }

        if (this.users.find(u => u.email === formData.get('email'))) {
            this.showToast('Bu e-posta adresi zaten kullanılıyor!', 'error');
            return;
        }

        const supportProof = formData.get('supportProof');
        const newUser = {
            id: Date.now(),
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            businessName: formData.get('businessName'),
            role: 'business',
            status: 'pending',
            supportProof: supportProof ? supportProof.name : null,
            supportProofFile: supportProof,
            registrationDate: new Date().toISOString()
        };

        this.pendingUsers.push(newUser);
        this.saveData();
        this.closeModal('registerModal');
        this.showToast('İşletme kaydınız admin onayına gönderildi!', 'success');
        e.target.reset();
    }

    handleDonation(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const newDonation = {
            id: Date.now(),
            email: formData.get('email'),
            amount: parseInt(formData.get('amount')),
            message: formData.get('message'),
            paymentProof: formData.get('paymentProof').name,
            status: 'pending',
            date: new Date().toISOString()
        };

        this.donations.push(newDonation);
        this.saveData();
        this.closeModal('donationModal');
        this.showToast('Bağışınız admin onayına gönderildi!', 'success');
        e.target.reset();
    }

    handleReview(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showToast('Yorum yapmak için giriş yapmalısınız!', 'error');
            return;
        }

        if (this.selectedRating === 0) {
            this.showToast('Lütfen bir puan verin!', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const newReview = {
            id: Date.now(),
            businessId: this.currentBusinessId,
            userId: this.currentUser.id,
            userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            rating: this.selectedRating,
            text: formData.get('reviewText'),
            date: new Date().toISOString()
        };

        this.reviews.push(newReview);
        this.saveData();
        this.renderBusinessReviews(this.currentBusinessId);
        this.showToast('Yorumunuz başarıyla eklendi!', 'success');
        e.target.reset();
        this.selectedRating = 0;
        this.updateStarDisplay();
    }

    handleUserSettings(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showToast('Giriş yapmalısınız!', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        
        if (this.currentUser.password !== currentPassword) {
            this.showToast('Mevcut şifre hatalı!', 'error');
            return;
        }

        const changes = [];
        let needsApproval = false;

        // Check for changes that need approval
        const newUsername = formData.get('newUsername');
        const newEmail = formData.get('newEmail');
        const newPassword = formData.get('newPassword');
        const newPasswordConfirm = formData.get('newPasswordConfirm');

        if (newPassword && newPassword !== newPasswordConfirm) {
            this.showToast('Yeni şifreler eşleşmiyor!', 'error');
            return;
        }

        const pendingChanges = {
            userId: this.currentUser.id,
            changes: {},
            requestDate: new Date().toISOString(),
            status: 'pending'
        };

        if (newUsername && newUsername !== this.currentUser.username) {
            if (this.users.find(u => u.username === newUsername && u.id !== this.currentUser.id)) {
                this.showToast('Bu kullanıcı adı zaten kullanılıyor!', 'error');
                return;
            }
            pendingChanges.changes.username = newUsername;
            changes.push('Kullanıcı adı');
            needsApproval = true;
        }

        if (newEmail && newEmail !== this.currentUser.email) {
            if (this.users.find(u => u.email === newEmail && u.id !== this.currentUser.id)) {
                this.showToast('Bu e-posta adresi zaten kullanılıyor!', 'error');
                return;
            }
            pendingChanges.changes.email = newEmail;
            changes.push('E-posta');
            needsApproval = true;
        }

        if (newPassword) {
            pendingChanges.changes.password = newPassword;
            changes.push('Şifre');
            needsApproval = true;
        }

        if (needsApproval) {
            let pendingChangesArray = JSON.parse(localStorage.getItem('pendingChanges') || '[]');
            pendingChangesArray.push(pendingChanges);
            localStorage.setItem('pendingChanges', JSON.stringify(pendingChangesArray));
            
            this.closeModal('userSettingsModal');
            this.showToast(`${changes.join(', ')} değişiklik talebiniz admin onayına gönderildi!`, 'success');
        } else {
            this.showToast('Herhangi bir değişiklik yapılmadı.', 'warning');
        }

        e.target.reset();
    }

    // Business operations
    openBusinessDetail(businessId) {
        const business = this.businesses.find(b => b.id === businessId);
        if (!business) return;

        this.currentBusinessId = businessId;
        
        // Set business details
        document.getElementById('detailModalTitle').innerHTML = `<i class="fas fa-store"></i> ${business.name}`;
        document.getElementById('detailLogo').textContent = business.logo;
        document.getElementById('detailName').textContent = business.name;
        document.getElementById('detailDescription').textContent = business.description;
        document.getElementById('detailPhone').href = `tel:${business.phone}`;
        document.getElementById('detailPhone').textContent = business.phone;
        document.getElementById('detailAddress').textContent = business.address;
        
        if (business.website) {
            document.getElementById('detailWebsite').href = business.website;
            document.getElementById('detailWebsite').style.display = 'inline';
        } else {
            document.getElementById('detailWebsite').style.display = 'none';
        }

        // Set rating
        const avgRating = this.calculateAver
