function toggleMenu() {
  const menu = document.getElementById('primary-menu');
  if (!menu) return;
  const isOpen = menu.classList.toggle('open');
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const isOpen = sidebar.classList.toggle('open');
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) {
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
}