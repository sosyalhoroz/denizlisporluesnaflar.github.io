class BusinessDetail {
    constructor() {
        this.businessId = new URLSearchParams(window.location.search).get('id');
        this.business = null;
        this.reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.selectedRating = 0;
        this.init();
    }

    init() {
        if (!this.businessId) {
            window.location.href = '../index.html';
            return;
        }

        this.loadBusiness();
        this.initEventListeners();
    }

    loadBusiness() {
        const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
        this.business = businesses.find(b => b.id == this.businessId);
        
        if (!this.business) {
            window.location.href = '../index.html';
            return;
        }

        this.renderBusiness();
        this.loadReviews();
    }

    renderBusiness() {
        // Set business logo
        const logoElement = document.getElementById('businessLogo');
        logoElement.src = this.business.logo || '../assets/images/default-logo.png';
        logoElement.alt = this.business.name + ' Logo';

        // Set business name and category
        document.getElementById('businessName').textContent = this.business.name;
        document.getElementById('businessCategory').textContent = this.getCategoryName(this.business.category);

        // Set rating
        const rating = this.calculateAverageRating();
        this.renderStars('businessStars', rating);
        document.getElementById('ratingValue').textContent = rating.toFixed(1);
        document.getElementById('reviewCount').textContent = `(${this.getBusinessReviews().length} değerlendirme)`;

        // Set contact info
        const phone = this.business.phone || '+90 258 123 4567';
        document.getElementById('businessPhone').href = `tel:${phone}`;
        document.getElementById('businessMap').href = this.business.mapLink || 'https://maps.google.com';

        // Set description
        document.getElementById('businessDescription').textContent = 
            this.business.description || 'Bu işletme Denizlispor\'u destekleyen güvenilir bir işletmedir.';

        // Set features
        this.renderFeatures();

        // Set info
        document.getElementById('businessAddress').textContent = this.business.address || 'Denizli Merkez';
        document.getElementById('businessPhoneInfo').textContent = phone;
        
        // Set website
        const websiteLink = document.getElementById('businessWebsite');
        if (this.business.website) {
            websiteLink.href = this.business.website;
            websiteLink.style.display = 'inline';
        } else {
            websiteLink.style.display = 'none';
        }

        // Set contact section
        document.getElementById('contactAddress').textContent = this.business.address || 'Denizli Merkez';
        document.getElementById('contactPhone').textContent = phone;
        document.getElementById('contactEmail').textContent = this.business.email || 'info@' + this.business.name.toLowerCase().replace(/\s+/g, '') + '.com';

        // Set map link
        document.getElementById('mapLink').href = this.business.mapLink || 'https://maps.google.com';

        // Render social media
        this.renderSocialMedia();

        // Render gallery
        this.renderGallery();
    }

    renderFeatures() {
        const features = [
            'Denizlispor Desteği',
            'Kaliteli Hizmet',
            'Güvenilir İşletme',
            'Özel İndirimler'
        ];

        const featuresContainer = document.getElementById('businessFeatures');
        featuresContainer.innerHTML = features.map(feature => 
            `<span class="feature-tag">${feature}</span>`
        ).join('');
    }

    renderSocialMedia() {
        const socialContainer = document.getElementById('socialLinksLarge');
        const socialMedia = this.business.socialMedia || {};
        
        const socialLinks = Object.entries(socialMedia).map(([platform, url]) => 
            `<a href="${url}" target="_blank" class="social-link-large">
                <i class="fab fa-${platform}"></i>
                <span>${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            </a>`
        );

        if (socialLinks.length === 0) {
            socialContainer.innerHTML = '<p>Sosyal medya hesabı bulunmuyor.</p>';
        } else {
            socialContainer.innerHTML = socialLinks.join('');
        }
    }

    renderGallery() {
        const gallery = document.getElementById('photoGallery');
        const photos = this.business.photos || [];
        
        // Add some sample photos if none exist
        if (photos.length === 0) {
            const samplePhotos = [
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
                'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
                'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
            ];
            photos.push(...samplePhotos.slice(0, 4));
        }

        gallery.innerHTML = photos.map((photo, index) => `
            <div class="gallery-item" onclick="openPhotoModal('${photo}')">
                <img src="${photo}" alt="İşletme Fotoğrafı ${index + 1}" loading="lazy">
            </div>
        `).join('');
    }

    loadReviews() {
        const businessReviews = this.getBusinessReviews();
        this.renderReviewsSummary(businessReviews);
        this.renderReviewsList(businessReviews);
    }

    getBusinessReviews() {
        return this.reviews.filter(r => r.businessId == this.businessId);
    }

    renderReviewsSummary(reviews) {
        const avgRating = this.calculateAverageRating();
        document.getElementById('overallRating').textContent = avgRating.toFixed(1);
        this.renderStars('overallStars', avgRating);
    }

    renderReviewsList(reviews) {
        const reviewsList = document.getElementById('reviewsList');
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="text-center">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
            return;
        }

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-author">${this.anonymizeName(review.authorName)}</span>
                    <span class="review-date">${new Date(review.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                <div class="review-text">${review.text}</div>
            </div>
        `).join('');
    }

    calculateAverageRating() {
        const reviews = this.getBusinessReviews();
        if (reviews.length === 0) return 4.2; // Default rating
        
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
    }

    renderStars(containerId, rating) {
        const container = document.getElementById(containerId);
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        container.innerHTML = 
            '⭐'.repeat(fullStars) + 
            (hasHalfStar ? '⭐' : '') + 
            '☆'.repeat(emptyStars);
    }

    initEventListeners() {
        // Section navigation
        document.querySelectorAll('.business-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e));
        });

        // Star rating
        document.querySelectorAll('#starRating .star').forEach(star => {
            star.addEventListener('click', (e) => this.selectRating(e));
        });

        // Review form
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => this.submitReview(e));
        }
    }

    switchSection(event) {
        // Remove active class from all buttons and sections
        document.querySelectorAll('.business-nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.business-section').forEach(section => section.classList.remove('active'));

        // Add active class to clicked button
        event.target.classList.add('active');

        // Show corresponding section
        const sectionId = event.target.dataset.section;
        document.getElementById(sectionId).classList.add('active');
    }

    selectRating(event) {
        const rating = parseInt(event.target.dataset.rating);
        this.selectedRating = rating;

        // Update visual feedback
        document.querySelectorAll('#starRating .star').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    submitReview(event) {
        event.preventDefault();

        if (!this.currentUser) {
            alert('Yorum yapmak için giriş yapmalısınız.');
            return;
        }

        if (this.selectedRating === 0) {
            alert('Lütfen bir puan verin.');
            return;
        }

        const formData = new FormData(event.target);
        const reviewText = formData.get('reviewText');

        const newReview = {
            id: Date.now(),
            businessId: this.businessId,
            authorName: this.currentUser.name,
            rating: this.selectedRating,
            text: reviewText,
            date: new Date().toISOString()
        };

        this.reviews.push(newReview);
        localStorage.setItem('reviews', JSON.stringify(this.reviews));

        // Refresh reviews
        this.loadReviews();
        
        // Close modal and reset form
        this.closeReviewModal();
        event.target.reset();
        this.selectedRating = 0;
        document.querySelectorAll('#starRating .star').forEach(star => star.classList.remove('active'));

        alert('Yorumunuz başarıyla eklendi!');
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

    closeReviewModal() {
        document.getElementById('reviewModal').style.display = 'none';
    }
}

// Global functions
function revealDiscount() {
    const giftBox = document.querySelector('.gift-box');
    const revealed = document.getElementById('discountCodeRevealed');
    
    giftBox.style.display = 'none';
    revealed.style.display = 'block';
}

function copyDiscountCode() {
    const code = document.getElementById('discountCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('İndirim kodu kopyalandı: ' + code);
    });
}

function openReviewModal() {
    document.getElementById('reviewModal').style.display = 'block';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

function openPhotoModal(photoUrl) {
    // Simple photo viewer - you can enhance this
    window.open(photoUrl, '_blank');
}

// Initialize business detail page
document.addEventListener('DOMContentLoaded', () => {
    window.businessDetail = new BusinessDetail();
});