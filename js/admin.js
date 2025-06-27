// Admin Panel Application
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.pendingUsers = [];
        this.businesses = [];
        this.donations = [];
        this.users = [];
        this.pendingChanges = [];
        this.init();
    }

    init() {
        this.checkAdminAuth();
        this.loadData();
        this.initEventListeners();
        this.loadPendingUsers();
        this.loadSettings();
        this.updateStats();
    }

    checkAdminAuth() {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            window.location.href = '../index.html';
            return;
        }

        this.currentUser = JSON.parse(userData);
        if (this.currentUser.role !== 'admin') {
            window.location.href = '../index.html';
            return;
        }
    }

    loadData() {
        this.pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        this.businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
        this.donations = JSON.parse(localStorage.getItem('donations') || '[]');
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.pendingChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]');
    }

    saveData() {
        localStorage.setItem('pendingUsers', JSON.stringify(this.pendingUsers));
        localStorage.setItem('businesses', JSON.stringify(this.businesses));
        localStorage.setItem('donations', JSON.stringify(this.donations));
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('pendingChanges', JSON.stringify(this.pendingChanges));
    }

    initEventListeners() {
        // IBAN form
        const ibanForm = document.getElementById('ibanForm');
        if (ibanForm) {
            ibanForm.addEventListener('submit', (e) => this.saveIbanSettings(e));
        }
    }

    loadPendingUsers() {
        const container = document.getElementById('pendingUsersList');
        const pendingUsers = this.pendingUsers.filter(u => u.status === 'pending');

        if (pendingUsers.length === 0) {
            container.innerHTML = '<div class="no-results"><i class="fas fa-user-check"></i><h3>Bekleyen kullanıcı bulunmuyor</h3><p>Tüm kayıtlar işlenmiş durumda.</p></div>';
            return;
        }

        container.innerHTML = pendingUsers.map(user => `
            <div class="admin-item">
                <h4>${user.firstName} ${user.lastName} - ${user.businessName || 'Normal Kullanıcı'}</h4>
                <div class="admin-item-details">
                    <div class="admin-detail"><strong>Kullanıcı Adı:</strong> ${user.username}</div>
                    <div class="admin-detail"><strong>E-posta:</strong> ${user.email}</div>
                    <div class="admin-detail"><strong>Rol:</strong> ${user.role === 'business' ? 'İşletme Sahibi' : 'Normal Kullanıcı'}</div>
                    <div class="admin-detail"><strong>Kayıt Tarihi:</strong> ${new Date(user.registrationDate).toLocaleDateString('tr-TR')}</div>
                    ${user.businessName ? `<div class="admin-detail"><strong>İşletme Adı:</strong> ${user.businessName}</div>` : ''}
                    ${user.supportProof ? `<div class="admin-detail"><strong>Destek Belgesi:</strong> ${user.supportProof}</div>` : ''}
                </div>
                <div class="admin-actions">
                    <button class="approve-btn" onclick="adminPanel.approveUser(${user.id})">
                        <i class="fas fa-check"></i> Onayla
                    </button>
                    <button class="reject-btn" onclick="adminPanel.rejectUser(${user.id})">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                    ${user.supportProofData ? `<button class="view-file-btn" onclick="adminPanel.viewFile('${user.supportProofData}', '${user.supportProofType}')">
                        <i class="fas fa-eye"></i> Belgeyi Görüntüle
                    </button>` : ''}
                </div>
            </div>
        `).join('');
    }

    loadPendingBusinesses() {
        const container = document.getElementById('pendingBusinessesList');
        const pendingBusinesses = this.businesses.filter(b => b.status === 'pending');

        if (pendingBusinesses.length === 0) {
            container.innerHTML = '<div class="no-results"><i class="fas fa-store"></i><h3>Bekleyen işletme bulunmuyor</h3><p>Tüm işletme kayıtları işlenmiş durumda.</p></div>';
            return;
        }

        container.innerHTML = pendingBusinesses.map(business => `
            <div class="admin-item">
                <h4>${business.name}</h4>
                <div class="admin-item-details">
                    <div class="admin-detail"><strong>Kategori:</strong> ${this.getCategoryName(business.category)}</div>
                    <div class="admin-detail"><strong>Telefon:</strong> ${business.phone}</div>
                    <div class="admin-detail"><strong>Adres:</strong> ${business.address}</div>
                    <div class="admin-detail"><strong>Açıklama:</strong> ${business.description}</div>
                    ${business.website ? `<div class="admin-detail"><strong>Website:</strong> ${business.website}</div>` : ''}
                </div>
                <div class="admin-actions">
                    <button class="approve-btn" onclick="adminPanel.approveBusiness(${business.id})">
                        <i class="fas fa-check"></i> Onayla
                    </button>
                    <button class="reject-btn" onclick="adminPanel.rejectBusiness(${business.id})">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadPendingDonations() {
        const container = document.getElementById('pendingDonationsList');
        const pendingDonations = this.donations.filter(d => d.status === 'pending');

        if (pendingDonations.length === 0) {
            container.innerHTML = '<div class="no-results"><i class="fas fa-heart"></i><h3>Bekleyen bağış bulunmuyor</h3><p>Tüm bağışlar işlenmiş durumda.</p></div>';
            return;
        }

        container.innerHTML = pendingDonations.map(donation => `
            <div class="admin-item">
                <h4>Bağış - ${donation.amount} ₺</h4>
                <div class="admin-item-details">
                    <div class="admin-detail"><strong>E-posta:</strong> ${donation.email}</div>
                    <div class="admin-detail"><strong>Miktar:</strong> ${donation.amount} ₺</div>
                    <div class="admin-detail"><strong>Tarih:</strong> ${new Date(donation.date).toLocaleDateString('tr-TR')}</div>
                    ${donation.message ? `<div class="admin-detail"><strong>Mesaj:</strong> ${donation.message}</div>` : ''}
                    <div class="admin-detail"><strong>Ödeme Belgesi:</strong> ${donation.paymentProof}</div>
                </div>
                <div class="admin-actions">
                    <button class="approve-btn" onclick="adminPanel.approveDonation(${donation.id})">
                        <i class="fas fa-check"></i> Onayla
                    </button>
                    <button class="reject-btn" onclick="adminPanel.rejectDonation(${donation.id})">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                    ${donation.paymentProofData ? `<button class="view-file-btn" onclick="adminPanel.viewFile('${donation.paymentProofData}', '${donation.paymentProofType}')">
                        <i class="fas fa-eye"></i> Makbuzu Görüntüle
                    </button>` : ''}
                </div>
            </div>
        `).join('');
    }

    loadPendingChanges() {
        const container = document.getElementById('pendingChangesList');
        const pendingChanges = this.pendingChanges.filter(c => c.status === 'pending');

        if (pendingChanges.length === 0) {
            container.innerHTML = '<div class="no-results"><i class="fas fa-edit"></i><h3>Bekleyen değişiklik bulunmuyor</h3><p>Tüm değişiklik talepleri işlenmiş durumda.</p></div>';
            return;
        }

        container.innerHTML = pendingChanges.map(change => `
            <div class="admin-item">
                <h4>${change.userName} - Hesap Değişikliği</h4>
                <div class="admin-item-details">
                    <div class="admin-detail"><strong>Talep Tarihi:</strong> ${new Date(change.requestDate).toLocaleDateString('tr-TR')}</div>
                    ${change.changes.username ? `<div class="admin-detail"><strong>Yeni Kullanıcı Adı:</strong> ${change.changes.username}</div>` : ''}
                    ${change.changes.email ? `<div class="admin-detail"><strong>Yeni E-posta:</strong> ${change.changes.email}</div>` : ''}
                    ${change.changes.password ? `<div class="admin-detail"><strong>Şifre Değişikliği:</strong> Talep edildi</div>` : ''}
                </div>
                <div class="admin-actions">
                    <button class="approve-btn" onclick="adminPanel.approveChange(${change.id})">
                        <i class="fas fa-check"></i> Onayla
                    </button>
                    <button class="reject-btn" onclick="adminPanel.rejectChange(${change.id})">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadDonationRanking() {
        const container = document.getElementById('donationRankingList');
        const approvedDonations = this.donations.filter(d => d.status === 'approved');

        if (approvedDonations.length === 0) {
            container.innerHTML = '<div class="no-results"><i class="fas fa-trophy"></i><h3>Onaylanmış bağış bulunmuyor</h3><p>Henüz onaylanmış bağış bulunmuyor.</p></div>';
            return;
        }

        container.innerHTML = approvedDonations.map((donation, index) => `
            <div class="admin-item">
                <h4>#${index + 1} - ${this.anonymizeName(donation.name)} - ${donation.amount} ₺</h4>
                <div class="admin-item-details">
                    <div class="admin-detail"><strong>E-posta:</strong> ${donation.email}</div>
                    <div class="admin-detail"><strong>Miktar:</strong> ${donation.amount} ₺</div>
                    <div class="admin-detail"><strong>Tarih:</strong> ${new Date(donation.date).toLocaleDateString('tr-TR')}</div>
                    ${donation.message ? `<div class="admin-detail"><strong>Mesaj:</strong> ${donation.message}</div>` : ''}
                </div>
                <div class="admin-actions">
                    <button class="reject-btn" onclick="adminPanel.removeDonation(${donation.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadSettings() {
        const bankSettings = JSON.parse(localStorage.getItem('bankSettings') || '{}');
        
        if (bankSettings.iban) {
            document.getElementById('ibanInput').value = bankSettings.iban;
            document.getElementById('bankNameInput').value = bankSettings.bankName || '';
            document.getElementById('accountHolderInput').value = bankSettings.accountHolder || '';
        }
    }

    updateStats() {
        const totalUsers = this.users.length;
        const totalBusinesses = this.businesses.filter(b => b.status === 'approved').length;
        const totalDonationsCount = this.donations.filter(d => d.status === 'approved').length;
        const totalAmount = this.donations
            .filter(d => d.status === 'approved')
            .reduce((sum, d) => sum + d.amount, 0);

        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalBusinesses').textContent = totalBusinesses;
        document.getElementById('totalDonations').textContent = totalDonationsCount;
        document.getElementById('totalAmount').textContent = `₺${totalAmount.toLocaleString('tr-TR')}`;
    }

    // Approval functions
    approveUser(userId) {
        const userIndex = this.pendingUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        const user = this.pendingUsers[userIndex];
        user.status = 'approved';
        
        // Move to main users array
        this.users.push(user);
        this.pendingUsers.splice(userIndex, 1);
        
        this.saveData();
        this.loadPendingUsers();
        this.updateStats();
        this.showToast('Kullanıcı başarıyla onaylandı!', 'success');
    }

    rejectUser(userId) {
        const userIndex = this.pendingUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        this.pendingUsers[userIndex].status = 'rejected';
        this.saveData();
        this.loadPendingUsers();
        this.showToast('Kullanıcı kaydı reddedildi.', 'warning');
    }

    approveBusiness(businessId) {
        const businessIndex = this.businesses.findIndex(b => b.id === businessId);
        if (businessIndex === -1) return;

        this.businesses[businessIndex].status = 'approved';
        this.saveData();
        this.loadPendingBusinesses();
        this.updateStats();
        this.showToast('İşletme başarıyla onaylandı!', 'success');
    }

    rejectBusiness(businessId) {
        const businessIndex = this.businesses.findIndex(b => b.id === businessId);
        if (businessIndex === -1) return;

        this.businesses[businessIndex].status = 'rejected';
        this.saveData();
        this.loadPendingBusinesses();
        this.showToast('İşletme kaydı reddedildi.', 'warning');
    }

    approveDonation(donationId) {
        const donationIndex = this.donations.findIndex(d => d.id === donationId);
        if (donationIndex === -1) return;

        this.donations[donationIndex].status = 'approved';
        this.saveData();
        this.loadPendingDonations();
        this.loadDonationRanking();
        this.updateStats();
        this.showToast('Bağış başarıyla onaylandı!', 'success');
    }

    rejectDonation(donationId) {
        const donationIndex = this.donations.findIndex(d => d.id === donationId);
        if (donationIndex === -1) return;

        this.donations[donationIndex].status = 'rejected';
        this.saveData();
        this.loadPendingDonations();
        this.showToast('Bağış reddedildi.', 'warning');
    }

    approveChange(changeId) {
        const changeIndex = this.pendingChanges.findIndex(c => c.id === changeId);
        if (changeIndex === -1) return;

        const change = this.pendingChanges[changeIndex];
        const userIndex = this.users.findIndex(u => u.id === change.userId);
        
        if (userIndex !== -1) {
            const user = this.users[userIndex];
            
            if (change.changes.username) {
                user.username = change.changes.username;
            }
            if (change.changes.email) {
                user.email = change.changes.email;
            }
            if (change.changes.password) {
                user.password = change.changes.password;
            }
            
            this.users[userIndex] = user;
        }

        this.pendingChanges[changeIndex].status = 'approved';
        this.saveData();
        this.loadPendingChanges();
        this.showToast('Değişiklik başarıyla onaylandı!', 'success');
    }

    rejectChange(changeId) {
        const changeIndex = this.pendingChanges.findIndex(c => c.id === changeId);
        if (changeIndex === -1) return;

        this.pendingChanges[changeIndex].status = 'rejected';
        this.saveData();
        this.loadPendingChanges();
        this.showToast('Değişiklik talebi reddedildi.', 'warning');
    }

    removeDonation(donationId) {
        if (!confirm('Bu bağışı silmek istediğinizden emin misiniz?')) return;

        const donationIndex = this.donations.findIndex(d => d.id === donationId);
        if (donationIndex === -1) return;

        this.donations.splice(donationIndex, 1);
        this.saveData();
        this.loadDonationRanking();
        this.updateStats();
        this.showToast('Bağış silindi.', 'warning');
    }

    sortDonations(sortBy) {
        if (sortBy === 'amount') {
            this.donations.sort((a, b) => b.amount - a.amount);
        } else if (sortBy === 'date') {
            this.donations.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        this.saveData();
        this.loadDonationRanking();
        this.showToast(`Bağışlar ${sortBy === 'amount' ? 'miktara' : 'tarihe'} göre sıralandı.`, 'success');
    }

    resetDonations() {
        if (!confirm('Bağış sıralamasını sıfırlamak istediğinizden emin misiniz?')) return;

        this.donations.sort((a, b) => a.id - b.id);
        this.saveData();
        this.loadDonationRanking();
        this.showToast('Bağış sıralaması sıfırlandı.', 'success');
    }

    saveIbanSettings(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const bankSettings = {
            iban: formData.get('iban'),
            bankName: formData.get('bankName'),
            accountHolder: formData.get('accountHolder')
        };

        localStorage.setItem('bankSettings', JSON.stringify(bankSettings));
        this.showToast('IBAN bilgileri başarıyla kaydedildi!', 'success');
    }

    viewFile(fileData, fileType) {
        const modal = document.getElementById('fileViewerModal');
        const content = document.getElementById('fileViewerContent');
        
        if (fileType.startsWith('image/')) {
            content.innerHTML = `<img src="${fileData}" style="max-width: 100%; height: auto;" alt="Belge">`;
        } else if (fileType === 'application/pdf') {
            content.innerHTML = `<embed src="${fileData}" type="application/pdf" width="100%" height="600px">`;
        } else {
            content.innerHTML = `<p>Bu dosya türü görüntülenemiyor. <a href="${fileData}" download>İndirmek için tıklayın</a></p>`;
        }
        
        modal.style.display = 'block';
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
function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Load specific tab content
    switch(tabName) {
        case 'pending-users':
            adminPanel.loadPendingUsers();
            break;
        case 'pending-businesses':
            adminPanel.loadPendingBusinesses();
            break;
        case 'pending-donations':
            adminPanel.loadPendingDonations();
            break;
        case 'pending-changes':
            adminPanel.loadPendingChanges();
            break;
        case 'donation-ranking':
            adminPanel.loadDonationRanking();
            break;
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
