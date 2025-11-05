// Register PWA and handle Install button
(function(){
  const btn = document.getElementById('downloadAppBtn');
  if(!btn) return;

  let deferredPrompt = null;

  // Register service worker if available
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/static/service-worker.js').catch(()=>{});
  }

  // Show Install button only when prompt is available
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    btn.style.display = 'flex';
  });

  window.addEventListener('appinstalled', ()=>{
    deferredPrompt = null;
    toast('App installed!');
  });

  // Button click to trigger install
  btn.addEventListener('click', async()=>{
    if(!deferredPrompt){
      toast('Install not supported here. Use Chrome/Edge on desktop or mobile.', 'error');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if(outcome === 'accepted') toast('Installing...');
    deferredPrompt = null;
  });

  function toast(message, type='success'){
    const n = document.getElementById('notification');
    const t = document.getElementById('notificationText');
    if(!n||!t) return;
    t.textContent = message;
    n.style.background = type==='error' ? 'var(--danger-color)' : 'var(--success-color)';
    const i = n.querySelector('i');
    if(i) i.className = type==='error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    n.classList.add('show');
    setTimeout(()=> n.classList.remove('show'), 3000);
  }
})();
