// Main JavaScript for BlockVision
// Handles global functionality and API calls

// API Base URL
const API_BASE_URL = window.location.origin;

// Utility Functions
const Utils = {
    // Show toast notification
    showToast(title, message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const toastTitle = toast.querySelector('.toast-title');
        const toastMessage = toast.querySelector('.toast-message');

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        // Remove existing type classes
        toast.classList.remove('success', 'error', 'warning', 'info');
        toast.classList.add(type);

        // Show toast
        toast.classList.add('show');

        // Hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    },

    // Format date
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Format address (shorten)
    formatAddress(address) {
        if (!address) return 'N/A';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    // Copy to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied!', 'Text copied to clipboard', 'success');
            }).catch(err => {
                console.error('Copy failed:', err);
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('Copied!', 'Text copied to clipboard', 'success');
        }
    },

    // Validate file
    validateImageFile(file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];
        const maxSize = 16 * 1024 * 1024; // 16MB

        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Please upload an image file.' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: 'File too large. Maximum size is 16MB.' };
        }

        return { valid: true };
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// API Service
const API = {
    // Fetch blockchain stats
    async getStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/stats`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    },

    // Upload image
    async uploadImage(file, encrypt = false) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('encrypt', encrypt);

            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    // Register on blockchain
    async registerOnBlockchain(imageHash, filename) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_hash: imageHash,
                    filename: filename
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Error registering on blockchain:', error);
            throw error;
        }
    },

    // Verify image
    async verifyImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            return data;
        } catch (error) {
            console.error('Error verifying image:', error);
            throw error;
        }
    },

    // Verify by hash
    async verifyHash(hash) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/verify-hash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_hash: hash
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Hash verification failed');
            }

            return data;
        } catch (error) {
            console.error('Error verifying hash:', error);
            throw error;
        }
    },

    // Get user history
    async getUserHistory(address) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/history/${address}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch history');
            }

            return data;
        } catch (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
    },

    // Get all images
    async getAllImages(page = 1, perPage = 20) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/all-images?page=${page}&per_page=${perPage}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch images');
            }

            return data;
        } catch (error) {
            console.error('Error fetching all images:', error);
            throw error;
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Update stats on homepage
    const totalImagesElement = document.getElementById('totalImages');
    if (totalImagesElement) {
        try {
            const stats = await API.getStats();
            if (stats.success) {
                totalImagesElement.textContent = stats.total_images_registered || 0;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    // Initialize wallet connection button
    const connectWalletBtn = document.getElementById('connectWallet');
    if (connectWalletBtn && typeof window.Web3Handler !== 'undefined') {
        connectWalletBtn.addEventListener('click', async () => {
            try {
                const account = await window.Web3Handler.connectWallet();
                if (account) {
                    connectWalletBtn.innerHTML = `
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="6" width="18" height="13" rx="2"/>
                            <path d="M3 10h18"/>
                        </svg>
                        <span>${Utils.formatAddress(account)}</span>
                    `;
                    Utils.showToast('Connected!', 'Wallet connected successfully', 'success');
                }
            } catch (error) {
                Utils.showToast('Connection Failed', error.message, 'error');
            }
        });
    }
});

// Export utilities and API for use in other scripts
window.Utils = Utils;
window.API = API;
