class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadTheme();
        this.updateLengthDisplay();
        this.generatePassword();
    }

    initializeElements() {
        // Main elements
        this.generateBtn = document.getElementById('generateBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.checkStrengthBtn = document.getElementById('checkStrengthBtn');
        this.themeSelect = document.getElementById('themeSelect');
        
        // Password display
        this.passwordField = document.getElementById('generatedPassword');
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
        this.strengthScore = document.getElementById('strengthScore');
        
        // Options
        this.lengthSlider = document.getElementById('lengthSlider');
        this.lengthValue = document.getElementById('lengthValue');
        this.includeUppercase = document.getElementById('includeUppercase');
        this.includeLowercase = document.getElementById('includeLowercase');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');
        this.excludeAmbiguous = document.getElementById('excludeAmbiguous');
        
        // Modal elements
        this.modal = document.getElementById('customPasswordModal');
        this.modalClose = document.getElementById('modalClose');
        this.customPassword = document.getElementById('customPassword');
        this.togglePassword = document.getElementById('togglePassword');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.customStrengthResult = document.getElementById('customStrengthResult');
        
        // Notification
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    attachEventListeners() {
        // Generate password
        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.refreshBtn.addEventListener('click', () => this.generatePassword());
        
        // Copy and download password
        this.copyBtn.addEventListener('click', () => this.copyPassword());
        this.downloadBtn.addEventListener('click', () => this.downloadPassword());
        
        // Theme selection
        this.themeSelect.addEventListener('change', () => this.changeTheme());
        
        // Length slider
        this.lengthSlider.addEventListener('input', () => this.updateLengthDisplay());
        this.lengthSlider.addEventListener('change', () => this.generatePassword());
        
        // Checkboxes
        [this.includeUppercase, this.includeLowercase, this.includeNumbers, 
         this.includeSymbols, this.excludeAmbiguous].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.generatePassword());
        });
        
        // Custom password strength check
        this.checkStrengthBtn.addEventListener('click', () => this.showModal());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.analyzeBtn.addEventListener('click', () => this.analyzeCustomPassword());
        
        // Toggle password visibility
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Enter key in custom password field
        this.customPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyzeCustomPassword();
            }
        });
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('passgen-theme') || 'blue';
        this.themeSelect.value = savedTheme;
        this.applyTheme(savedTheme);
    }

    changeTheme() {
        const selectedTheme = this.themeSelect.value;
        this.applyTheme(selectedTheme);
        localStorage.setItem('passgen-theme', selectedTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme-specific colors for length value background
        const lengthValue = document.getElementById('lengthValue');
        if (lengthValue) {
            const root = getComputedStyle(document.documentElement);
            const primaryColor = root.getPropertyValue('--primary-color').trim();
            lengthValue.style.background = `${primaryColor}1a`; // Add alpha
        }
    }

    updateLengthDisplay() {
        this.lengthValue.textContent = this.lengthSlider.value;
    }

    async generatePassword() {
        try {
            this.generateBtn.disabled = true;
            this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            const options = {
                length: parseInt(this.lengthSlider.value),
                lowercase: this.includeLowercase.checked,
                uppercase: this.includeUppercase.checked,
                digits: this.includeNumbers.checked,
                symbols: this.includeSymbols.checked,
                excludeAmbiguous: this.excludeAmbiguous.checked
            };
            
            // Validate at least one character type is selected
            if (!options.lowercase && !options.uppercase && !options.digits && !options.symbols) {
                this.showNotification('Please select at least one character type', 'error');
                return;
            }
            
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(options)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.passwordField.value = data.password;
                this.updateStrengthMeter(data.strength);
                this.addPasswordAnimation();
            } else {
                this.showNotification(data.error || 'Failed to generate password', 'error');
            }
            
        } catch (error) {
            console.error('Error generating password:', error);
            this.showNotification('Failed to generate password', 'error');
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Password';
        }
    }

    async copyPassword() {
        const password = this.passwordField.value;
        
        if (!password) {
            this.showNotification('No password to copy', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(password);
            this.showNotification('Password copied to clipboard!');
            
            // Visual feedback
            this.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy password:', error);
            
            // Fallback for older browsers
            this.passwordField.select();
            this.passwordField.setSelectionRange(0, 99999);
            
            try {
                document.execCommand('copy');
                this.showNotification('Password copied to clipboard!');
            } catch (fallbackError) {
                this.showNotification('Failed to copy password', 'error');
            }
        }
    }

    downloadPassword() {
        const password = this.passwordField.value;
        
        if (!password) {
            this.showNotification('No password to download', 'error');
            return;
        }
        
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `password-${timestamp}.txt`;
            
            const content = `Generated Password: ${password}\n\nGenerated on: ${new Date().toLocaleString()}\nLength: ${password.length} characters\n\nSecurity Note: Store this password securely and do not share it with others.`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('Password downloaded successfully!');
            
            // Visual feedback
            this.downloadBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
            }, 2000);
            
        } catch (error) {
            console.error('Failed to download password:', error);
            this.showNotification('Failed to download password', 'error');
        }
    }

    updateStrengthMeter(strength) {
        const percentage = strength.score;
        const color = strength.color;
        
        this.strengthFill.style.width = percentage + '%';
        this.strengthFill.style.background = color;
        this.strengthText.textContent = strength.strength;
        this.strengthText.style.color = color;
        this.strengthScore.textContent = `${percentage}/100`;
        
        // Add pulse animation for very strong passwords
        if (strength.strength === 'Very Strong') {
            this.strengthFill.style.animation = 'pulse 2s infinite';
        } else {
            this.strengthFill.style.animation = 'none';
        }
    }

    addPasswordAnimation() {
        this.passwordField.style.transform = 'scale(1.02)';
        this.passwordField.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            this.passwordField.style.transform = 'scale(1)';
        }, 200);
    }

    showModal() {
        this.modal.classList.add('show');
        this.customPassword.value = '';
        this.customStrengthResult.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Enter a password above to analyze its strength</p>';
        setTimeout(() => this.customPassword.focus(), 100);
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.customPassword.value = '';
        this.customStrengthResult.innerHTML = '';
    }

    async analyzeCustomPassword() {
        const password = this.customPassword.value.trim();
        
        if (!password) {
            this.customStrengthResult.innerHTML = '<p style="color: var(--danger-color);">Please enter a password to analyze</p>';
            return;
        }
        
        try {
            this.analyzeBtn.disabled = true;
            this.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            
            const response = await fetch('/check-strength', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayCustomStrengthResult(data.strength);
            } else {
                this.customStrengthResult.innerHTML = `<p style="color: var(--danger-color);">${data.error}</p>`;
            }
            
        } catch (error) {
            console.error('Error analyzing password:', error);
            this.customStrengthResult.innerHTML = '<p style="color: var(--danger-color);">Failed to analyze password</p>';
        } finally {
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.innerHTML = 'Analyze Password';
        }
    }

    displayCustomStrengthResult(strength) {
        const feedbackHtml = strength.feedback.length > 0 
            ? `<div style="margin-top: 1rem;">
                <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 0.9rem;">Recommendations:</h4>
                <ul style="margin: 0; padding-left: 1.25rem; color: var(--text-secondary); font-size: 0.85rem;">
                    ${strength.feedback.map(item => `<li style="margin-bottom: 0.25rem;">${item}</li>`).join('')}
                </ul>
            </div>`
            : '<p style="color: var(--success-color); margin-top: 1rem; font-size: 0.9rem;">✓ Excellent password strength!</p>';
        
        this.customStrengthResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="font-weight: 600; color: ${strength.color}; font-size: 1rem;">${strength.strength}</span>
                <span style="color: var(--text-secondary); font-size: 0.9rem;">${strength.score}/100</span>
            </div>
            <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
                <div style="height: 100%; width: ${strength.score}%; background: ${strength.color}; border-radius: 4px; transition: all 0.3s ease;"></div>
            </div>
            ${feedbackHtml}
        `;
    }

    togglePasswordVisibility() {
        const isPassword = this.customPassword.type === 'password';
        this.customPassword.type = isPassword ? 'text' : 'password';
        this.togglePassword.innerHTML = `<i class="fas fa-${isPassword ? 'eye-slash' : 'eye'}"></i>`;
    }

    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        
        // Update notification style based on type
        if (type === 'error') {
            this.notification.style.background = 'var(--danger-color)';
            this.notification.querySelector('i').className = 'fas fa-exclamation-circle';
        } else {
            this.notification.style.background = 'var(--success-color)';
            this.notification.querySelector('i').className = 'fas fa-check-circle';
        }
        
        this.notification.classList.add('show');
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// Add pulse animation for very strong passwords
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
        100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
`;
document.head.appendChild(style);

// Initialize the password generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});

// Add some additional utility functions
window.addEventListener('load', () => {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Prevent form submission on Enter key in password field
document.addEventListener('keypress', (e) => {
    if (e.target.id === 'generatedPassword' && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('copyBtn').click();
    }
});