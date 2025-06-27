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

        // Initialize default IBAN if not exists
        if (!localStorage.getItem('bankSettings')) {
            const defaultBankSettings = {
                iban: 'TR32 0006 4000 0011 2345 6789 01',
                bankName: 'Türkiye İş Bankası',
                accountHolder: 'E-Horoz Denizlispor Destek Fonu'
            };
            localStorage.setItem('bankSettings', JSON.stringify(defaultBankSettings));
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
                    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
                    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
                ],
                phone: "+90 258 123 4567",
                address: "Pamukkale Mh. Denizli Merkez",
                website: "https://lezzetduragi.com",
                description: "Denizlispor'u destekleyen, geleneksel Türk mutfağının en lezzetli yemeklerini sunan aile restoranı. 25 yıllık deneyimimizle sizlere hizmet veriyoruz.",
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
                    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400",
                    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400"
                ],
                phone: "+90 258 765 4321",
                address: "Sümer Mh. Denizli Merkez",
                website: "https://modabutik.com",
                description: "En son moda trendlerini takip eden, kaliteli giyim ürünleri sunan butik mağaza. Denizlispor taraftarlarına özel indirimler ve kampanyalar.",
                socialMedia: {
                    instagram: "https://instagram.com/modabutikdenizli",
                    facebook: "https://facebook.com/modabutikdenizli"
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
                    "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400",
                    "https://images.unsplash.com/photo-1594736797933-d0da6ac0a5c4?w=400"
                ],
                phone: "+90 258 555 0123",
                address: "Çamlaraltı Mh. Denizli Merkez",
                website: "https://eglencemerkezi.com",
                description: "Bowling, bilardo, video oyunları ve daha fazlası. Denizlispor maç günlerinde özel etkinlikler ve turnuvalar düzenliyoruz.",
                socialMedia: {
                    facebook: "https://facebook.com/eglencemerkezi",
                    instagram: "https://instagram.com/eglencemerkezi"
                },
                ownerId: 4
            },
            {
                id: 4,
                name: "Spor Giyim Mağazası",
                category: "clothing",
                status: "approved",
                logo: "⚽",
                photos: [
                    "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400",
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
                ],
                phone: "+90 258 333 7890",
                address: "Servergazi Mh. Denizli Merkez",
                website: "https://sporgiyim.com",
                description: "Denizlispor forma ve taraftar ürünleri, spor giyim ve ayakkabı çeşitleri. Takımımızın resmi ürün satış noktası.",
                socialMedia: {
                    instagram: "https://instagram.com/sporgiyimdenizli"
                },
                ownerId: 5
            },
            {
                id: 5,
                name: "Café Sahil",
                category: "restaurants",
                status: "approved",
                logo: "☕",
                photos: [
                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
                    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400"
                ],
                phone: "+90 258 444 5678",
                address: "Kayhan Mh. Denizli Merkez",
                website: "https://cafesahil.com",
                description: "Denizlispor maçlarını izleyebileceğiniz, kaliteli kahve ve lezzetli atıştırmalıklar sunan modern café.",
                socialMedia: {
                    instagram: "https://instagram.com/cafesahil",
                    facebook: "https://facebook.com/cafesahil"
                },
                ownerId: 6
            },
            {
                id: 6,
                name: "Oyun Salonu",
                category: "entertainment",
                status: "approved",
                logo: "🕹️",
                photos: [
                    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
                    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
                ],
                phone: "+90 258 777 1234",
                address: "Yenişehir Mh. Denizli Merkez",
                website: "https://oyunsalonu.com",
                description: "PlayStation, Xbox, PC oyunları ve internet café hizmetleri. Denizlispor taraftarlarına özel indirimli saatler.",
                socialMedia: {
                    instagram: "https://instagram.com/oyunsalonu"
                },
                ownerId: 7
            }
        ];

        const sampleDonations = [
            { id: 1, name: "Ahmet Yılmaz", email: "ahmet@email.com", amount: 500, date: "2024-01-15", status: "approved", message: "Denizlispor'a güç!" },
            { id: 2, name: "Mehmet Kaya", email: "mehmet@email.com", amount: 750, date: "2024-01-14", status: "approved", message: "Yeşil siyah aşkına" },
            { id: 3, name: "Fatma Aydın", email: "fatma@email.com", amount: 300, date: "2024-01-13", status: "approved", message: "Takımımıza destek" },
            { id: 4, name: "Ali Çelik", email: "ali@email.com", amount: 1000, date: "2024-01-12", status: "approved", message: "Denizlispor için" },
            { id: 5, name: "Zeynep Arslan", email: "zeynep@email.com", amount: 250, date: "2024-01-11", status: "approved", message: "Her zaman yanınızdayız" }
        ];

        const sampleReviews = [
            {
                id: 1,
                businessId: 1,
                userId: 2,
                userName: "Ahmet Yılmaz",
                rating: 5,
                text: "Harika bir restoran! Yemekler çok lezzetli ve personel çok ilgili. Denizlispor'u destekledikleri için de ayrıca teşekkürler.",
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
            },
            {
                id: 3,
                businessId: 2,
                userId: 4,
                userName: "Fatma Öztürk",
                rating: 5,
                text: "Kaliteli ürünler, güler yüzlü hizmet. İndirim kodları da çok işime yaradı!",
                date: "2024-01-13"
            },
            {
                id: 4,
                businessId: 3,
                userId: 5,
                userName: "Emre Şahin",
                rating: 5,
                text: "Arkadaşlarla vakit geçirmek için mükemmel bir yer. Bowling pistleri çok kaliteli.",
                date: "2024-01-12"
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

        // Load bank settings to donation modal
        this.loadBankSettings();
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

    loadBankSettings() {
        const bankSettings = JSON.parse(localStorage.getItem('bankSettings') || '{}');
        const ibanElement = document.getElementById('bankIban');
        if (ibanElement && bankSettings.iban) {
            ibanElement.textContent = bankSettings.iban;
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

        if (this.users.find(u => u.username === formData.get('username')) || 
            this.pendingUsers.find(u => u.username === formData.get('username'))) {
            this.showToast('Bu kullanıcı adı zaten kullanılıyor!', 'error');
            return;
        }

        if (this.users.find(u => u.email === formData.get('email')) || 
            this.pendingUsers.find(u => u.email === formData.get('email'))) {
            this.showToast('Bu e-posta adresi zaten kullanılıyor!', 'error');
            return;
        }

        const supportProof = formData.get('supportProof');
        
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = (event) => {
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
                supportProof: supportProof.name,
                supportProofData: event.target.result,
                supportProofType: supportProof.type,
                registrationDate: new Date().toISOString()
            };

            this.pendingUsers.push(newUser);
            this.saveData();
            this.closeModal('registerModal');
            this.showToast('İşletme kaydınız admin onayına gönderildi!', 'success');
            e.target.reset();
        };
        
        reader.readAsDataURL(supportProof);
    }

    handleDonation(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const paymentProof = formData.get('paymentProof');
        
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = (event) => {
            const newDonation = {
                id: Date.now(),
                name: 'Anonim Bağışçı',
                email: formData.get('email'),
                amount: parseInt(formData.get('amount')),
                message: formData.get('message'),
                paymentProof: paymentProof.name,
                paymentProofData: event.target.result,
                paymentProofType: paymentProof.type,
                status: 'pending',
                date: new Date().toISOString()
            };

            this.donations.push(newDonation);
            this.saveData();
            this.closeModal('donationModal');
            this.showToast('Bağışınız admin onayına gönderildi!', 'success');
            e.target.reset();
        };
        
        reader.readAsDataURL(paymentProof);
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

        const newUsername = formData.get('newUsername');
        const newEmail = formData.get('newEmail');
        const newPassword = formData.get('newPassword');
        const newPasswordConfirm = formData.get('newPasswordConfirm');

        if (newPassword && newPassword !== newPasswordConfirm) {
            this.showToast('Yeni şifreler eşleşmiyor!', 'error');
            return;
        }

        const pendingChanges = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
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
            document.getElementById('detailWebsite').textContent = 'Web sitesini ziyaret et';
            document.getElementById('detailWebsite').style.display = 'inline';
        } else {
            document.getElementById('detailWebsite').style.display = 'none';
        }

        // Set rating
        const avgRating = this.calculateAverageRating(businessId);
        const reviewCount = this.getBusinessReviews(businessId).length;
        document.getElementById('detailStars').textContent = this.generateStars(avgRating);
        document.getElementById('detailRating').textContent = avgRating.toFixed(1);
        document.getElementById('detailReviewCount').textContent = `(${reviewCount} değerlendirme)`;

        // Show/hide review form based on login status
        const addReviewSection = document.getElementById('addReviewSection');
        if (this.currentUser) {
            addReviewSection.style.display = 'block';
        } else {
            addReviewSection.style.display = 'none';
        }

        // Load photos
        this.renderBusinessPhotos(business);
        
        // Load reviews
        this.renderBusinessReviews(businessId);
        
        // Reset tabs
        this.switchBusinessTab('info');
        
        // Reset discount box
        document.getElementById('discountBox').style.display = 'block';
        document.getElementById('discountRevealed').style.display = 'none';

        this.openModal('businessDetailModal');
    }

    renderBusinessPhotos(business) {
        const photoGallery = document.getElementById('photoGallery');
        const photos = business.photos || [];
        
        if (photos.length === 0) {
            photoGallery.innerHTML = '<p class="text-center">Henüz fotoğraf eklenmemiş.</p>';
            return;
        }

        photoGallery.innerHTML = photos.map((photo, index) => `
            <div class="photo-item" onclick="openPhotoModal('${photo}')">
                <img src="${photo}" alt="İşletme Fotoğrafı ${index + 1}" loading="lazy">
            </div>
        `).join('');
    }

    renderBusinessReviews(businessId) {
        const reviewsList = document.getElementById('reviewsList');
        const businessReviews = this.getBusinessReviews(businessId);
        
        if (businessReviews.length === 0) {
            reviewsList.innerHTML = '<p class="text-center">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
            return;
        }

        reviewsList.innerHTML = businessReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="reviewer-name">${this.anonymizeName(review.userName)}</span>
                    <span class="review-date">${new Date(review.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                <div class="review-text">${review.text}</div>
            </div>
        `).join('');
    }

    getBusinessReviews(businessId) {
        return this.reviews.filter(r => r.businessId === businessId);
    }

    calculateAverageRating(businessId) {
        const businessReviews = this.getBusinessReviews(businessId);
        if (businessReviews.length === 0) {
            // Return a default rating between 4.0 and 4.5
            const ratings = [4.0, 4.1, 4.2, 4.3, 4.4, 4.5];
            return ratings[Math.floor(Math.random() * ratings.length)];
        }
        
        const sum = businessReviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / businessReviews.length;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar) stars += '☆';
        stars += '☆'.repeat(emptyStars);
        return stars;
    }

    // Rendering functions
    renderBusinesses() {
        const businessGrid = document.getElementById('businessGrid');
        const approvedBusinesses = this.businesses.filter(b => b.status === 'approved');
        
        if (approvedBusinesses.length === 0) {
            businessGrid.innerHTML = '<div class="no-results"><i class="fas fa-store"></i><h3>Henüz onaylanmış işletme bulunmuyor</h3><p>İşletme kayıtları admin onayından sonra burada görünecektir.</p></div>';
            return;
        }

        businessGrid.innerHTML = approvedBusinesses.map(business => this.createBusinessCard(business)).join('');
    }

    createBusinessCard(business) {
        const rating = this.calculateAverageRating(business.id);
        const reviewCount = this.getBusinessReviews(business.id).length;
        
        return `
            <div class="business-card" onclick="app.openBusinessDetail(${business.id})">
                <div class="business-header">
                    <div class="business-logo">${business.logo}</div>
                    <div class="business-info">
                        <h3>${business.name}</h3>
                        <div class="business-info-tags">
                            <span class="category-tag">${this.getCategoryName(business.category)}</span>
                            <div class="rating-preview">
                                <span class="stars">${this.generateStars(rating)}</span>
                                <span class="score">${rating.toFixed(1)}</span>
                                <span class="count">(${reviewCount})</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="business-details">
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <a href="tel:${business.phone}" class="phone-number" onclick="event.stopPropagation()">
                            ${business.phone}
                        </a>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${business.address}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-info-circle"></i>
                        <span>${business.description.substring(0, 100)}...</span>
                    </div>
                </div>
                <div class="social-links">
                    ${Object.entries(business.socialMedia || {}).map(([platform, url]) => 
                        `<a href="${url}" class="social-link" title="${platform}" target="_blank" onclick="event.stopPropagation()">
                            <i class="fab fa-${platform}"></i>
                        </a>`
                    ).join('')}
                </div>
                <button class="view-details-btn" onclick="event.stopPropagation(); app.openBusinessDetail(${business.id})">
                    <i class="fas fa-eye"></i> Detayları Görüntüle
                </button>
            </div>
        `;
    }

    renderDonations() {
        const donationLeaderboard = document.getElementById('donationLeaderboard');
        const approvedDonations = this.donations
            .filter(d => d.status === 'approved')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

        if (approvedDonations.length === 0) {
            donationLeaderboard.innerHTML = '<div class="no-results"><i class="fas fa-heart"></i><h3>Henüz onaylanmış bağış bulunmuyor</h3><p>Bağışlar admin onayından sonra burada görünecektir.</p></div>';
            return;
        }

        donationLeaderboard.innerHTML = approvedDonations.map((donation, index) => `
            <div class="donor-item">
                <span class="donor-rank">#${index + 1}</span>
                <span class="donor-name">${this.anonymizeName(donation.name)}</span>
                <span class="donor-amount">${donation.amount} ₺</span>
            </div>
        `).join('');
    }

    searchBusinesses(searchTerm) {
        const businessGrid = document.getElementById('businessGrid');
        const approvedBusinesses = this.businesses.filter(b => b.status === 'approved');
        
        if (!searchTerm.trim()) {
            businessGrid.innerHTML = approvedBusinesses.map(business => this.createBusinessCard(business)).join('');
            return;
        }

        const filteredBusinesses = approvedBusinesses.filter(business =>
            business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.address.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredBusinesses.length === 0) {
            businessGrid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><h3>Aradığınız kriterlere uygun işletme bulunamadı</h3><p>Lütfen farklı bir arama terimi deneyin.</p></div>';
            return;
        }

        businessGrid.innerHTML = filteredBusinesses.map(business => this.createBusinessCard(business)).join('');
    }

    getCategoryName(category) {
        const categories = {
            'restaurants': 'Restoran',
            'clothing': 'Giyim',
            'entertainment': 'Eğlence'
        };
        return categories[category] || category;
    }

    anonymizeName(name) {
        if (!name) return 'Anonim';
        const parts = name.split(' ');
        return parts.map(part => {
            if (part.length <= 2) return part;
            return part.charAt(0) + '*'.repeat(part.length - 2) + part.charAt(part.length - 1);
        }).join(' ');
    }

    checkAuthStatus() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        if (this.currentUser) {
            authButtons.innerHTML = `
                <div class="user-menu">
                    <a href="#" class="auth-btn" onclick="toggleUserDropdown()">
                        <i class="fas fa-user"></i> ${this.currentUser.firstName}
                    </a>
                    <div class="user-dropdown" id="userDropdown">
                        ${this.currentUser.role === 'admin' ? '<a href="pages/admin-panel.html" class="dropdown-item"><i class="fas fa-cog"></i> Admin Panel</a>' : ''}
                        <a href="#" class="dropdown-item" onclick="openModal('userSettingsModal')"><i class="fas fa-user-cog"></i> Hesap Ayarları</a>
                        <a href="#" class="dropdown-item" onclick="app.logout()"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</a>
                    </div>
                </div>
            `;
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        location.reload();
    }

    // Modal functions
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Global functions
function openModal(modalId) {
    app.openModal(modalId);
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function showCategory(category) {
    app.currentCategory = category;
    document.querySelectorAll('.nav-container .nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (category === 'all') {
        app.renderBusinesses();
        document.getElementById('categoryDesc').textContent = 'Denizlispor\'umuzu destekleyen değerli esnaflarımız';
    } else {
        const filteredBusinesses = app.businesses.filter(b => b.status === 'approved' && b.category === category);
        const businessGrid = document.getElementById('businessGrid');
        businessGrid.innerHTML = filteredBusinesses.map(business => app.createBusinessCard(business)).join('');
        
        const categoryDescriptions = {
            'restaurants': 'Lezzet dolu anlar için Denizlispor destekçisi mekanlar',
            'clothing': 'Tarzınızı tamamlayacak yeşil-siyah ruhlu mağazalar',
            'entertainment': 'Keyifli vakit geçirebileceğiniz Denizlispor sevdalısı mekanlar'
        };
        document.getElementById('categoryDesc').textContent = categoryDescriptions[category];
    }
}

function showCategoryMobile(category) {
    showCategory.call({target: document.querySelectorAll('.nav-dropdown .nav-btn')[
        category === 'all' ? 0 : category === 'restaurants' ? 1 : category === 'clothing' ? 2 : 3
    ]}, category);
    toggleMobileNav();
}

function toggleMobileNav() {
    const dropdown = document.getElementById('mobileNavDropdown');
    dropdown.classList.toggle('show');
}

function searchBusinesses() {
    const searchTerm = document.getElementById('searchInput').value;
    app.searchBusinesses(searchTerm);
}

function scrollToBusinesses() {
    document.getElementById('businessesSection').scrollIntoView({ behavior: 'smooth' });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function switchBusinessTab(tabName) {
    document.querySelectorAll('.business-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.business-tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="switchBusinessTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function selectAmount(amount) {
    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const amountInput = document.getElementById('donationAmount');
    if (amount > 0) {
        amountInput.value = amount;
    } else {
        amountInput.value = '';
        amountInput.focus();
    }
}

function copyIban() {
    const ibanText = document.getElementById('bankIban').textContent;
    navigator.clipboard.writeText(ibanText).then(() => {
        app.showToast('IBAN numarası kopyalandı!', 'success');
    });
}

function revealDiscount() {
    document.getElementById('discountBox').style.display = 'none';
    document.getElementById('discountRevealed').style.display = 'block';
}

function copyDiscountCode() {
    const code = document.getElementById('discountCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        app.showToast('İndirim kodu kopyalandı: ' + code, 'success');
    });
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

function openPhotoModal(photoUrl) {
    window.open(photoUrl, '_blank');
}

// Close user dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EHorozApp();
});
