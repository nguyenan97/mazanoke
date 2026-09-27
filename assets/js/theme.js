try {
  document.documentElement.dataset.theme = localStorage.getItem('anhgon-theme') === 'theme-dark' ? 'dark' : 'light';
} catch { document.documentElement.dataset.theme = 'light'; }
