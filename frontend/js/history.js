// History Page JavaScript
// Handles transaction history and image listing

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const refreshHistoryBtn = document.getElementById('refreshHistory');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const historyTableBody = document.getElementById('historyTableBody');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const exportCSVBtn = document.getElementById('exportCSV');
    
    // Stats Elements
    const statTotalImages = document.getElementById('statTotalImages');
    const statYourImages = document.getElementById('statYourImages');
    const statNetworkStatus = document.getElementById('statNetworkStatus');
    const statContractAddress = document.getElementById('statContractAddress');
    
    // Modal Elements
    const detailModal = document.getElementById('detailModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModal');
    const modalBody = document.getElementById('modalBody');

    let allImages = [];
    let filteredImages = [];
    let currentPage = 1;
    let perPage = 20;
    let currentFilter = 'all';
    let userAddress = null;

    // Initialize
    await init();

    // Event Listeners
    refreshHistoryBtn.addEventListener('click', () => loadHistory());
    searchInput.addEventListener('input', handleSearch);
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    exportCSVBtn.addEventListener('click', exportToCSV);
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Initialize function
    async function init() {
        // Check if wallet is connected
        if (window.Web3Handler && window.Web3Handler.account) {
            userAddress = window.Web3Handler.account;
        }

        // Load stats
        await loadStats();
        
        // Load history
        await loadHistory();
    }

    // Load stats
    async function loadStats() {
        try {
            const stats = await API.getStats();
            
            if (stats.success) {
                statTotalImages.textContent = stats.total_images_registered || 0;
                
                if (stats.connected) {
                    statNetworkStatus.innerHTML = `
                        <span class="status-dot"></span>
                        <span>Connected</span>
                    `;
                } else {
                    statNetworkStatus.innerHTML = `
                        <span class="status-dot" style="background: var(--error);"></span>
                        <span>Offline</span>
                    `;
                    statNetworkStatus.classList.add('offline');
                }
                
                if (stats.contract_address) {
                    statContractAddress.textContent = Utils.formatAddress(stats.contract_address);
                    statContractAddress.title = stats.contract_address;
                    statContractAddress.style.cursor = 'pointer';
                    statContractAddress.addEventListener('click', () => {
                        Utils.copyToClipboard(stats.contract_address);
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    // Load history
    async function loadHistory() {
        try {
            console.log('Loading history...');
            loadingState.style.display = 'flex';
            emptyState.style.display = 'none';
            historyTableBody.innerHTML = '';

            console.log('Calling API.getAllImages...');
            const data = await API.getAllImages(1, 100); // Load first 100 images
            console.log('API response:', data);
            
            if (data.success) {
                allImages = data.images || [];
                
                // Update user images count
                // Get backend wallet address from first image or fetch from API
                if (allImages.length > 0) {
                    // If wallet is connected, count only user's images
                    if (userAddress) {
                        const userImages = allImages.filter(img => 
                            img.owner.toLowerCase() === userAddress.toLowerCase()
                        );
                        statYourImages.textContent = userImages.length;
                    } else {
                        // Show total count if no wallet connected
                        statYourImages.textContent = allImages.length;
                    }
                } else {
                    statYourImages.textContent = '0';
                }
                
                if (allImages.length > 0) {
                    applyFilter();
                    loadingState.style.display = 'none';
                } else {
                    loadingState.style.display = 'none';
                    emptyState.style.display = 'flex';
                }
            } else {
                loadingState.style.display = 'none';
                emptyState.style.display = 'flex';
                statYourImages.textContent = '0';
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            loadingState.style.display = 'none';
            emptyState.style.display = 'flex';
            Utils.showToast('Error', 'Failed to load history', 'error');
        }
    }

    // Handle filter
    function handleFilter(filter) {
        currentFilter = filter;
        
        // Update button states
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        applyFilter();
    }

    // Apply filter
    function applyFilter() {
        let filtered = [...allImages];
        
        // Apply filter
        if (currentFilter === 'mine' && userAddress) {
            filtered = filtered.filter(img => 
                img.owner.toLowerCase() === userAddress.toLowerCase()
            );
        } else if (currentFilter === 'recent') {
            filtered = filtered.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
        }
        
        // Apply search
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(img => 
                img.image_hash.toLowerCase().includes(searchTerm) ||
                img.filename.toLowerCase().includes(searchTerm) ||
                img.owner.toLowerCase().includes(searchTerm)
            );
        }
        
        filteredImages = filtered;
        currentPage = 1;
        renderTable();
    }

    // Handle search
    function handleSearch() {
        applyFilter();
    }

    // Render table
    function renderTable() {
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        const pageImages = filteredImages.slice(start, end);
        
        if (pageImages.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        No images found
                    </td>
                </tr>
            `;
            pagination.style.display = 'none';
            return;
        }
        
        historyTableBody.innerHTML = pageImages.map(img => `
            <tr>
                <td>
                    <div class="image-thumbnail">
                        <img src="/api/image/${img.image_hash}" 
                             alt="${img.filename}" 
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect fill=%22%23444%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23aaa%22 font-size=%2214%22%3ENo Image%3C/text%3E%3C/svg%3E'"
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; display: block;">
                    </div>
                </td>
                <td>
                    <div class="hash-cell" title="${img.image_hash}">
                        ${img.image_hash.slice(0, 16)}...
                    </div>
                </td>
                <td>${img.filename || 'Unknown'}</td>
                <td>
                    <div class="owner-cell" title="${img.owner}">
                        ${Utils.formatAddress(img.owner)}
                    </div>
                </td>
                <td class="date-cell">${Utils.formatDate(img.timestamp)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action" onclick="window.viewDetails('${img.image_hash}')">
                            View
                        </button>
                        <button class="btn-action" onclick="window.copyHash('${img.image_hash}')">
                            Copy
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Update pagination
        const totalPages = Math.ceil(filteredImages.length / perPage);
        if (totalPages > 1) {
            pagination.style.display = 'flex';
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;
        } else {
            pagination.style.display = 'none';
        }
    }

    // Change page
    function changePage(page) {
        const totalPages = Math.ceil(filteredImages.length / perPage);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderTable();
        
        // Scroll to top of table
        document.querySelector('.history-table').scrollIntoView({ behavior: 'smooth' });
    }

    // View details (global function)
    window.viewDetails = function(imageHash) {
        const image = allImages.find(img => img.image_hash === imageHash);
        if (!image) return;
        
        modalBody.innerHTML = `
            <div class="modal-detail-item">
                <div class="modal-detail-label">Image Hash</div>
                <div class="modal-detail-value" style="font-family: 'Space Grotesk', monospace;">
                    ${image.image_hash}
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Filename</div>
                <div class="modal-detail-value">${image.filename}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Owner Address</div>
                <div class="modal-detail-value" style="font-family: 'Space Grotesk', monospace;">
                    ${image.owner}
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Registration Date</div>
                <div class="modal-detail-value">${image.registration_date}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Timestamp</div>
                <div class="modal-detail-value">${image.timestamp}</div>
            </div>
            <div class="modal-detail-item" style="background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2);">
                <div class="modal-detail-label">Status</div>
                <div class="modal-detail-value">
                    <span class="status-badge verified">✓ Verified on Blockchain</span>
                </div>
            </div>
        `;
        
        detailModal.classList.add('show');
    };

    // Copy hash (global function)
    window.copyHash = function(hash) {
        Utils.copyToClipboard(hash);
    };

    // Close modal
    function closeModal() {
        detailModal.classList.remove('show');
    }

    // Export to CSV
    function exportToCSV() {
        if (filteredImages.length === 0) {
            Utils.showToast('No Data', 'No images to export', 'warning');
            return;
        }
        
        const headers = ['Image Hash', 'Filename', 'Owner Address', 'Registration Date', 'Timestamp'];
        const rows = filteredImages.map(img => [
            img.image_hash,
            img.filename,
            img.owner,
            img.registration_date,
            img.timestamp
        ]);
        
        let csv = headers.join(',') + '\n';
        csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blockchain_images_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Utils.showToast('Exported!', 'Data exported to CSV', 'success');
    }
});
