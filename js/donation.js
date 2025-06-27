class DonationSystem {
    constructor() {
        this.donations = JSON.parse(localStorage.getItem('donations') || '[]');
        this.settings = JSON.parse(localStorage.getItem('settings') || '{}');
        this.init();
    }

    init() {
        this.loadBankInfo();
        this.loadLeaderboard();
        this.initEventListeners();
    }

    initEventListeners() {
        // Amount buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('donationAmount').value = e.target.dataset.amount;
            });
        });

        // Donation form
        const donationForm = document.getElementById('donationForm');
        if (donationForm) {
            donationForm.addEventListener('submit', (e) => this.handleDonationForm(e));
        }

        // File upload
        const fileInput = document.getElementById('paymentProof');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    loadBankInfo() {
        if (this.settings.iban) {
            document.getElementById('ibanNumber').textContent = this.settings.iban;
            document.getElementById('bankName').textContent = this.settings.bankName || 'Türkiye İş Bankası';
            document.getElementById('accountHolder').textContent = this.settings.accountHolder || 'e-horoz Denizlispor Destek Fonu';
        }
    }

    loadLeaderboard() {
        const leaderboard = document.getElementById('donationLeaderboard');
        const approvedDonations = this.donations
            .filter(d => d.status === 'approved')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

        if (approvedDonations.length === 0) {
            leaderboard.innerHTML = '<p class="text-center">Henüz onaylanmış bağış bulunmuyor.</p>';
            return;
        }

        leaderboard.innerHTML = approvedDonations.map((donation, index) => `
            <div class="donor-item">
                <span class="donor-rank">#${index + 1}</span>
                <span class="donor-name">${this.anonymizeName(donation.donorName)}</span>
                <span class="donor-amount">${donation.amount} ₺</span>
            </div>
        `).join('');
    }

    handleDonationForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const donationData = {
            donorName: formData.get('donorName'),
            donorEmail: formData.get('donorEmail'),
            amount: parseInt(formData.get('donationAmount')),
            message: formData.get('donationMessage')
        };

        // Store donation data temporarily
        sessionStorage.setItem('pendingDonation', JSON.stringify(donationData));
        
        // Show upload section
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('uploadSection').scrollIntoView({ behavior: 'smooth' });
        
        // Show success message
        this.showMessage('Bağış bilgileri kaydedildi! Şimdi ödeme makbuzunu yükleyin.', 'success');
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                this.showMessage('Dosya boyutu 5MB\'dan büyük olamaz!', 'error');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                this.showMessage('Sadece JPG, PNG ve PDF dosyaları yükleyebilirsiniz!', 'error');
                return;
            }

            // Store file reference
            sessionStorage.setItem('uploadedFile', file.name);
            this.showMessage('Dosya başarıyla yüklendi!', 'success');
        }
    }

    anonymizeName(name) {
        if (!name) return 'Anonim';
        const parts = name.split(' ');
        return parts.map(part => {
            if (part.length <= 2) return part;
            return part.charAt(0) + '*'.repeat(part.length - 2) + part.charAt(part.length - 1);
        }).join(' ');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `donation-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            ${message}
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Global functions
function copyIBAN() {
    const ibanText = document.getElementById('ibanNumber').textContent;
    navigator.clipboard.writeText(ibanText).then(() => {
        donationSystem.showMessage('IBAN numarası kopyalandı!', 'success');
    });
}

function confirmDonation() {
    const pendingDonation = JSON.parse(sessionStorage.getItem('pendingDonation') || '{}');
    const uploadedFile = sessionStorage.getItem('uploadedFile');
    
    if (!uploadedFile) {
        donationSystem.showMessage('Lütfen ödeme makbuzunu yükleyin!', 'error');
        return;
    }

    const newDonation = {
        id: Date.now(),
        ...pendingDonation,
        proof: uploadedFile,
        date: new Date().toISOString(),
        status: 'pending'
    };

    donationSystem.donations.push(newDonation);
    localStorage.setItem('donations', JSON.stringify(donationSystem.donations));

    // Clear session storage
    sessionStorage.removeItem('pendingDonation');
    sessionStorage.removeItem('uploadedFile');

    donationSystem.showMessage('Bağışınız admin onayına gönderildi! Teşekkür ederiz.', 'success');
    
    // Reset form and hide upload section
    document.getElementById('donationForm').reset();
    document.getElementById('uploadSection').style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize donation system
document.addEventListener('DOMContentLoaded', () => {
    window.donationSystem = new DonationSystem();
});