// Admin panel functionality
class AdminPanel {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
        this.donations = JSON.parse(localStorage.getItem('donations') || '[]');
        this.settings = JSON.parse(localStorage.getItem('settings') || '{}');
        this.init();
    }

    init() {
        // Check if user is admin
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.role !== 'admin') {
            window.location.href = '../index.html';
            return;
        }

        this.initEventListeners();
        this.loadAllData();
    }

    initEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        // Settings form
        const ibanForm = document.getElementById('iban-form');
        if (ibanForm) {
            ibanForm.addEventListener('submit', (e) => this.saveSettings(e));
        }
    }

    switchTab(event) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        // Add active class to clicked tab
        event.target.classList.add('active');

        // Show corresponding panel
        const tabId = event.target.dataset.tab;
        const panel = document.getElementById(tabId);
        if (panel) {
            panel.classList.add('active');
        }

        // Load data for the selected tab
        this.loadTabData(tabId);
    }

    loadAllData() {
        this.loadTabData('pending-users');
        this.loadSettings();
    }

    loadTabData(tabId) {
        switch (tabId) {
            case 'pending-users':
                this.loadPendingUsers();
                break;
            case 'pending-businesses':
                this.loadPendingBusinesses();
                break;
            case 'pending-donations':
                this.loadPendingDonations();
                break;
            case 'all-users':
                this.loadAllUsers();
                break;
            case 'all-businesses':
                this.loadAllBusinesses();
                break;
        }
    }

    loadPendingUsers() {
        const pendingUsers = this.users.filter(user => user.status === 'pending');
        const container = document.getElementById('pending-users-list');
        
        if (pendingUsers.length === 0) {
            container.innerHTML = '<p class="text-center">Bekleyen kullanıcı bulunmuyor.</p>';
            return;
        }

        container.innerHTML = pendingUsers.map(user => `
            <div class="pending-item">
                <h4>${user.name}</h4>
                <p><strong>Kullanıcı Adı:</strong> ${user.username}</p>
                <p><strong>E-posta:</strong> ${user.email}</p>
                <p><strong>Rol:</strong> ${user.role === 'business' ? 'İşletme Sahibi' : 'Normal Kullanıcı'}</p>
                <p><strong>Kayıt Tarihi:</strong> ${new Date(user.registrationDate).toLocaleDateString('tr-TR')}</p>
                ${user.businessName ? `<p><strong>İşletme Adı:</strong> ${user.businessName}</p>` : ''}
                ${user.supportProof ? `<p><strong>Destek Belgesi:</strong> ${user.supportProof}</p>` : ''}
                <div class="pending-actions">
                    <button class="approve-btn" onclick="adminPanel.approveUser(${user.id})">Onayla</button>
                    <button class="reject-btn" onclick="adminPanel.rejectUser(${user.id})">Reddet</button>
                </div>
            </div>
        `).join('');
    }

    loadPendingBusinesses() {
        const pendingBusinesses = this.businesses.filter(business => business.status === 'pending');
        const container = document.getElementById('pending-businesses-list');
        
        if (pendingBusinesses.length === 0) {
            container.innerHTML = '<p class="text-center">Bekleyen işletme bulunmuyor.</p>';
            return;
        }

        container.innerHTML = pendingBusinesses.map(business => `
            <div class="pending-item">
                <h4>${business.name}</h4>
                <p><strong>Kategori:</strong> ${this.getCategoryName(business.category)}</p>
                <p><strong>Açıklama:</strong> ${business.description}</p>
                <p><strong>Telefon:</strong> ${business.phone}</p>
                <p><strong>Adres:</strong> ${business.address}</p>
                <div class="pending-actions">
                    <button class="approve-btn" onclick="adminPanel.approveBusiness(${business.id})">Onayla</button>
                    <button class="reject-btn" onclick="adminPanel.rejectBusiness(${business.id})">Reddet</button>
                </div>
            </div>
        `).join('');
    }

    loadPendingDonations() {
        const pendingDonations = this.donations.filter(donation => donation.status === 'pending');
        const container = document.getElementById('pending-donations-list');
        
        if (pendingDonations.length === 0) {
            container.innerHTML = '<p class="text-center">Bekleyen bağış bulunmuyor.</p>';
            return;
        }

        container.innerHTML = pendingDonations.map(donation => {
            const user = this.users.find(u => u.id === donation.userId);
            return `
                <div class="pending-item">
                    <h4>Bağış - ${donation.amount} ₺</h4>
                    <p><strong>Bağışçı:</strong> ${user ? user.name : 'Bilinmiyor'}</p>
                    <p><strong>Tarih:</strong> ${new Date(donation.date).toLocaleDateString('tr-TR')}</p>
                    ${donation.proof ? `<p><strong>Ödeme Belgesi:</strong> ${donation.proof}</p>` : ''}
                    <div class="pending-actions">
                        <button class="approve-btn" onclick="adminPanel.approveDonation(${donation.id})">Onayla</button>
                        <button class="reject-btn" onclick="adminPanel.rejectDonation(${donation.id})">Reddet</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadAllUsers() {
        const container = document.getElementById('all-users-list');
        
        container.innerHTML = this.users.map(user => `
            <div class="user-item ${user.status}">
                <h4>${user.name} (${user.username})</h4>
                <p><strong>E-posta:</strong> ${user.email}</p>
                <p><strong>Rol:</strong> ${user.role === 'business' ? 'İşletme Sahibi' : user.role === 'admin' ? 'Admin' : 'Normal Kullanıcı'}</p>
                <p><strong>Durum:</strong> ${user.status === 'approved' ? 'Onaylı' : user.status === 'pending' ? 'Beklemede' : 'Reddedildi'}</p>
                <p><strong>Kayıt Tarihi:</strong> ${new Date(user.registrationDate || Date.now()).toLocaleDateString('tr-TR')}</p>
                ${user.role !== 'admin' ? `
                    <div class="user-actions">
                        <button class="reject-btn" onclick="adminPanel.deleteUser(${user.id})">Sil</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    loadAllBusinesses() {
        const container = document.getElementById('all-businesses-list');
        
        container.innerHTML = this.businesses.map(business => `
            <div class="business-item ${business.status}">
                <h4>${business.name}</h4>
                <p><strong>Kategori:</strong> ${this.getCategoryName(business.category)}</p>
                <p><strong>Durum:</strong> ${business.status === 'approved' ? 'Onaylı' : business.status === 'pending' ? 'Beklemede' : 'Reddedildi'}</p>
                <p><strong>Telefon:</strong> ${business.phone}</p>
                <p><strong>Adres:</strong> ${business.address}</p>
                <div class="business-actions">
                    <button class="reject-btn" onclick="adminPanel.deleteBusiness(${business.id})">Sil</button>
                </div>
            </div>
        `).join('');
    }

    loadSettings() {
        const ibanInput = document.getElementById('iban');
        const bankNameInput = document.getElementById('bank-name');
        const accountHolderInput = document.getElementById('account-holder');

        if (this.settings.iban) {
            ibanInput.value = this.settings.iban;
            bankNameInput.value = this.settings.bankName || '';
            accountHolderInput.value = this.settings.accountHolder || '';
        }
    }

    // Approval methods
    approveUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].status = 'approved';
            localStorage.setItem('users', JSON.stringify(this.users));
            this.loadPendingUsers();
            this.showMessage('Kullanıcı başarıyla onaylandı!', 'success');
        }
    }

    rejectUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].status = 'rejected';
            localStorage.setItem('users', JSON.stringify(this.users));
            this.loadPendingUsers();
            this.showMessage('Kullanıcı reddedildi!', 'info');
        }
    }

    approveBusiness(businessId) {
        const businessIndex = this.businesses.findIndex(b => b.id === businessId);
        if (businessIndex !== -1) {
            this.businesses[businessIndex].status = 'approved';
            localStorage.setItem('businesses', JSON.stringify(this.businesses));
            this.loadPendingBusinesses();
            this.showMessage('İşletme başarıyla onaylandı!', 'success');
        }
    }

    rejectBusiness(businessId) {
        const businessIndex = this.businesses.findIndex(b => b.id === businessId);
        if (businessIndex !== -1) {
            this.businesses[businessIndex].status = 'rejected';
            localStorage.setItem('businesses', JSON.stringify(this.businesses));
            this.loadPendingBusinesses();
            this.showMessage('İşletme reddedildi!', 'info');
        }
    }

    approveDonation(donationId) {
        const donationIndex = this.donations.findIndex(d => d.id === donationId);
        if (donationIndex !== -1) {
            this.donations[donationIndex].status = 'approved';
            localStorage.setItem('donations', JSON.stringify(this.donations));
            this.loadPendingDonations();
            this.showMessage('Bağış başarıyla onaylandı!', 'success');
        }
    }

    rejectDonation(donationId) {
        const donationIndex = this.donations.findIndex(d => d.id === donationId);
        if (donationIndex !== -1) {
            this.donations[donationIndex].status = 'rejected';
            localStorage.setItem('donations', JSON.stringify(this.donations));
            this.loadPendingDonations();
            this.showMessage('Bağış reddedildi!', 'info');
        }
    }

    deleteUser(userId) {
        if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            this.users = this.users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(this.users));
            this.loadAllUsers();
            this.showMessage('Kullanıcı silindi!', 'info');
        }
    }

    deleteBusiness(businessId) {
        if (confirm('Bu işletmeyi silmek istediğinizden emin misiniz?')) {
            this.businesses = this.businesses.filter(b => b.id !== businessId);
            localStorage.setItem('businesses', JSON.stringify(this.businesses));
            this.loadAllBusinesses();
            this.showMessage('İşletme silindi!', 'info');
        }
    }

    saveSettings(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        this.settings = {
            iban: formData.get('iban'),
            bankName: formData.get('bankName'),
            accountHolder: formData.get('accountHolder')
        };

        localStorage.setItem('settings', JSON.stringify(this.settings));
        this.showMessage('Ayarlar kaydedildi!', 'success');
    }

    getCategoryName(category) {
        const categories = {
            'clothing': 'Giyim',
            'restaurants': 'Restoran',
            'entertainment': 'Eğlence'
        };
        return categories[category] || category;
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `admin-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});