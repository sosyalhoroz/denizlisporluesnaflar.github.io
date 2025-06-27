// Main application logic
class EHorozApp {
    constructor() {
        this.currentUser = null;
        this.businesses = [];
        this.donations = [];
        this.comments = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.initEventListeners();
        this.renderBusinesses();
        this.renderDonations();
        this.checkAuthStatus();
    }

    async loadData() {
        try {
            // In a real application, this would be API calls
            // For GitHub deployment, we'll use localStorage as a simple database
            this.businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
            this.donations = JSON.parse(localStorage.getItem('donations') || '[]');
            this.comments = JSON.parse(localStorage.getItem('comments') || '[]');
            
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
                name: "Örnek Restoran",
                category: "restaurants",
                status: "approved",
                logo: "assets/images/sample-logo.jpg",
                photos: ["assets/images/sample-restaurant.jpg"],
                phone: "+90 258 123 4567",
                address: "Pamukkale, Denizli",
                mapLink: "https://maps.google.com",
                socialMedia: {
                    facebook: "https://facebook.com/sample",
                    instagram: "https://instagram.com/sample"
                },
                description: "Denizlispor'u destekleyen kaliteli restoran.",
                ownerId: 2
            },
            {
                id: 2,
                name: "Moda Butik",
                category: "clothing",
                status: "approved",
                logo: "assets/images/sample-logo2.jpg",
                photos: ["assets/images/sample-clothing.jpg"],
                phone: "+90 258 765 4321",
                address: "Merkez, Denizli",
                mapLink: "https://maps.google.com",
                socialMedia: {
                    instagram: "https://instagram.com/modabutik"
                },
                description: "En son moda trendleri ve Denizlispor desteği.",
                ownerId: 3
            }
        ];

        const sampleDonations = [
            { id: 1, userId: 2, userName: "Ah*** Me***", amount: 500, date: "2024-01-15", status: "approved" },
            { id: 2, userId: 3, userName: "Me*** Ka***", amount: 300, date: "2024-01-14", status: "approved" },
            { id: 3, userId: 4, userName: "Ha*** Öz***", amount: 200, date: "2024-01-13", status: "approved" }
        ];

        this.businesses = sampleBusinesses;
        this.donations = sampleDonations;
        
        localStorage.setItem('businesses', JSON.stringify(sampleBusinesses));
        localStorage.setItem('donations', JSON.stringify(sampleDonations));
    }

    initEventListeners() {
        // Category filtering
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterBusinesses(category);
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
        
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
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
        const card = document.createElement('div');
        card.className = 'business-card fade-in';
        card.innerHTML = `
            <img src="${business.photos[0] || 'assets/images/placeholder.jpg'}" alt="${business.name}" class="business-image">
            <div class="business-info">
                <img src="${business.logo || 'assets/images/default-logo.png'}" alt="${business.name} Logo" class="business-logo">
                <h3 class="business-name">${business.name}</h3>
                <p class="business-category">${this.getCategoryName(business.category)}</p>
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
                <div class="business-actions">
                    <a href="${business.mapLink}" target="_blank" class="btn-map">
                        <i class="fas fa-map"></i> Harita
                    </a>
                    <div class="social-links">
                        ${Object.entries(business.socialMedia || {}).map(([platform, url]) => 
                            `<a href="${url}" target="_blank"><i class="fab fa-${platform}"></i></a>`
                        ).join('')}
                    </div>
                </div>
                <div class="comments-section">
                    <h4>Yorumlar</h4>
                    ${this.currentUser ? `
                        <form class="comment-form" onsubmit="app.addComment(event, ${business.id})">
                            <textarea name="comment" placeholder="Yorumunuzu yazın..." required></textarea>
                            <button type="submit" class="submit-btn">Yorum Yap</button>
                        </form>
                    ` : '<p>Yorum yapmak için <a href="pages/login.html">giriş yapın</a></p>'}
                    <div class="comments-list">
                        ${this.renderComments(business.id)}
                    </div>
                </div>
            </div>
        `;
        return card;
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
                <span class="donor-name">${donation.userName || this.anonymizeName('Anonim Bağışçı')}</span>
                <span class="donor-amount">${donation.amount} ₺</span>
            `;
            donorList.appendChild(donorItem);
        });
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
                <span>Hoş geldin, ${this.currentUser.name}</span>
                <a href="#" onclick="app.logout()" class="btn-login">Çıkış</a>
                ${this.currentUser.role === 'admin' ? '<a href="pages/admin-panel.html" class="btn-register">Admin Panel</a>' : ''}
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EHorozApp();
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