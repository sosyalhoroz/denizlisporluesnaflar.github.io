// Main application logic
class EHorozApp {
    constructor() {
        this.currentUser = null;
        this.businesses = [];
        this.donations = [];
        this.comments = [];
        this.reviews = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.initEventListeners();
        this.renderBusinesses();
        this.renderDonations();
        this.updateCategoryCounts();
        this.checkAuthStatus();
    }

    async loadData() {
        try {
            // In a real application, this would be API calls
            // For GitHub deployment, we'll use localStorage as a simple database
            this.businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
            this.donations = JSON.parse(localStorage.getItem('donations') || '[]');
            this.comments = JSON.parse(localStorage.getItem('comments') || '[]');
            this.reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            
            // Initialize with sample data if empty
            if (this.businesses.length === 0) {
                this.initSampleData();
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    initSampleData() {
        const sampleBusinesses = [
            {
                id: 1,
                name: "Lezzet Durağı Restaurant",
                category: "restaurants",
                status: "approved",
                logo: "https://images.unsplash.com/photo-1414109936465-0fd7db5c2b6a?w=100&h=100&fit=crop&crop=face",
                photos: [
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
                    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
                    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
                ],
                phone: "+90 258 123 4567",
                address: "Pamukkale Mh. Denizli Merkez",
                mapLink: "https://maps.google.com/search/Pamukkale+Denizli",
                socialMedia: {
                    facebook: "https://facebook.com/lezzetduragi",
                    instagram: "https://instagram.com/lezzetduragi"
                },
                description: "Denizlispor'u destekleyen, geleneksel Türk mutfağının en lezzetli yemeklerini sunan aile restoranı. 25 yıllık deneyimimizle sizlere hizmet veriyoruz.",
                ownerId: 2,
                website: "https://lezzetduragi.com",
                email: "info@lezzetduragi.com"
            },
            {
                id: 2,
                name: "Moda Butik Denizli",
                category: "clothing",
                status: "approved",
                logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
                photos: [
                    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
                    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400",
                    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400"
                ],
                phone: "+90 258 765 4321",
                address: "Sümer Mh. Denizli Merkez",
                mapLink: "https://maps.google.com/search/Sümer+Denizli",
                socialMedia: {
                    instagram: "https://instagram.com/modabutikdenizli",
                    facebook: "https://facebook.com/modabutikdenizli"
                },
                description: "En son moda trendlerini takip eden, kaliteli giyim ürünleri sunan butik mağaza. Denizlispor taraftarlarına özel indirimler ve kampanyalar.",
                ownerId: 3,
                website: "https://modabutik.com",
                email: "info@modabutik.com"
            },
            {
                id: 3,
                name: "Eğlence Merkezi Denizli",
                category: "entertainment",
                status: "approved",
                logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop",
                photos: [
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
                    "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400",
                    "https://images.unsplash.com/photo-1594736797933-d0da6ac0a5c4?w=400"
                ],
                phone: "+90 258 555 0123",
                address: "Çamlaraltı Mh. Denizli Merkez",
                mapLink: "https://maps.google.com/search/Çamlaraltı+Denizli",
                socialMedia: {
                    facebook: "https://facebook.com/eglencemerkezi",
                    instagram: "https://instagram.com/eglencemerkezi"
                },
                description: "Bowling, bilardo, video oyunları ve daha fazlası. Denizlispor maç günlerinde özel etkinlikler ve turnuvalar düzenliyoruz.",
                ownerId: 4,
                website: "https://eglencemerkezi.com",
                email: "info@eglencemerkezi.com"
            },
            {
                id: 4,
                name: "Spor Giyim Mağazası",
                category: "clothing",
                status: "approved",
                logo: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=100&h=100&fit=crop",
                photos: [
                    "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400",
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
                ],
                phone: "+90 258 333 7890",
                address: "Servergazi Mh. Denizli Merkez",
                mapLink: "https://maps.google.com/search/Servergazi+Denizli",
                socialMedia: {
                    instagram: "https://instagram.com/sporgiyimdenizli"
                },
                description: "Denizlispor forma ve taraftar ürünleri, spor giyim ve ayakkabı çeşitleri. Takımımızın resmi ürün satış noktası.",
                ownerId: 5,
                website: "https://sporgiyim.com",
                email: "info@sporgiyim.com"
            },
            {
                id: 5,
                name: "Café Sahil",
                category: "restaurants",
                status: "approved",
                logo: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&h=100&fit=crop",
                photos: [
                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
                    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400"
                ],
                phone: "+90 258 444 5678",
                address: "Kayhan Mh. Denizli Merkez",
                mapLink: "https://maps.google.com/search/Kayhan+Denizli",
                socialMedia: {
                    instagram: "https://instagram.com/cafesahil",
                    facebook: "https://facebook.com/cafesahil"
                },
                description: "Denizlispor maçlarını izleyebileceğiniz, kaliteli kahve ve lezzetli atıştırmalıklar sunan modern café.",
                ownerId: 6,
                website: "https://cafesahil.com",
                email: "info@cafesahil.com"
            },
            {
                id: 6,
                name: "Oyun Salonu",
                category: "entertainment",
                status: "approved",
                logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop",
                photos: [
                    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
                    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
                ],
                phone: "+90 258 777 1234",
                address: "Yenişehir Mh. Denizli Merkez",
                mapLink: "https://maps.google.com/search/Yenişehir+Denizli",
                socialMedia: {
                    instagram: "https://instagram.com/oyunsalonu"
                },
                description: "PlayStation, Xbox, PC oyunları ve internet café hizmetleri. Denizlispor taraftarlarına özel indirimli saatler.",
                ownerId: 7,
                website: "https://oyunsalonu.com",
                email: "info@oyunsalonu.com"
            }
        ];

        const sampleDonations = [
            { id: 1, userId: 2, userName: "Ahmet Yılmaz", donorName: "Ahmet Yılmaz", amount: 500, date: "2024-01-15", status: "approved" },
            { id: 2, userId: 3, userName: "Mehmet Kaya", donorName: "Mehmet Kaya", amount: 750, date: "2024-01-14", status: "approved" },
            { id: 3, userId: 4, userName: "Hasan Özdemir", donorName: "Hasan Özdemir", amount: 300, date: "2024-01-13", status: "approved" },
            { id: 4, userId: 5, userName: "Fatma Aydın", donorName: "Fatma Aydın", amount: 1000, date: "2024-01-12", status: "approved" },
            { id: 5, userId: 6, userName: "Ali Çelik", donorName: "Ali Çelik", amount: 250, date: "2024-01-11", status: "approved" }
        ];

        // Add sample reviews
        const sampleReviews = [
            {
                id: 1,
                businessId: 1,
                authorName: "Ahmet Yılmaz",
                rating: 5,
                text: "Harika bir restoran! Yemekler çok lezzetli ve personel çok ilgili. Denizlispor'u destekledikleri için de ayrıca teşekkürler.",
                date: "2024-01-15T10:30:00Z"
            },
            {
                id: 2,
                businessId: 1,
                authorName: "Mehmet Kaya",
                rating: 4,
                text: "Güzel bir mekan, fiyatlar uygun. Denizlispor maçlarını burada izlemek keyifli.",
                date: "2024-01-14T18:20:00Z"
            },
            {
                id: 3,
                businessId: 1,
                authorName: "Zeynep Aksoy",
                rating: 5,
                text: "Aile ile gelmek için ideal bir yer. Çocuk menüsü de var, çok memnun kaldık.",
                date: "2024-01-13T16:45:00Z"
            },
            {
                id: 4,
                businessId: 2,
                authorName: "Fatma Öztürk",
                rating: 5,
                text: "Kaliteli ürünler, güler yüzlü hizmet. İndirim kodları da çok işime yaradı!",
                date: "2024-01-13T14:45:00Z"
            },
            {
                id: 5,
                businessId: 2,
                authorName: "Ayşe Demir",
                rating: 4,
                text: "Moda konusunda güncel ürünler var. Denizlispor taraftarı olduğumu söyleyince ekstra indirim yaptılar.",
                date: "2024-01-12T11:20:00Z"
            },
            {
                id: 6,
                businessId: 3,
                authorName: "Emre Şahin",
                rating: 5,
                text: "Arkadaşlarla vakit geçirmek için mükemmel bir yer. Bowling pistleri çok kaliteli.",
                date: "2024-01-11T20:15:00Z"
            },
            {
                id: 7,
                businessId: 4,
                authorName: "Mustafa Koç",
                rating: 5,
                text: "Denizlispor forması buradan aldım, orijinal ve kaliteli. Hizmet de çok iyi.",
                date: "2024-01-10T15:30:00Z"
            },
            {
                id: 8,
                businessId: 5,
                authorName: "Selin Arslan",
                rating: 4,
                text: "Kahveleri gerçekten güzel, ambiyans da çok hoş. Maç günlerinde biraz kalabalık oluyor.",
                date: "2024-01-09T13:45:00Z"
            },
            {
                id: 9,
                businessId: 6,
                authorName: "Burak Yıldız",
                rating: 5,
                text: "Oyun seçenekleri çok fazla, fiyatlar makul. Denizlispor indirimi ile daha da uygun.",
                date: "2024-01-08T19:20:00Z"
            }
        ];

        const sampleComments = [
            {
                id: 1,
                businessId: 1,
                userId: 2,
                userName: "Ahmet Yılmaz",
                comment: "Sürekli geldiğim bir mekan, herkese tavsiye ederim!",
                date: "2024-01-15T10:30:00Z"
            },
            {
                id: 2,
                businessId: 2,
                userId: 3,
                userName: "Mehmet Kaya", 
                comment: "Kaliteli ve uygun fiyatlı alışveriş yapabileceğiniz bir yer.",
                date: "2024-01-14T18:20:00Z"
            }
        ];

        this.businesses = sampleBusinesses;
        this.donations = sampleDonations;
        this.reviews = sampleReviews;
        this.comments = sampleComments;
        
        localStorage.setItem('businesses', JSON.stringify(sampleBusinesses));
        localStorage.setItem('donations', JSON.stringify(sampleDonations));
        localStorage.setItem('reviews', JSON.stringify(sampleReviews));
        localStorage.setItem('comments', JSON.stringify(sampleComments));
    }

    initEventListeners() {
        // Category filtering
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterBusinesses(category);
                // Scroll to businesses section
                document.getElementById('businesses').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.dataset.filter;
                this.filterBusinesses(filter);
            });
        });

