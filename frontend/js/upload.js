// Upload Page JavaScript
// Handles image upload and blockchain registration

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadContent = document.getElementById('uploadContent');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    const encryptOption = document.getElementById('encryptOption');
    const uploadBtn = document.getElementById('uploadBtn');
    const registerBtn = document.getElementById('registerBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const resultDetails = document.getElementById('resultDetails');
    const downloadCertificate = document.getElementById('downloadCertificate');
    const uploadAnother = document.getElementById('uploadAnother');

    let selectedFile = null;
    let uploadedData = null;

    // Click to upload
    uploadZone.addEventListener('click', (e) => {
        if (e.target !== removeImageBtn && !removeImageBtn.contains(e.target)) {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Remove image
    removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });

    // Upload button
    uploadBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        
        await uploadImage();
    });

    // Register button
    registerBtn.addEventListener('click', async () => {
        if (!uploadedData) return;
        
        await registerOnBlockchain();
    });

    // Download certificate
    downloadCertificate.addEventListener('click', () => {
        if (uploadedData) {
            generateCertificate();
        }
    });

    // Upload another
    uploadAnother.addEventListener('click', () => {
        resultCard.style.display = 'none';
        resetUpload();
    });

    // Handle file selection
    function handleFileSelect(file) {
        const validation = Utils.validateImageFile(file);
        
        if (!validation.valid) {
            Utils.showToast('Invalid File', validation.error, 'error');
            return;
        }

        selectedFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadContent.style.display = 'none';
            imagePreview.style.display = 'flex';
            uploadBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // Reset upload
    function resetUpload() {
        selectedFile = null;
        uploadedData = null;
        fileInput.value = '';
        previewImg.src = '';
        uploadContent.style.display = 'flex';
        imagePreview.style.display = 'none';
        uploadBtn.disabled = true;
        registerBtn.style.display = 'none';
        progressBar.style.display = 'none';
    }

    // Upload image
    async function uploadImage() {
        try {
            uploadBtn.disabled = true;
            progressBar.style.display = 'block';
            progressFill.style.width = '30%';

            const encrypt = encryptOption.checked;
            const data = await API.uploadImage(selectedFile, encrypt);

            progressFill.style.width = '100%';

            if (data.success) {
                uploadedData = data;
                Utils.showToast('Success!', 'Image uploaded and hash generated', 'success');
                
                // Show register button
                uploadBtn.style.display = 'none';
                registerBtn.style.display = 'flex';
                registerBtn.disabled = false;

                // Update UI with hash info
                setTimeout(() => {
                    progressBar.style.display = 'none';
                    progressFill.style.width = '0%';
                }, 1000);
            }
        } catch (error) {
            Utils.showToast('Upload Failed', error.message, 'error');
            uploadBtn.disabled = false;
            progressBar.style.display = 'none';
        }
    }

    // Register on blockchain
    async function registerOnBlockchain() {
        try {
            registerBtn.disabled = true;
            progressBar.style.display = 'block';
            progressFill.style.width = '50%';

            const result = await API.registerOnBlockchain(
                uploadedData.image_hash,
                uploadedData.filename
            );

            progressFill.style.width = '100%';

            if (result.success) {
                Utils.showToast('Registered!', 'Image registered on blockchain', 'success');
                
                // Combine data
                const fullData = { ...uploadedData, ...result };
                
                // Show result card
                setTimeout(() => {
                    displayResult(fullData);
                    progressBar.style.display = 'none';
                    progressFill.style.width = '0%';
                }, 1000);
            }
        } catch (error) {
            Utils.showToast('Registration Failed', error.message, 'error');
            registerBtn.disabled = false;
            progressBar.style.display = 'none';
        }
    }

    // Display result
    function displayResult(data) {
        resultTitle.textContent = 'Successfully Registered!';
        resultMessage.textContent = 'Your image has been registered on the blockchain';
        
        // Update icon
        resultIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        `;
        resultIcon.classList.remove('error');
        resultIcon.classList.add('success');

        // Build details
        const details = [
            { label: 'Image Hash', value: data.image_hash, class: 'hash' },
            { label: 'Filename', value: data.filename },
            { label: 'File Size', value: Utils.formatFileSize(data.file_size) },
            { label: 'Dimensions', value: data.dimensions },
            { label: 'Format', value: data.format },
            { label: 'Transaction Hash', value: data.transaction_hash, class: 'hash' },
            { label: 'Block Number', value: data.block_number },
            { label: 'Gas Used', value: data.gas_used },
            { label: 'Timestamp', value: new Date(data.timestamp).toLocaleString() }
        ];

        if (data.encrypted) {
            details.push({ 
                label: 'Encryption', 
                value: 'AES-256 Enabled ✓',
                style: 'color: var(--success);'
            });
        }

        resultDetails.innerHTML = details.map(detail => `
            <div class="detail-item">
                <span class="detail-label">${detail.label}</span>
                <span class="detail-value ${detail.class || ''}" ${detail.style ? `style="${detail.style}"` : ''}>
                    ${detail.value}
                </span>
            </div>
        `).join('');

        // Add click to copy on hash values
        resultDetails.querySelectorAll('.hash').forEach(el => {
            el.style.cursor = 'pointer';
            el.title = 'Click to copy';
            el.addEventListener('click', () => {
                Utils.copyToClipboard(el.textContent);
            });
        });

        resultCard.style.display = 'block';
        resultCard.scrollIntoView({ behavior: 'smooth' });
    }

    // Generate certificate
    function generateCertificate() {
        if (!uploadedData) {
            Utils.showToast('Error', 'No data available for certificate', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set colors
        const primaryColor = [88, 86, 214]; // #5856d6
        const textColor = [51, 51, 51];
        const lightGray = [150, 150, 150];

        // Header with gradient background effect
        doc.setFillColor(88, 86, 214);
        doc.rect(0, 0, 210, 50, 'F');
        
        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('BLOCKCHAIN IMAGE', 105, 20, { align: 'center' });
        doc.text('VERIFICATION CERTIFICATE', 105, 32, { align: 'center' });
        
        // Certificate icon/symbol
        doc.setFontSize(16);
        doc.text('[VERIFIED]', 105, 44, { align: 'center' });

        // Main content
        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        
        let yPos = 65;
        
        // Certificate details
        doc.setFont(undefined, 'bold');
        doc.text('Certificate Details', 20, yPos);
        yPos += 10;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        // Image Hash
        doc.setFont(undefined, 'bold');
        doc.text('Image Hash:', 20, yPos);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        const hashLines = doc.splitTextToSize(uploadedData.image_hash || 'N/A', 170);
        doc.text(hashLines, 20, yPos + 5);
        yPos += 5 + (hashLines.length * 4) + 8;
        
        // Filename
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Filename:', 20, yPos);
        doc.setFont(undefined, 'normal');
        const filename = uploadedData.filename || 'Unknown';
        doc.text(filename.substring(0, 50), 60, yPos);
        yPos += 10;
        
        // Transaction Hash
        doc.setFont(undefined, 'bold');
        doc.text('Transaction Hash:', 20, yPos);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        const txHash = uploadedData.transaction_hash || 'N/A';
        const txHashLines = doc.splitTextToSize(txHash, 170);
        doc.text(txHashLines, 20, yPos + 5);
        yPos += 5 + (txHashLines.length * 4) + 8;
        
        // Block Number
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Block Number:', 20, yPos);
        doc.setFont(undefined, 'normal');
        const blockNum = uploadedData.block_number ? uploadedData.block_number.toString() : 'N/A';
        doc.text(blockNum, 60, yPos);
        yPos += 10;
        
        // Registration Date
        doc.setFont(undefined, 'bold');
        doc.text('Registration Date:', 20, yPos);
        doc.setFont(undefined, 'normal');
        const dateStr = uploadedData.timestamp ? new Date(uploadedData.timestamp).toLocaleString() : 'N/A';
        doc.text(dateStr, 60, yPos);
        yPos += 10;
        
        // Encryption Status
        doc.setFont(undefined, 'bold');
        doc.text('Encryption:', 20, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(uploadedData.encrypted ? 'AES-256 Enabled' : 'Not Encrypted', 60, yPos);
        yPos += 20;
        
        // Verification statement
        doc.setDrawColor(...lightGray);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Certificate of Authenticity', 105, yPos, { align: 'center' });
        yPos += 8;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const statement = 'This certificate proves that the above image has been registered on the Ethereum blockchain with immutable proof of authenticity and ownership.';
        const lines = doc.splitTextToSize(statement, 170);
        doc.text(lines, 105, yPos, { align: 'center' });
        yPos += lines.length * 5 + 10;
        
        // Security features
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Security Features:', 20, yPos);
        yPos += 7;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text('> SHA-256 Cryptographic Hashing', 25, yPos);
        yPos += 6;
        doc.text('> Immutable Blockchain Storage', 25, yPos);
        yPos += 6;
        doc.text('> Timestamp Verification', 25, yPos);
        yPos += 6;
        doc.text('> Ethereum Network Security', 25, yPos);
        yPos += 15;
        
        // Footer
        doc.setDrawColor(...lightGray);
        doc.line(20, yPos, 190, yPos);
        yPos += 8;
        
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.text('Generated by BlockVision - Blockchain Image Verification System', 105, yPos, { align: 'center' });
        yPos += 5;
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });
        
        // QR code placeholder (text version)
        doc.setFontSize(7);
        yPos += 10;
        const hashPreview = uploadedData.image_hash ? uploadedData.image_hash.slice(0, 8) : 'unknown';
        doc.text('Verify online at: blockvision.verify/' + hashPreview, 105, yPos, { align: 'center' });

        // Save PDF
        doc.save(`certificate_${hashPreview}.pdf`);

        Utils.showToast('Downloaded!', 'Certificate downloaded successfully as PDF', 'success');
    }
});
