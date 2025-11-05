// Static-only password generation and strength checking running entirely in the browser
class PasswordGenerator{
  constructor(){this.init();}
  init(){this.lower='abcdefghijklmnopqrstuvwxyz';this.upper='ABCDEFGHIJKLMNOPQRSTUVWXYZ';this.digits='0123456789';this.symbols="!@#$%^&*()_+-=[]{}|;:,.<>?";}
  generate({length=16,lowercase=true,uppercase=true,digits=true,symbols=true,excludeAmbiguous=false}={}){
    length=Math.min(Math.max(length,4),128);
    let pool='';
    const add=(set)=>pool+=set;
    let l=this.lower,u=this.upper,d=this.digits,s=this.symbols;
    if(excludeAmbiguous){l=l.replace(/l|o/g,'');u=u.replace(/I|O/g,'');d=d.replace(/0|1/g,'');}
    if(lowercase) add(l); if(uppercase) add(u); if(digits) add(d); if(symbols) add(s);
    if(!pool) pool=this.lower+this.upper+this.digits;
    const out=[];
    if(lowercase) out.push(this.randFrom(l));
    if(uppercase) out.push(this.randFrom(u));
    if(digits) out.push(this.randFrom(d));
    if(symbols) out.push(this.randFrom(s));
    for(let i=out.length;i<length;i++){out.push(this.randFrom(pool));}
    // shuffle
    crypto.getRandomValues(new Uint32Array(out.length)).forEach((v,i)=>{const j=v%out.length;[out[i],out[j]]=[out[j],out[i]]});
    return out.join('');
  }
  randFrom(set){const arr=new Uint32Array(1);crypto.getRandomValues(arr);return set[arr[0]%set.length];}
  strength(pwd){let score=0,fb=[]; if(pwd.length>=12) score+=25; else if(pwd.length>=8){score+=15; fb.push('Consider using 12+ characters for better security');} else fb.push('Password is too short (min 8 recommended)');
    const hasL=/[a-z]/.test(pwd),hasU=/[A-Z]/.test(pwd),hasD=/\d/.test(pwd),hasS=/[^\w\s]/.test(pwd);
    const variety=[hasL,hasU,hasD,hasS].filter(Boolean).length; score+=variety*15; if(variety<3) fb.push('Use a mix of upper/lower, digits, and symbols');
    if(new Set(pwd).size/pwd.length>0.7) score+=10; else fb.push('Avoid too many repeated characters');
    const patterns=['123','abc','qwe','password','111','000']; if(!patterns.some(p=>pwd.toLowerCase().includes(p))) score+=15; else fb.push('Avoid common patterns and sequences');
    let color,str; if(score>=85){str='Very Strong';color='#22c55e';} else if(score>=70){str='Strong';color='#84cc16';} else if(score>=50){str='Medium';color='#eab308';} else if(score>=30){str='Weak';color='#f97316';} else {str='Very Weak';color='#ef4444';}
    return {score:Math.min(score,100),strength:str,color,feedback:fb};
  }
}