        // Hamburger menu
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                }
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu if open
                    const navMenu = document.querySelector('.nav-menu');
                    if (navMenu) {
                        navMenu.classList.remove('active');
                    }
                }
            });
        });
    }

    renderBusinesses(filter = 'all') {
        const businessList = document.getElementById('business-list');
        if (!businessList) return;

        let filteredBusinesses = this.businesses.filter(business => 
            business.status === 'approved' && 
            (filter === 'all' || business.category === filter)
        );

        businessList.innerHTML = '';

        if (filteredBusinesses.length === 0) {
            businessList.innerHTML = '<p class="text-center">Bu kategoride henüz onaylanmış işletme bulunmuyor.</p>';
            return;
        }

        filteredBusinesses.forEach(business => {
            const businessCard = this.createBusinessCard(business);
            businessList.appendChild(businessCard);
        });
    }

    createBusinessCard(business) {
        const rating = this.calculateBusinessRating(business.id);
        const reviewCount = this.getBusinessReviewCount(business.id);
        
        const card = document.createElement('div');
        card.className = 'business-card fade-in';
        card.addEventListener('click', () => {
            window.location.href = `pages/business-detail.html?id=${business.id}`;
        });
        
        card.innerHTML = `
            <img src="${business.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}" 
                 alt="${business.name}" 
                 class="business-image"
                 loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'">
            <div class="business-card-content">
                <div class="business-card-header">
                    <img src="${business.logo || 'https://images.unsplash.com/photo-1414109936465-0fd7db5c2b6a?w=100&h=100&fit=crop'}" 
                         alt="${business.name} Logo" 
                         class="business-card-logo"
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1414109936465-0fd7db5c2b6a?w=100&h=100&fit=crop'">
                    <div class="business-card-info">
                        <h3>${business.name}</h3>
                        <p class="business-card-category">${this.getCategoryName(business.category)}</p>
                    </div>
                </div>
                <div class="business-card-rating">
                    <div class="stars">${'⭐'.repeat(Math.floor(rating))}</div>
                    <span class="rating-text">${rating.toFixed(1)} (${reviewCount} değerlendirme)</span>
                </div>
                <p class="business-description">${business.description}</p>
                <div class="business-contact">
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${business.phone}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${business.address}</span>
                    </div>
                </div>
                <div class="social-links">
                    ${Object.entries(business.socialMedia || {}).map(([platform, url]) => 
                        `<a href="${url}" target="_blank" onclick="event.stopPropagation()" title="${platform}">
                            <i class="fab fa-${platform}"></i>
                        </a>`
                    ).join('')}
                </div>
            </div>
        `;
        return card;
    }

    calculateBusinessRating(businessId) {
        const businessReviews = this.reviews.filter(r => r.businessId == businessId);
        
        if (businessReviews.length === 0) {
            // Return a default rating between 4.0 and 4.5
            const ratings = [4.0, 4.1, 4.2, 4.3, 4.4, 4.5];
            return ratings[Math.floor(Math.random() * ratings.length)];
        }
        
        const sum = businessReviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / businessReviews.length;
    }

    getBusinessReviewCount(businessId) {
        const businessReviews = this.reviews.filter(r => r.businessId == businessId);
        // If no reviews exist, return a random number between 3-15
        return businessReviews.length === 0 ? Math.floor(Math.random() * 13) + 3 : businessReviews.length;
    }

    renderComments(businessId) {
        const businessComments = this.comments.filter(comment => comment.businessId === businessId);
        
        if (businessComments.length === 0) {
            return '<p class="text-center">Henüz yorum yapılmamış.</p>';
        }

        return businessComments.map(comment => `
            <div class="comment-item">
                <div class="comment-author">${this.anonymizeName(comment.userName)}</div>
                <div class="comment-text">${comment.comment}</div>
                <div class="comment-date">${new Date(comment.date).toLocaleDateString('tr-TR')}</div>
            </div>
        `).join('');
    }

    renderDonations() {
        const donorList = document.getElementById('donor-list');
        if (!donorList) return;

        const approvedDonations = this.donations
            .filter(donation => donation.status === 'approved')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10); // Top 10 donors

        donorList.innerHTML = '';

        if (approvedDonations.length === 0) {
            donorList.innerHTML = '<p class="text-center">Henüz onaylanmış bağış bulunmuyor.</p>';
            return;
        }

        approvedDonations.forEach((donation, index) => {
            const donorItem = document.createElement('div');
            donorItem.className = 'donor-item';
            donorItem.innerHTML = `
                <span class="donor-rank">#${index + 1}</span>
                <span class="donor-name">${this.anonymizeName(donation.donorName || donation.userName)}</span>
                <span class="donor-amount">${donation.amount} ₺</span>
            `;
            donorList.appendChild(donorItem);
        });
    }

    updateCategoryCounts() {
        const counts = {
            clothing: 0,
            restaurants: 0,
            entertainment: 0
        };
        
        this.businesses.forEach(business => {
            if (business.status === 'approved') {
                counts[business.category] = (counts[business.category] || 0) + 1;
            }
        });
        
        // Update category count displays
        const clothingCount = document.getElementById('clothingCount');
        const restaurantsCount = document.getElementById('restaurantsCount'); 
        const entertainmentCount = document.getElementById('entertainmentCount');
        
        if (clothingCount) clothingCount.textContent = counts.clothing;
        if (restaurantsCount) restaurantsCount.textContent = counts.restaurants;
        if (entertainmentCount) entertainmentCount.textContent = counts.entertainment;
    }

    filterBusinesses(category) {
        this.renderBusinesses(category);
        
        // Update URL without reload
        const url = new URL(window.location);
        if (category === 'all') {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', category);
        }
        window.history.pushState({}, '', url);
    }

    getCategoryName(category) {
        const categories = {
            'clothing': 'Giyim',
            'restaurants': 'Restoran',
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
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        if (this.currentUser && authButtons) {
            authButtons.innerHTML = `
                <span class="user-welcome">Hoş geldin, ${this.currentUser.name}</span>
                <a href="#" onclick="app.logout()" class="btn-login">Çıkış</a>
                ${this.currentUser.role === 'admin' ? '<a href="pages/admin-panel.html" class="btn-register">Admin Panel</a>' : ''}
                ${this.currentUser.role === 'business' ? '<a href="pages/business-profile.html" class="btn-register">İşletme Paneli</a>' : ''}
            `;
        }
    }

    async addComment(event, businessId) {
        event.preventDefault();
        
        if (!this.currentUser) {
            alert('Yorum yapmak için giriş yapmalısınız.');
            return;
        }

        const form = event.target;
        const commentText = form.comment.value.trim();
        
        if (!commentText) return;

        const newComment = {
            id: Date.now(),
            businessId: businessId,
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            comment: commentText,
            date: new Date().toISOString()
        };

        this.comments.push(newComment);
        localStorage.setItem('comments', JSON.stringify(this.comments));

        // Refresh the business display
        this.renderBusinesses();
        
        alert('Yorumunuz başarıyla eklendi!');
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        location.reload();
    }

    // Method to refresh data (useful for admin panel)
    refreshData() {
        this.loadData().then(() => {
            this.renderBusinesses();
            this.renderDonations();
            this.updateCategoryCounts();
        });
    }

    // Method to get business by ID
    getBusinessById(id) {
        return this.businesses.find(b => b.id == id);
    }

    // Method to update business
    updateBusiness(id, updates) {
        const index = this.businesses.findIndex(b => b.id == id);
        if (index !== -1) {
            this.businesses[index] = { ...this.businesses[index], ...updates };
            localStorage.setItem('businesses', JSON.stringify(this.businesses));
            this.renderBusinesses();
            this.updateCategoryCounts();
        }
    }

    // Method to add new business
    addBusiness(businessData) {
        const newBusiness = {
            id: Date.now(),
            ...businessData,
            status: 'pending'
        };
        this.businesses.push(newBusiness);
        localStorage.setItem('businesses', JSON.stringify(this.businesses));
    }

    // Method to delete business
    deleteBusiness(id) {
        this.businesses = this.businesses.filter(b => b.id != id);
        localStorage.setItem('businesses', JSON.stringify(this.businesses));
        this.renderBusinesses();
        this.updateCategoryCounts();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EHorozApp();
    
    // Handle URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        // Wait for data to load then filter
        setTimeout(() => {
            app.filterBusinesses(category);
            // Update filter button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.filter === category) {
                    btn.classList.add('active');
                }
            });
        }, 100);
    }
});

// Utility functions
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading';
    loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yükleniyor...';
    return loader;
}

function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    return error;
}

function showSuccess(message) {
    const success = document.createElement('div');
    success.className = 'success-message';
    success.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    return success;
}

// Image loading with fallback
function loadImageWithFallback(img, fallbackSrc) {
    img.onerror = function() {
        this.src = fallbackSrc;
    };
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount);
}

// Date formatting
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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

// Local storage helper functions
const Storage = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (error) {
            console.error('Error parsing localStorage data:', error);
            return [];
        }
    },
    
    set: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    
    remove: (key) => {
        localStorage.removeItem(key);
    },
    
    clear: () => {
        localStorage.clear();
    }
};

// Performance monitoring
const Performance = {
    start: (label) => {
        if (window.performance && window.performance.mark) {
            window.performance.mark(`${label}-start`);
        }
    },
    
    end: (label) => {
        if (window.performance && window.performance.mark && window.performance.measure) {
            window.performance.mark(`${label}-end`);
            window.performance.measure(label, `${label}-start`, `${label}-end`);
        }
    }
};

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // You could send this to an error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You could send this to an error tracking service
});

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.registerServiceWorker('/sw.js')
        //     .then((registration) => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch((registrationError) => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}
