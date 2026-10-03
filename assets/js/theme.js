try {
  document.documentElement.dataset.theme = localStorage.getItem('anhgon-theme') === 'theme-dark' ? 'dark' : 'light';
} catch { document.documentElement.dataset.theme = 'light'; }
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('theme')?.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('anhgon-theme', dark ? 'theme-dark' : 'theme-light'); } catch {}
  });
}, { once:true });
