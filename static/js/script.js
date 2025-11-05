class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadTheme();
        this.updateLengthDisplay();
        this.generatePassword();
        this.setupPWA();
    }

    initializeElements() {
        this.generateBtn = document.getElementById('generateBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.downloadAppBtn = document.getElementById('downloadAppBtn');
        this.checkStrengthBtn = document.getElementById('checkStrengthBtn');
        this.themeSelect = document.getElementById('themeSelect');

        this.passwordField = document.getElementById('generatedPassword');
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
        this.strengthScore = document.getElementById('strengthScore');

        this.lengthSlider = document.getElementById('lengthSlider');
        this.lengthValue = document.getElementById('lengthValue');
        this.includeUppercase = document.getElementById('includeUppercase');
        this.includeLowercase = document.getElementById('includeLowercase');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');
        this.excludeAmbiguous = document.getElementById('excludeAmbiguous');

        this.modal = document.getElementById('customPasswordModal');
        this.modalClose = document.getElementById('modalClose');
        this.customPassword = document.getElementById('customPassword');
        this.togglePassword = document.getElementById('togglePassword');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.customStrengthResult = document.getElementById('customStrengthResult');

        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.refreshBtn.addEventListener('click', () => this.generatePassword());

        this.copyBtn.addEventListener('click', () => this.copyPassword());
        this.downloadBtn.addEventListener('click', () => this.downloadPassword());
        this.downloadAppBtn.addEventListener('click', () => this.installPWA());

        this.themeSelect.addEventListener('change', () => this.changeTheme());

        this.lengthSlider.addEventListener('input', () => this.updateLengthDisplay());
        this.lengthSlider.addEventListener('change', () => this.generatePassword());

        [this.includeUppercase, this.includeLowercase, this.includeNumbers, this.includeSymbols, this.excludeAmbiguous].forEach(cb => cb.addEventListener('change', () => this.generatePassword()));

        this.checkStrengthBtn.addEventListener('click', () => this.showModal());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.analyzeBtn.addEventListener('click', () => this.analyzeCustomPassword());

        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());

        this.customPassword.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.analyzeCustomPassword(); });

        this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.modal.classList.contains('show')) this.closeModal(); });
    }

    loadTheme() {
        const saved = localStorage.getItem('passgen-theme') || 'blue';
        this.themeSelect.value = saved;
        this.applyTheme(saved);
    }

    changeTheme() {
        const t = this.themeSelect.value;
        this.applyTheme(t);
        localStorage.setItem('passgen-theme', t);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const root = getComputedStyle(document.documentElement);
        const primary = root.getPropertyValue('--primary-color').trim();
        this.lengthValue.style.background = `${primary}1a`;
    }

    updateLengthDisplay() { this.lengthValue.textContent = this.lengthSlider.value; }

    async generatePassword() {
        try {
            this.generateBtn.disabled = true;
            this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            const opts = { length: parseInt(this.lengthSlider.value), lowercase: this.includeLowercase.checked, uppercase: this.includeUppercase.checked, digits: this.includeNumbers.checked, symbols: this.includeSymbols.checked, excludeAmbiguous: this.excludeAmbiguous.checked };
            if (!opts.lowercase && !opts.uppercase && !opts.digits && !opts.symbols) { this.showNotification('Please select at least one character type','error'); return; }
            const res = await fetch('/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(opts) });
            const data = await res.json();
            if (data.success) { this.passwordField.value = data.password; this.updateStrengthMeter(data.strength); this.addPasswordAnimation(); }
            else { this.showNotification(data.error || 'Failed to generate password','error'); }
        } catch(e){ console.error(e); this.showNotification('Failed to generate password','error'); }
        finally { this.generateBtn.disabled = false; this.generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Password'; }
    }

    async copyPassword(){
        const p = this.passwordField.value; if(!p){ this.showNotification('No password to copy','error'); return; }
        try { await navigator.clipboard.writeText(p); this.showNotification('Password copied to clipboard!'); this.copyBtn.innerHTML = '<i class="fas fa-check"></i>'; setTimeout(()=> this.copyBtn.innerHTML = '<i class="fas fa-copy"></i>',2000); } catch(e){ this.showNotification('Failed to copy password','error'); }
    }

    downloadPassword(){
        const p = this.passwordField.value; if(!p){ this.showNotification('No password to download','error'); return; }
        const ts = new Date().toISOString().replace(/[:.]/g,'-');
        const name = `password-${ts}.txt`;
        const content = `Generated Password: ${p}\n\nGenerated on: ${new Date().toLocaleString()}\nLength: ${p.length} characters\n\nSecurity Note: Store this password securely and do not share it.`;
        const blob = new Blob([content],{type:'text/plain'});
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        this.showNotification('Password downloaded successfully!');
        this.downloadBtn.innerHTML = '<i class="fas fa-check"></i>'; setTimeout(()=> this.downloadBtn.innerHTML = '<i class="fas fa-download"></i>',2000);
    }

    updateStrengthMeter(s){ const pct = s.score; this.strengthFill.style.width = pct + '%'; this.strengthFill.style.background = s.color; this.strengthText.textContent = s.strength; this.strengthText.style.color = s.color; this.strengthScore.textContent = `${pct}/100`; this.strengthFill.style.animation = (s.strength==='Very Strong') ? 'pulse 2s infinite':'none'; }
    addPasswordAnimation(){ this.passwordField.style.transform='scale(1.02)'; this.passwordField.style.transition='transform .2s ease'; setTimeout(()=> this.passwordField.style.transform='scale(1)',200); }

    showModal(){ this.modal.classList.add('show'); this.customPassword.value=''; this.customStrengthResult.innerHTML = '<p style="color: var(--text-secondary); text-align:center;">Enter a password above to analyze its strength</p>'; setTimeout(()=> this.customPassword.focus(),100); }
    closeModal(){ this.modal.classList.remove('show'); this.customPassword.value=''; this.customStrengthResult.innerHTML=''; }

    async analyzeCustomPassword(){ const p = this.customPassword.value.trim(); if(!p){ this.customStrengthResult.innerHTML = '<p style="color: var(--danger-color);">Please enter a password to analyze</p>'; return; } try{ this.analyzeBtn.disabled=true; this.analyzeBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Analyzing...'; const res= await fetch('/check-strength',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({password:p})}); const data = await res.json(); if(data.success){ this.displayCustomStrengthResult(data.strength);} else { this.customStrengthResult.innerHTML = `<p style="color: var(--danger-color);">${data.error}</p>`; } } catch(e){ this.customStrengthResult.innerHTML = '<p style="color: var(--danger-color);">Failed to analyze password</p>'; } finally { this.analyzeBtn.disabled=false; this.analyzeBtn.innerHTML='Analyze Password'; } }

    displayCustomStrengthResult(s){ const fb = s.feedback.length ? `<div style="margin-top:1rem;"><h4 style="color:var(--text-primary); margin-bottom:.5rem; font-size:.9rem;">Recommendations:</h4><ul style="margin:0; padding-left:1.25rem; color:var(--text-secondary); font-size:.85rem;">${s.feedback.map(i=>`<li style="margin-bottom:.25rem;">${i}</li>`).join('')}</ul></div>` : '<p style="color: var(--success-color); margin-top:1rem; font-size:.9rem;">✓ Excellent password strength!</p>'; this.customStrengthResult.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.75rem;"><span style="font-weight:600; color:${s.color}; font-size:1rem;">${s.strength}</span><span style="color: var(--text-secondary); font-size:.9rem;">${s.score}/100</span></div><div style="width:100%; height:8px; background: var(--border-color); border-radius:4px; overflow:hidden; margin-bottom:.5rem;"><div style="height:100%; width:${s.score}% ; background:${s.color}; border-radius:4px; transition: all .3s ease;"></div></div>${fb}`; }

    togglePasswordVisibility(){ const isPwd = this.customPassword.type==='password'; this.customPassword.type = isPwd ? 'text':'password'; this.togglePassword.innerHTML = `<i class="fas fa-${isPwd ? 'eye-slash':'eye'}"></i>`; }

    showNotification(msg,type='success'){ this.notificationText.textContent = msg; this.notification.style.background = type==='error' ? 'var(--danger-color)':'var(--success-color)'; this.notification.querySelector('i').className = type==='error' ? 'fas fa-exclamation-circle':'fas fa-check-circle'; this.notification.classList.add('show'); setTimeout(()=> this.notification.classList.remove('show'),3000); }

    // PWA install handling for Download App
    setupPWA(){
        window.deferredPrompt = null;
        window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); window.deferredPrompt = e; this.downloadAppBtn.style.display = 'flex'; });
        window.addEventListener('appinstalled', ()=>{ this.showNotification('App installed!'); window.deferredPrompt = null; });
        if(!('BeforeInstallPromptEvent' in window)){ this.downloadAppBtn.style.display = 'none'; }
    }

    async installPWA(){
        if(window.deferredPrompt){ window.deferredPrompt.prompt(); const { outcome } = await window.deferredPrompt.userChoice; this.showNotification(outcome==='accepted' ? 'Installing...' : 'Install dismissed'); window.deferredPrompt = null; }
        else { this.showNotification('Install not supported in this browser','error'); }
    }
}

// Pulse animation
const style = document.createElement('style');
style.textContent = `@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.4);}70%{box-shadow:0 0 0 10px rgba(34,197,94,0);}100%{box-shadow:0 0 0 0 rgba(34,197,94,0);}}`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', ()=> new PasswordGenerator());
window.addEventListener('load', ()=>{ document.body.style.opacity='0'; document.body.style.transition='opacity .3s ease'; setTimeout(()=> document.body.style.opacity='1',100); });

document.addEventListener('keypress', (e)=>{ if(e.target.id==='generatedPassword' && e.key==='Enter'){ e.preventDefault(); document.getElementById('copyBtn').click(); } });
