class QRCodeGenerator {
    constructor() {
        this.qrText = document.getElementById('qr-text');
        this.centerImage = document.getElementById('center-image');
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.qrOutput = document.getElementById('qr-output');
        this.ctx = this.qrOutput.getContext('2d');

        this.init();
    }

    init() {
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
    }

    generateQRCode() {
        const text = this.qrText.value;
        if (!text) return;

        // Add loading state
        this.qrOutput.classList.add('loading');
        this.generateBtn.disabled = true;
        
        setTimeout(() => {
            const qr = qrcode(0, 'H');
            qr.addData(text);
            qr.make();

            const size = 400;
            this.qrOutput.width = size;
            this.qrOutput.height = size;

            // Draw QR Code
            const cellSize = size / qr.getModuleCount();
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, size, size);

            for (let row = 0; row < qr.getModuleCount(); row++) {
                for (let col = 0; col < qr.getModuleCount(); col++) {
                    if (qr.isDark(row, col)) {
                        this.ctx.fillStyle = '#000000';
                        this.ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }

            // Add center image if uploaded
            if (this.centerImage.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        // Reduce size from 0.3 to 0.2 (20% of QR code size)
                        const centerSize = size * 0.2;
                        const centerPos = (size - centerSize) / 2;
                        this.addCenterImage(img, size, centerSize, centerPos);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(this.centerImage.files[0]);
            }

            // Add animation class to QR code
            this.qrOutput.style.opacity = '0';
            this.qrOutput.style.transform = 'scale(0.9)';
            
            requestAnimationFrame(() => {
                this.qrOutput.style.transition = 'all 0.5s ease';
                this.qrOutput.style.opacity = '1';
                this.qrOutput.style.transform = 'scale(1)';
            });

            // Remove loading state
            this.qrOutput.classList.remove('loading');
            this.generateBtn.disabled = false;
        }, 500);
    }

    // Add smooth animation when adding center image
    addCenterImage(img, size, centerSize, centerPos) {
        this.ctx.save();
        
        // Add white background behind the center image
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(size/2, size/2, (centerSize/2) + 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add fade-in effect for center image
        let opacity = 0;
        const fadeIn = () => {
            opacity += 0.05;
            this.ctx.globalAlpha = opacity;
            
            this.ctx.beginPath();
            this.ctx.arc(size/2, size/2, centerSize/2, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.clip();
            this.ctx.drawImage(img, centerPos, centerPos, centerSize, centerSize);
            
            if (opacity < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        
        fadeIn();
        this.ctx.restore();
    }

    downloadQRCode() {
        // Add download animation
        this.downloadBtn.classList.add('loading');
        setTimeout(() => {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = this.qrOutput.toDataURL();
            link.click();
            this.downloadBtn.classList.remove('loading');
        }, 300);
    }
}

// Initialize the QR Code Generator
window.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});