class UI{
  constructor(){this.gen=new PasswordGenerator();this.cache();this.bind();this.loadTheme();this.updateLen();this.generate();this.pulse();}
  cache(){this.generateBtn=$('#generateBtn');this.refreshBtn=$('#refreshBtn');this.copyBtn=$('#copyBtn');this.downloadBtn=$('#downloadBtn');this.downloadAppBtn=$('#downloadAppBtn');this.themeSelect=$('#themeSelect');this.passwordField=$('#generatedPassword');this.strengthFill=$('#strengthFill');this.strengthText=$('#strengthText');this.strengthScore=$('#strengthScore');this.lengthSlider=$('#lengthSlider');this.lengthValue=$('#lengthValue');this.includeUppercase=$('#includeUppercase');this.includeLowercase=$('#includeLowercase');this.includeNumbers=$('#includeNumbers');this.includeSymbols=$('#includeSymbols');this.excludeAmbiguous=$('#excludeAmbiguous');this.modal=$('#customPasswordModal');this.modalClose=$('#modalClose');this.customPassword=$('#customPassword');this.togglePassword=$('#togglePassword');this.analyzeBtn=$('#analyzeBtn');this.cancelBtn=$('#cancelBtn');this.customStrengthResult=$('#customStrengthResult');this.notification=$('#notification');this.notificationText=$('#notificationText');}
  bind(){this.generateBtn.addEventListener('click',()=>this.generate());this.refreshBtn.addEventListener('click',()=>this.generate());this.copyBtn.addEventListener('click',()=>this.copy());this.downloadBtn.addEventListener('click',()=>this.download());this.themeSelect.addEventListener('change',()=>this.changeTheme());this.lengthSlider.addEventListener('input',()=>this.updateLen());this.lengthSlider.addEventListener('change',()=>this.generate());[this.includeUppercase,this.includeLowercase,this.includeNumbers,this.includeSymbols,this.excludeAmbiguous].forEach(el=>el.addEventListener('change',()=>this.generate()));this.analyzeBtn.addEventListener('click',()=>this.analyze());this.togglePassword.addEventListener('click',()=>this.toggleVisibility());this.cancelBtn.addEventListener('click',()=>this.closeModal());this.modalClose.addEventListener('click',()=>this.closeModal());$('#checkStrengthBtn').addEventListener('click',()=>this.showModal());document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.modal.classList.contains('show')) this.closeModal();});document.addEventListener('keypress',e=>{if(e.target.id==='generatedPassword'&&e.key==='Enter'){e.preventDefault();this.copyBtn.click();}});}
  loadTheme(){const t=localStorage.getItem('passgen-theme')||'blue';this.themeSelect.value=t;this.applyTheme(t);} changeTheme(){const t=this.themeSelect.value;this.applyTheme(t);localStorage.setItem('passgen-theme',t);} applyTheme(t){document.documentElement.setAttribute('data-theme',t);const primary=getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();this.lengthValue.style.background=`${primary}1a`;}
  updateLen(){this.lengthValue.textContent=this.lengthSlider.value;}
  generate(){const opts={length:parseInt(this.lengthSlider.value),lowercase:this.includeLowercase.checked,uppercase:this.includeUppercase.checked,digits:this.includeNumbers.checked,symbols:this.includeSymbols.checked,excludeAmbiguous:this.excludeAmbiguous.checked}; if(!opts.lowercase&&!opts.uppercase&&!opts.digits&&!opts.symbols){return this.toast('Please select at least one character type','error');} const pwd=this.gen.generate(opts); this.passwordField.value=pwd; this.updateMeter(this.gen.strength(pwd)); this.bump();}
  updateMeter(s){this.strengthFill.style.width=s.score+'%';this.strengthFill.style.background=s.color;this.strengthText.textContent=s.strength;this.strengthText.style.color=s.color;this.strengthScore.textContent=`${s.score}/100`;this.strengthFill.style.animation=s.strength==='Very Strong'?'pulse 2s infinite':'none';}
  copy(){const p=this.passwordField.value;if(!p) return this.toast('No password to copy','error'); navigator.clipboard.writeText(p).then(()=>{this.toast('Password copied to clipboard!'); this.copyBtn.innerHTML='<i class="fas fa-check"></i>'; setTimeout(()=>this.copyBtn.innerHTML='<i class="fas fa-copy"></i>',2000);}).catch(()=>this.toast('Failed to copy password','error'));}
  download(){const p=this.passwordField.value;if(!p) return this.toast('No password to download','error'); const ts=new Date().toISOString().replace(/[:.]/g,'-'); const name=`password-${ts}.txt`; const content=`Generated Password: ${p}\n\nGenerated on: ${new Date().toLocaleString()}\nLength: ${p.length} characters\n\nSecurity Note: Store this password securely and do not share it.`; const blob=new Blob([content],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); this.toast('Password downloaded successfully!'); this.downloadBtn.innerHTML='<i class="fas fa-check"></i>'; setTimeout(()=>this.downloadBtn.innerHTML='<i class="fas fa-file-arrow-down"></i>',2000);}
  showModal(){this.modal.classList.add('show'); this.customPassword.value=''; this.customStrengthResult.innerHTML='<p style="color:var(--text-secondary);text-align:center;">Enter a password above to analyze its strength</p>'; setTimeout(()=>this.customPassword.focus(),100);}
  closeModal(){this.modal.classList.remove('show'); this.customPassword.value=''; this.customStrengthResult.innerHTML='';}
  analyze(){const p=this.customPassword.value.trim(); if(!p){this.customStrengthResult.innerHTML='<p style="color:var(--danger-color);">Please enter a password to analyze</p>'; return;} const s=this.gen.strength(p); this.customStrengthResult.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;"><span style="font-weight:600;color:${s.color};font-size:1rem;">${s.strength}</span><span style="color:var(--text-secondary);font-size:.9rem;">${s.score}/100</span></div><div style="width:100%;height:8px;background:var(--border-color);border-radius:4px;overflow:hidden;margin-bottom:.5rem;"><div style="height:100%;width:${s.score}%;background:${s.color};border-radius:4px;transition:all .3s ease;"></div></div>${s.feedback.length?`<div style="margin-top:1rem;"><h4 style="color:var(--text-primary);margin-bottom:.5rem;font-size:.9rem;">Recommendations:</h4><ul style="margin:0;padding-left:1.25rem;color:var(--text-secondary);font-size:.85rem;">${s.feedback.map(f=>`<li style=\"margin-bottom:.25rem;\">${f}</li>`).join('')}</ul></div>`:'<p style="color:var(--success-color);margin-top:1rem;font-size:.9rem;">✓ Excellent password strength!</p>'}`;}
  bump(){this.passwordField.style.transform='scale(1.02)'; this.passwordField.style.transition='transform .2s ease'; setTimeout(()=>this.passwordField.style.transform='scale(1)',200);} pulse(){const st=document.createElement('style'); st.textContent='@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.4)}70%{box-shadow:0 0 0 10px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}'; document.head.appendChild(st);} 
  toast(msg,type='success'){this.notificationText.textContent=msg; this.notification.style.background= type==='error'?'var(--danger-color)':'var(--success-color)'; this.notification.querySelector('i').className= type==='error'?'fas fa-exclamation-circle':'fas fa-check-circle'; this.notification.classList.add('show'); setTimeout(()=>this.notification.classList.remove('show'),3000);} }

const $=id=>document.querySelector(id);
document.addEventListener('DOMContentLoaded',()=>new UI());
window.addEventListener('load',()=>{document.body.style.opacity='0';document.body.style.transition='opacity .3s ease';setTimeout(()=>document.body.style.opacity='1',100)});
