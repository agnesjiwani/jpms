// JPMS App — Router & Shell

const App = (() => {

  const NAV = [
    { section: 'Main', items: [
      { id: 'dashboard',    label: 'Dashboard',      icon: '📊', roles: ['Admin','Factory','MEDIFORM'] },
    ]},
    { section: 'Factory',  items: [
      { id: 'orders',       label: 'Orders',         icon: '📋', roles: ['Admin','Factory'] },
      { id: 'new-order',    label: 'New Order',      icon: '➕', roles: ['Admin','Factory'] },
      { id: 'production',   label: 'Production',     icon: '⚙️',  roles: ['Admin','Factory'] },
      { id: 'delivery',     label: 'Delivery',       icon: '🚚', roles: ['Admin','Factory'] },
      { id: 'patterns',     label: 'Pattern Library',icon: '🧵', roles: ['Admin','Factory','MEDIFORM'] },
      { id: 'inventory',    label: 'Ready Inventory',icon: '📦', roles: ['Admin','Factory','MEDIFORM'] },
    ]},
    { section: 'MEDIFORM', items: [
      { id: 'mediform-customers', label: 'Customers',    icon: '👤', roles: ['Admin','MEDIFORM'] },
      { id: 'mediform-new',       label: 'New Customer', icon: '➕', roles: ['Admin','MEDIFORM'] },
      { id: 'pattern-search',     label: 'Pattern Search',icon: '🔍',roles: ['Admin','MEDIFORM'] },
      { id: 'shipping',           label: 'Shipping',     icon: '📮', roles: ['Admin','MEDIFORM'] },
      { id: 'repeat-order',       label: 'Repeat Order', icon: '🔁', roles: ['Admin','MEDIFORM'] },
      { id: 'reservations',       label: 'Reservations', icon: '🔒', roles: ['Admin','MEDIFORM'] },
    ]},
    { section: 'System',   items: [
      { id: 'search',    label: 'Global Search', icon: '🔍', roles: ['Admin','Factory','MEDIFORM'] },
      { id: 'settings',  label: 'Settings',      icon: '⚙️',  roles: ['Admin'] },
    ]},
  ];

  function buildSidebar() {
    const user = Auth.getUser();
    const role = user?.role || '';
    const sidebar = document.getElementById('sidebar-nav');
    if (!sidebar) return;

    sidebar.innerHTML = NAV.map(section => {
      const items = section.items.filter(i => i.roles.includes(role));
      if (!items.length) return '';
      return `
        <div class="sidebar-section">
          <div class="sidebar-section-label">${section.section}</div>
          ${items.map(i => `
            <button class="nav-item" data-page="${i.id}" onclick="App.navigate('${i.id}')">
              <span class="nav-icon">${i.icon}</span>
              <span>${i.label}</span>
            </button>`).join('')}
        </div>`;
    }).join('');
  }

  function setActiveNav(pageId) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });
  }

  function navigate(page, param) {
    const hash = param ? `#${page}/${param}` : `#${page}`;
    window.location.hash = hash;
  }

  function handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const [page, ...paramParts] = hash.split('/');
    const param = paramParts.join('/');

    if (!Auth.isLoggedIn()) {
      renderLogin();
      return;
    }

    setActiveNav(page);
    closeSidebar();

    switch (page) {
      case 'dashboard':           DashboardPage.render(); break;
      case 'orders':              OrdersPage.render(); break;
      case 'new-order':           NewOrderPage.render(); break;
      case 'order-detail':        OrdersPage.render(); break; // Can be expanded
      case 'measurements':        MeasurementsPage.render(param); break;
      case 'production':          ProductionPage.render(); break;
      case 'delivery':            DeliveryPage.render(); break;
      case 'patterns':            PatternLibraryPage.render(); break;
      case 'pattern-detail':      PatternDetailPage.render(param); break;
      case 'inventory':           InventoryPage.render(); break;
      case 'inventory-detail':    InventoryPage.render(); break;
      case 'pattern-search':      PatternSearchPage.render(param); break;
      case 'mediform-customers':  MediformCustomersPage.render(); break;
      case 'mediform-new':        MediformNewPage.render(param); break;
      case 'mediform-detail':     MediformDetailPage.render(param); break;
      case 'alteration':          AlterationPage.render(param); break;
      case 'shipping':            ShippingPage.render(); break;
      case 'shipping-new':        ShippingNewPage.render(param); break;
      case 'repeat-order':        RepeatOrderPage.render(param); break;
      case 'reservations':        ReservationsPage.render(); break;
      case 'search':              SearchPage.render(param); break;
      case 'settings':            SettingsPage.render(); break;
      default:                    DashboardPage.render();
    }
  }

  function renderLogin() {
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    Auth.initGoogleLogin(
      (user) => {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-shell').classList.remove('hidden');
        initApp();
        navigate('dashboard');
      },
      (err) => {
        document.getElementById('login-error').textContent = err;
      }
    );
  }

  function initApp() {
    const user = Auth.getUser();
    if (!user) return;

    // Render user badge
    const badge = document.getElementById('user-badge');
    if (badge) {
      badge.innerHTML = `
        <div class="user-avatar">${user.initials || Auth.getInitials(user.name)}</div>
        <span class="desktop-only">${user.name?.split(' ')[0] || user.email}</span>`;
      badge.title = `${user.name} (${user.role || 'Unknown role'})`;
    }

    buildSidebar();
    setupGlobalSearch();
    setupSidebarToggle();
    startExpiryPoller();
  }

  function setupGlobalSearch() {
    const input = document.getElementById('global-search-inline');
    if (!input) return;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim()) {
        navigate('search', input.value.trim());
      }
    });
  }

  function setupSidebarToggle() {
    const hamburger = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('app-sidebar');

    if (hamburger) hamburger.onclick = () => sidebar.classList.toggle('open');
    if (overlay) overlay.onclick = () => closeSidebar();
  }

  function closeSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('open');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.remove('visible');
  }

  function startExpiryPoller() {
    // Expire old reservations every 5 minutes
    setInterval(async () => {
      try { await JPMS_API.expireReservations(); } catch(e) {}
    }, 5 * 60 * 1000);
  }

  function init() {
    if (Auth.isLoggedIn()) {
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app-shell').classList.remove('hidden');
      initApp();
    } else {
      renderLogin();
    }
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  return { init, navigate, buildSidebar, closeSidebar };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
