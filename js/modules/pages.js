// JPMS Page Modules
// Each module renders its page and handles its events.

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════
const DashboardPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Dashboard';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML('Loading dashboard...');
    try {
      const d = await JPMS_API.getDashboard();
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div>
              <div class="page-title">Good ${greeting()}, ${Auth.getUser()?.name?.split(' ')[0] || 'Staff'} 👋</div>
              <div class="page-subtitle">${Utils.formatDate(new Date())}</div>
            </div>
          </div>

          <div class="stats-grid">
            ${stat("Today's Orders", d.todaysOrders, '')}
            ${stat('Pending Orders', d.pendingOrders, '')}
            ${stat('In Production', d.pendingProduction, '')}
            ${stat('Available Patterns', d.availablePatterns, 'accent')}
            ${stat('Remaining Pieces', d.remainingPieces, 'accent')}
            ${stat('Reserved', d.totalReserved, '')}
            ${stat('Out of Stock', d.outOfStock, '')}
            ${stat('Total Patterns', d.totalPatterns, '')}
            ${stat('Factory Customers', d.factoryCustomers, '')}
            ${stat('MEDIFORM Customers', d.totalMediform, '')}
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-header"><span class="card-title">🏭 Factory Quick Actions</span></div>
              <div class="card-body flex flex-col gap-3">
                <button class="btn btn-primary btn-lg btn-full" onclick="App.navigate('new-order')">+ New Order</button>
                <button class="btn btn-secondary btn-full" onclick="App.navigate('production')">📋 View Production</button>
                <button class="btn btn-secondary btn-full" onclick="App.navigate('inventory')">📦 Ready Inventory</button>
              </div>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">💊 MEDIFORM Quick Actions</span></div>
              <div class="card-body flex flex-col gap-3">
                <button class="btn btn-primary btn-lg btn-full" onclick="App.navigate('mediform-new')">+ New Customer</button>
                <button class="btn btn-secondary btn-full" onclick="App.navigate('pattern-search')">🔍 Pattern Search</button>
                <button class="btn btn-secondary btn-full" onclick="App.navigate('repeat-order')">🔁 Repeat Order</button>
              </div>
            </div>
          </div>
        </div>`;
    } catch (e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">Failed to load dashboard: ${e.message}</div></div>`;
    }
  }
};

function stat(label, value, cls) {
  return `<div class="stat-card ${cls}"><div class="stat-value">${value ?? '—'}</div><div class="stat-label">${label}</div></div>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ══════════════════════════════════════════════════════════════
// ORDERS LIST
// ══════════════════════════════════════════════════════════════
const OrdersPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Orders';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const orders = await JPMS_API.getOrders();
      const sorted = orders.sort((a, b) => new Date(b['Order Date']) - new Date(a['Order Date']));
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">Orders</div>
            <button class="btn btn-primary" onclick="App.navigate('new-order')">+ New Order</button>
          </div>
          <div class="card">
            ${sorted.length === 0 ? Utils.emptyHTML('📋', 'No orders yet', 'Create your first order above.') :
              sorted.map(o => `
                <div class="list-item" onclick="App.navigate('order-detail', '${o['Order ID']}')">
                  <div class="list-item-main">
                    <div class="list-item-title">${o['Customer Name']}</div>
                    <div class="list-item-sub">${o['Order ID']} · ${o['Pattern Code']} · ${o['Hospital / Clinic'] || '—'}</div>
                    <div class="list-item-sub">${Utils.formatDate(o['Order Date'])} · ${o['Uniform Type']}</div>
                  </div>
                  <div class="list-item-right">
                    ${Utils.statusBadge(o['Status'])}
                    <span class="text-muted">›</span>
                  </div>
                </div>`).join('')}
          </div>
        </div>`;
    } catch (e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  }
};

// ══════════════════════════════════════════════════════════════
// NEW ORDER
// ══════════════════════════════════════════════════════════════
const NewOrderPage = {
  render() {
    document.getElementById('topbar-title').textContent = 'New Order';
    document.getElementById('page-content').innerHTML = `
      <div class="page">
        <div class="page-header">
          <div class="page-title">New Order</div>
        </div>
        <div class="card">
          <div class="card-body">
            <form id="new-order-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Order Date *</label>
                  <input type="date" name="Order Date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Order Source *</label>
                  <select name="Order Source" class="form-control" required>
                    ${Utils.optionsHTML(Utils.ORDER_SOURCES)}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Customer Name *</label>
                  <input type="text" name="Customer Name" class="form-control" required placeholder="Full name">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input type="tel" name="Phone Number" class="form-control" required placeholder="01X-XXX XXXX">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Hospital / Clinic</label>
                <input type="text" name="Hospital / Clinic" class="form-control" placeholder="Hospital or clinic name">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Uniform Type *</label>
                  <select name="Uniform Type" class="form-control" required>
                    ${Utils.optionsHTML(Utils.UNIFORM_TYPES)}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Closure Type *</label>
                  <select name="Closure Type" class="form-control" required>
                    ${Utils.optionsHTML(Utils.CLOSURE_TYPES)}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Quantity Ordered *</label>
                  <input type="number" name="Quantity Ordered" class="form-control" min="1" required placeholder="e.g. 6">
                </div>
                <div class="form-group">
                  <label class="form-label">Extra Quantity</label>
                  <input type="number" name="Extra Quantity" class="form-control" min="0" value="0" placeholder="e.g. 2">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Pattern Code *</label>
                <input type="text" id="pattern-code-input" name="Pattern Code" class="form-control" required placeholder="e.g. A26001" style="text-transform:uppercase" oninput="NewOrderPage.checkPatternCode(this.value)">
                <div id="pattern-code-status" class="form-hint"></div>
              </div>

              <div class="form-group">
                <label class="form-label">Remarks</label>
                <textarea name="Remarks" class="form-control" rows="2" placeholder="Optional notes"></textarea>
              </div>

              <div class="alert alert-info">
                <span>ℹ️</span>
                <span>If the Pattern Code is new, measurements will be recorded in the next step. If it already exists, existing measurements will be loaded.</span>
              </div>

              <button type="button" class="btn btn-primary btn-lg btn-full mt-4" onclick="NewOrderPage.submit()">
                Save Order & Continue →
              </button>
            </form>
          </div>
        </div>
      </div>`;
  },

  _patternExists: false,

  async checkPatternCode(code) {
    const el = document.getElementById('pattern-code-status');
    if (!code || code.length < 4) { el.textContent = ''; return; }
    try {
      const pattern = await JPMS_API.getPattern(code.toUpperCase());
      if (pattern) {
        el.innerHTML = `<span style="color:var(--green)">✓ Pattern exists — measurements will be loaded</span>`;
        this._patternExists = true;
      } else {
        el.innerHTML = `<span style="color:var(--teal)">✦ New pattern — measurements will be required next</span>`;
        this._patternExists = false;
      }
    } catch (e) {
      el.textContent = '';
    }
  },

  async submit() {
    const data = Utils.getFormData('new-order-form');
    data['Pattern Code'] = data['Pattern Code'].toUpperCase();
    if (!data['Pattern Code'] || !data['Customer Name']) {
      Utils.toast('Please fill in all required fields', 'error');
      return;
    }
    try {
      const result = await JPMS_API.createOrder({ ...data, isNewPattern: !this._patternExists });
      Utils.toast('Order saved!', 'success');
      App.navigate('measurements', data['Pattern Code']);
    } catch (e) {
      Utils.toast(e.message, 'error');
    }
  }
};

// ══════════════════════════════════════════════════════════════
// MEASUREMENTS
// ══════════════════════════════════════════════════════════════
const MeasurementsPage = {
  async render(patternCode) {
    document.getElementById('topbar-title').textContent = 'Measurements';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();

    let existing = {};
    try { existing = await JPMS_API.getMeasurements(patternCode) || {}; } catch(e) {}

    const v = (f) => existing[f] || '';

    page.innerHTML = `
      <div class="page">
        <div class="page-header">
          <div>
            <div class="page-title">Measurements</div>
            <div class="page-subtitle">Pattern: <strong>${patternCode}</strong></div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <form id="measurements-form">
              <input type="hidden" name="Pattern Code" value="${patternCode}">
              <div class="form-section-title">TOP</div>
              <div class="form-row">
                ${Utils.inchField('Shoulder','Shoulder',v('Shoulder'))}
                ${Utils.inchField('Bust','Bust',v('Bust'))}
              </div>
              <div class="form-row">
                ${Utils.inchField('Waist','Waist',v('Waist'))}
                ${Utils.inchField('Hip','Hip',v('Hip'))}
              </div>
              <div class="form-row">
                ${Utils.inchField('Sleeve Length','Sleeve Length',v('Sleeve Length'))}
                ${Utils.inchField('Top Length','Top Length',v('Top Length'))}
              </div>

              <div class="form-section-title">PANTS</div>
              <div class="form-row">
                ${Utils.inchField('Pant Waist','Pant Waist',v('Pant Waist'))}
                ${Utils.inchField('Pant Hip','Pant Hip',v('Pant Hip'))}
              </div>
              <div class="form-row">
                ${Utils.inchField('Thigh','Thigh',v('Thigh'))}
                ${Utils.inchField('Pant Length','Pant Length',v('Pant Length'))}
              </div>

              <div class="flex gap-3 mt-6">
                <button type="button" class="btn btn-secondary" onclick="App.navigate('orders')">← Back</button>
                <button type="button" class="btn btn-primary btn-full" onclick="MeasurementsPage.save('${patternCode}')">Save Measurements →</button>
              </div>
            </form>
          </div>
        </div>
      </div>`;
  },

  async save(patternCode) {
    const data = Utils.getFormData('measurements-form');
    try {
      await JPMS_API.saveMeasurements(data);
      Utils.toast('Measurements saved!', 'success');
      App.navigate('production');
    } catch (e) {
      Utils.toast(e.message, 'error');
    }
  }
};

// ══════════════════════════════════════════════════════════════
// PRODUCTION
// ══════════════════════════════════════════════════════════════
const ProductionPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Production';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const prod = await JPMS_API.getProduction();
      const active = prod.filter(p => p['Status'] !== 'Completed');
      const done = prod.filter(p => p['Status'] === 'Completed');

      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">Production</div>
          </div>
          <div class="tabs">
            <button class="tab active" onclick="ProductionPage.switchTab(this,'active')">Active (${active.length})</button>
            <button class="tab" onclick="ProductionPage.switchTab(this,'done')">Completed (${done.length})</button>
          </div>
          <div id="prod-active" class="card">
            ${active.length === 0 ? Utils.emptyHTML('🎉','All caught up!','No active production.') :
              active.map(p => productionCard(p)).join('')}
          </div>
          <div id="prod-done" class="card hidden">
            ${done.length === 0 ? Utils.emptyHTML('📋','No completed orders','') :
              done.map(p => productionCard(p)).join('')}
          </div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  switchTab(btn, which) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('prod-active').classList.toggle('hidden', which !== 'active');
    document.getElementById('prod-done').classList.toggle('hidden', which !== 'done');
  },

  async updateStatus(productionId, status) {
    try {
      await JPMS_API.updateProduction({ 'Production ID': productionId, 'Status': status });
      Utils.toast(`Status updated: ${status}`, 'success');
      this.render();
    } catch(e) { Utils.toast(e.message, 'error'); }
  }
};

function productionCard(p) {
  const statuses = ['Cutting','Sewing','QC','Completed'];
  const btns = statuses.map(s => `
    <button class="status-btn ${p['Status'] === s ? 'active' : ''}"
      onclick="ProductionPage.updateStatus('${p['Production ID']}','${s}')">${s}</button>`).join('');
  return `
    <div class="list-item" style="flex-direction:column;align-items:flex-start;gap:12px">
      <div class="flex justify-between w-full items-center">
        <div>
          <div class="list-item-title">${p['Pattern Code']}</div>
          <div class="list-item-sub">${p['Order ID']} · Total: ${p['Total Production']} pcs</div>
        </div>
        ${Utils.statusBadge(p['Status'])}
      </div>
      <div class="status-buttons w-full">${btns}</div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// PATTERN LIBRARY
// ══════════════════════════════════════════════════════════════
const PatternLibraryPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Pattern Library';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const patterns = await JPMS_API.getPatterns({ confirmed: true });
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">Pattern Library</div>
            <span class="text-muted text-sm">${patterns.length} patterns</span>
          </div>

          <div class="card mb-4">
            <div class="card-body" style="padding:12px 16px">
              <div class="flex gap-3">
                <input type="text" id="pattern-search" class="form-control" placeholder="Search pattern code or customer..." oninput="PatternLibraryPage.filter()">
                <select id="pattern-filter-type" class="form-control" style="max-width:180px" onchange="PatternLibraryPage.filter()">
                  <option value="">All Types</option>
                  ${Utils.UNIFORM_TYPES.map(t => `<option>${t}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <div id="patterns-list">
            ${patterns.length === 0 ? Utils.emptyHTML('🧵','No patterns yet','Add patterns through new orders.') :
              patterns.map(p => patternCard(p)).join('')}
          </div>
        </div>`;
      this._all = patterns;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  filter() {
    const q = document.getElementById('pattern-search').value.toLowerCase();
    const t = document.getElementById('pattern-filter-type').value;
    const filtered = (this._all || []).filter(p => {
      const matchQ = !q || p['Pattern Code'].toLowerCase().includes(q) || (p['Customer Name']||'').toLowerCase().includes(q);
      const matchT = !t || p['Uniform Type'] === t;
      return matchQ && matchT;
    });
    document.getElementById('patterns-list').innerHTML = filtered.length === 0
      ? Utils.emptyHTML('🔍','No matches','Try a different search.')
      : filtered.map(p => patternCard(p)).join('');
  }
};

function patternCard(p) {
  const origin = p['Pattern Origin'] === 'Original JIWANI Pattern' ? '🏭 JIWANI' : '💊 MEDIFORM';
  return `
    <div class="pattern-card mb-4" onclick="App.navigate('pattern-detail','${p['Pattern Code']}')">
      <div class="pattern-card-header">
        <span class="pattern-code">${p['Pattern Code']}</span>
        <div class="flex gap-2 items-center">
          ${Utils.statusBadge(p['Pattern Active'] === 'Yes' ? 'Available' : 'Archived')}
        </div>
      </div>
      <div class="pattern-meta">${origin} · ${p['Uniform Type'] || '—'} · ${p['Closure Type'] || '—'} · ${p['Customer Name'] || '—'}</div>
      ${p['Base Pattern'] ? `<div class="text-sm text-muted mb-2">Base: ${p['Base Pattern']}</div>` : ''}
      <div class="pattern-measurements">
        <div class="meas-item"><div class="meas-label">Bust</div><div class="meas-value">${p['Bust'] || '—'}"</div></div>
        <div class="meas-item"><div class="meas-label">Waist</div><div class="meas-value">${p['Waist'] || '—'}"</div></div>
        <div class="meas-item"><div class="meas-label">Hip</div><div class="meas-value">${p['Hip'] || '—'}"</div></div>
        <div class="meas-item"><div class="meas-label">Shoulder</div><div class="meas-value">${p['Shoulder'] || '—'}"</div></div>
        <div class="meas-item"><div class="meas-label">P.Waist</div><div class="meas-value">${p['Pant Waist'] || '—'}"</div></div>
        <div class="meas-item"><div class="meas-label">P.Length</div><div class="meas-value">${p['Pant Length'] || '—'}"</div></div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// PATTERN DETAIL
// ══════════════════════════════════════════════════════════════
const PatternDetailPage = {
  async render(patternCode) {
    document.getElementById('topbar-title').textContent = patternCode;
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const [pattern, family] = await Promise.all([
        JPMS_API.getPattern(patternCode),
        JPMS_API.getPatternFamily(patternCode),
      ]);
      if (!pattern) { page.innerHTML = '<div class="page"><div class="alert alert-danger">Pattern not found</div></div>'; return; }

      const children = (family?.children || []);
      const treeHTML = children.length === 0
        ? '<div class="text-muted text-sm">No derived patterns yet</div>'
        : children.map(c => `
            <div class="tree-child" onclick="App.navigate('pattern-detail','${c['Pattern Code']}')">
              ├── <strong>${c['Pattern Code']}</strong> — ${c['Customer Name'] || '—'}
            </div>`).join('');

      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div>
              <div class="page-title">${patternCode}</div>
              <div class="page-subtitle">${pattern['Pattern Origin']}</div>
            </div>
            <div class="flex gap-2">
              ${Utils.statusBadge(pattern['Confirmation Status'])}
              ${Utils.statusBadge(pattern['Pattern Active'] === 'Yes' ? 'Available' : 'Archived')}
            </div>
          </div>

          <div class="grid-2 mb-4">
            <div class="card">
              <div class="card-header"><span class="card-title">Pattern Info</span></div>
              <div class="card-body">
                ${row('Customer', pattern['Customer Name'])}
                ${row('Uniform Type', pattern['Uniform Type'])}
                ${row('Closure', pattern['Closure Type'])}
                ${row('Version', pattern['Pattern Version'])}
                ${row('Base Pattern', pattern['Base Pattern'] || '— (Original)')}
                ${row('Times Used as Base', pattern['Times Used as Base Pattern'] || 0)}
                ${row('Last Used', Utils.formatDate(pattern['Last Used as Base Pattern']))}
                ${row('Created', Utils.formatDate(pattern['Created At']))}
              </div>
            </div>

            <div class="card">
              <div class="card-header"><span class="card-title">Measurements</span></div>
              <div class="card-body">
                <div class="form-section-title" style="margin-top:0">TOP</div>
                ${row('Shoulder', num(pattern['Shoulder']))}
                ${row('Bust', num(pattern['Bust']))}
                ${row('Waist', num(pattern['Waist']))}
                ${row('Hip', num(pattern['Hip']))}
                ${row('Sleeve Length', num(pattern['Sleeve Length']))}
                ${row('Top Length', num(pattern['Top Length']))}
                <div class="form-section-title">PANTS</div>
                ${row('Pant Waist', num(pattern['Pant Waist']))}
                ${row('Pant Hip', num(pattern['Pant Hip']))}
                ${row('Thigh', num(pattern['Thigh']))}
                ${row('Pant Length', num(pattern['Pant Length']))}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">🌳 Pattern Family Tree</span></div>
            <div class="card-body">
              <div class="tree-root">${pattern['Base Pattern'] ? `${pattern['Base Pattern']} → ` : ''}${patternCode} [${pattern['Pattern Origin'] === 'Original JIWANI Pattern' ? 'Original' : 'Derived'}]</div>
              <div class="family-tree mt-2">${treeHTML}</div>
            </div>
          </div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  }
};

function row(label, value) {
  return `<div class="flex justify-between" style="padding:6px 0;border-bottom:1px solid var(--border-light)">
    <span class="text-muted text-sm">${label}</span>
    <span class="text-sm font-bold">${value || '—'}</span>
  </div>`;
}
function num(v) { return v ? `${v}"` : '—'; }

// ══════════════════════════════════════════════════════════════
// READY PATTERN INVENTORY
// ══════════════════════════════════════════════════════════════
const InventoryPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Ready Pattern Inventory';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const items = await JPMS_API.getRPI();
      this._all = items;
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">Ready Inventory</div>
          </div>
          <div class="card mb-4">
            <div class="card-body" style="padding:12px 16px">
              <div class="flex gap-3">
                <input type="text" id="inv-search" class="form-control" placeholder="Search pattern code..." oninput="InventoryPage.filter()">
                <select id="inv-filter-status" class="form-control" style="max-width:180px" onchange="InventoryPage.filter()">
                  <option value="">All Status</option>
                  <option>Available</option>
                  <option>Fully Reserved</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
          <div id="inv-list">
            ${this.renderList(items)}
          </div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  renderList(items) {
    if (items.length === 0) return Utils.emptyHTML('📦','No inventory','Inventory is created automatically after delivery.');
    return items.map(item => {
      const avail = item['_available'] ?? item['Extra Qty Remaining'];
      const reserved = item['_reserved'] ?? 0;
      const physical = item['Extra Qty Remaining'];
      const statusCls = item['_displayStatus'] === 'Available' ? 'badge-available'
        : item['_displayStatus'] === 'Fully Reserved' ? 'badge-reserved' : 'badge-out';
      return `
        <div class="pattern-card mb-3" onclick="App.navigate('inventory-detail','${item['Inventory ID']}')">
          <div class="pattern-card-header">
            <span class="pattern-code">${item['Pattern Code']}</span>
            <span class="badge ${statusCls}">${item['_displayStatus'] || item['Status']}</span>
          </div>
          <div class="pattern-meta">${item['Uniform Type']} · ${item['Closure Type']} · ${item['Original Customer Name'] || '—'}</div>
          <div class="pattern-measurements mb-3">
            <div class="meas-item"><div class="meas-label">Bust</div><div class="meas-value">${item['Bust'] || '—'}"</div></div>
            <div class="meas-item"><div class="meas-label">Waist</div><div class="meas-value">${item['Waist'] || '—'}"</div></div>
            <div class="meas-item"><div class="meas-label">Hip</div><div class="meas-value">${item['Hip'] || '—'}"</div></div>
          </div>
          <div class="pattern-stock">
            <div class="stock-item stock-phys"><div class="stock-num">${physical}</div><div class="stock-lbl">Physical</div></div>
            <div class="stock-item stock-res"><div class="stock-num">${reserved}</div><div class="stock-lbl">Reserved</div></div>
            <div class="stock-item stock-avail"><div class="stock-num">${avail}</div><div class="stock-lbl">Available</div></div>
          </div>
          <div class="text-sm text-muted mt-2">📍 ${item['Cabinet'] || '—'} · ${item['Rack'] || '—'} · ${item['Bag'] || '—'}</div>
        </div>`;
    }).join('');
  },

  filter() {
    const q = document.getElementById('inv-search').value.toLowerCase();
    const s = document.getElementById('inv-filter-status').value;
    const filtered = (this._all || []).filter(item => {
      const matchQ = !q || item['Pattern Code'].toLowerCase().includes(q);
      const matchS = !s || item['_displayStatus'] === s || item['Status'] === s;
      return matchQ && matchS;
    });
    document.getElementById('inv-list').innerHTML = this.renderList(filtered);
  }
};

// ══════════════════════════════════════════════════════════════
// PATTERN SEARCH (MEDIFORM)
// ══════════════════════════════════════════════════════════════
const PatternSearchPage = {
  _draftPatternCode: null,

  async render(draftCode) {
    if (draftCode) this._draftPatternCode = draftCode;
    document.getElementById('topbar-title').textContent = 'Pattern Search';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const items = await JPMS_API.getRPI({ status: 'Available' });
      this._all = items;
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">Pattern Search</div>
            <div class="page-subtitle">Find the closest matching pattern</div>
          </div>

          ${this._draftPatternCode ? `
            <div class="alert alert-info mb-4">
              <span>💊</span>
              <span>Selecting a pattern for <strong>${this._draftPatternCode}</strong>. Tap "Use This Pattern" to reserve.</span>
            </div>` : ''}

          <div class="card mb-4">
            <div class="card-body" style="padding:12px 16px">
              <div class="flex gap-3 mb-3">
                <input type="text" id="ps-search" class="form-control" placeholder="Search pattern code or name..." oninput="PatternSearchPage.filter()">
                <select id="ps-type" class="form-control" style="max-width:180px" onchange="PatternSearchPage.filter()">
                  <option value="">All Types</option>
                  ${Utils.UNIFORM_TYPES.map(t => `<option>${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-row">
                <div class="form-group" style="margin:0">
                  <label class="form-label">Bust range (inches)</label>
                  <div class="flex gap-2 items-center">
                    <input type="number" id="ps-bust-min" class="form-control" placeholder="Min" step="0.5" oninput="PatternSearchPage.filter()">
                    <span>–</span>
                    <input type="number" id="ps-bust-max" class="form-control" placeholder="Max" step="0.5" oninput="PatternSearchPage.filter()">
                  </div>
                </div>
                <div class="form-group" style="margin:0">
                  <label class="form-label">Hip range (inches)</label>
                  <div class="flex gap-2 items-center">
                    <input type="number" id="ps-hip-min" class="form-control" placeholder="Min" step="0.5" oninput="PatternSearchPage.filter()">
                    <span>–</span>
                    <input type="number" id="ps-hip-max" class="form-control" placeholder="Max" step="0.5" oninput="PatternSearchPage.filter()">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="ps-results">${this.renderResults(items)}</div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  renderResults(items) {
    if (items.length === 0) return Utils.emptyHTML('🔍','No patterns found','Try adjusting your search filters.');
    return items.map(item => {
      const avail = item['_available'] ?? item['Extra Qty Remaining'];
      const reserved = item['_reserved'] ?? 0;
      const physical = item['Extra Qty Remaining'];
      const status = item['_displayStatus'] || item['Status'];
      const statusCls = status === 'Available' ? 'badge-available'
        : status === 'Fully Reserved' ? 'badge-reserved' : 'badge-out';

      let actionBtn = '';
      if (this._draftPatternCode && status === 'Available') {
        actionBtn = `<button class="btn btn-primary btn-sm" onclick="PatternSearchPage.selectPattern('${item['Inventory ID']}','${item['Pattern Code']}',event)">Use This Pattern</button>`;
      } else if (status === 'Fully Reserved') {
        actionBtn = `<span class="text-sm text-muted">Reserved · ${item['_earliestExpiry'] ? 'Frees: ~' + Utils.formatDateTime(item['_earliestExpiry']) : ''}</span>`;
      }

      return `
        <div class="pattern-card mb-3">
          <div class="pattern-card-header">
            <span class="pattern-code">${item['Pattern Code']}</span>
            <span class="badge ${statusCls}">${status}</span>
          </div>
          <div class="pattern-meta">${item['Uniform Type']} · ${item['Closure Type']} · ${item['Original Customer Name'] || '—'}</div>
          <div class="pattern-measurements mb-3">
            <div class="meas-item"><div class="meas-label">Bust</div><div class="meas-value">${item['Bust'] || '—'}"</div></div>
            <div class="meas-item"><div class="meas-label">Waist</div><div class="meas-value">${item['Waist'] || '—'}"</div></div>
            <div class="meas-item"><div class="meas-label">Hip</div><div class="meas-value">${item['Hip'] || '—'}"</div></div>
          </div>
          <div class="pattern-stock mb-3">
            <div class="stock-item stock-phys"><div class="stock-num">${physical}</div><div class="stock-lbl">Physical</div></div>
            <div class="stock-item stock-res"><div class="stock-num">${reserved}</div><div class="stock-lbl">Reserved</div></div>
            <div class="stock-item stock-avail"><div class="stock-num">${avail}</div><div class="stock-lbl">Available</div></div>
          </div>
          <div class="pattern-card-actions">
            ${actionBtn}
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('inventory-detail','${item['Inventory ID']}')">View Details</button>
          </div>
        </div>`;
    }).join('');
  },

  filter() {
    const q = (document.getElementById('ps-search').value || '').toLowerCase();
    const t = document.getElementById('ps-type').value;
    const bustMin = parseFloat(document.getElementById('ps-bust-min').value) || 0;
    const bustMax = parseFloat(document.getElementById('ps-bust-max').value) || 999;
    const hipMin  = parseFloat(document.getElementById('ps-hip-min').value) || 0;
    const hipMax  = parseFloat(document.getElementById('ps-hip-max').value) || 999;

    const filtered = (this._all || []).filter(item => {
      const matchQ = !q || item['Pattern Code'].toLowerCase().includes(q);
      const matchT = !t || item['Uniform Type'] === t;
      const bust = parseFloat(item['Bust']) || 0;
      const hip  = parseFloat(item['Hip']) || 0;
      const matchB = bust >= bustMin && bust <= bustMax;
      const matchH = hip >= hipMin && hip <= hipMax;
      return matchQ && matchT && matchB && matchH;
    });
    document.getElementById('ps-results').innerHTML = this.renderResults(filtered);
  },

  async selectPattern(inventoryId, patternCode, e) {
    e.stopPropagation();
    if (!this._draftPatternCode) {
      Utils.toast('No draft pattern set. Start from New Customer.', 'warning');
      return;
    }
    try {
      const result = await JPMS_API.createReservation({
        'Inventory ID': inventoryId,
        'Pattern Code': patternCode,
        'Draft Pattern Code': this._draftPatternCode,
      });
      Utils.toast(`Reserved! Expires in 60 min`, 'success');
      App.navigate('mediform-new', this._draftPatternCode + '|' + inventoryId + '|' + patternCode + '|' + result.reservationId);
    } catch(e) {
      Utils.toast(e.message, 'error');
    }
  }
};

// ══════════════════════════════════════════════════════════════
// MEDIFORM NEW CUSTOMER
// ══════════════════════════════════════════════════════════════
const MediformNewPage = {
  _state: null,

  async render(params) {
    document.getElementById('topbar-title').textContent = 'New MEDIFORM Customer';
    if (params) {
      const [draftCode, invId, baseCode, resId] = params.split('|');
      this._state = { draftCode, invId, baseCode, resId, confirmed: false };
    }

    const page = document.getElementById('page-content');
    const state = this._state;

    page.innerHTML = `
      <div class="page">
        <div class="page-header">
          <div class="page-title">New MEDIFORM Customer</div>
          ${state ? (state.confirmed
            ? `<span class="badge badge-confirmed">CONFIRMED 🟢</span>`
            : `<span class="badge badge-draft">DRAFT 🟡</span>`) : ''}
        </div>

        ${state ? `
          <div class="card mb-4">
            <div class="card-header"><span class="card-title">Base Pattern</span></div>
            <div class="card-body">
              ${state.confirmed
                ? `<div class="alert alert-success" style="margin:0">✓ <strong>${state.baseCode}</strong> — Locked. Base Pattern confirmed.</div>`
                : `
                  <div class="alert alert-warning" style="margin:0">
                    🟡 <strong>${state.baseCode}</strong> — Reserved for you.
                    <span id="expiry-timer" class="expiry-timer ml-2"></span>
                  </div>
                  <div class="flex gap-3 mt-3">
                    <button class="btn btn-ghost btn-sm" onclick="MediformNewPage.changeBasePattern()">↩ Change Base Pattern</button>
                    <button class="btn btn-primary btn-sm" onclick="MediformNewPage.confirmBase()">✓ Confirm Base Pattern</button>
                  </div>`}
            </div>
          </div>` : `
          <div class="alert alert-info mb-4">
            <span>ℹ️</span>
            <span>No Base Pattern selected yet. <a href="#" onclick="App.navigate('pattern-search')">Search patterns →</a></span>
          </div>`}

        <div class="card">
          <div class="card-body">
            <form id="mediform-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Customer Code *</label>
                  <input type="text" name="Customer Code" class="form-control" required placeholder="e.g. M26001" style="text-transform:uppercase" value="${state?.draftCode || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Order Date</label>
                  <input type="date" name="Order Date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Customer Name *</label>
                  <input type="text" name="Customer Name" class="form-control" required placeholder="Full name">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone *</label>
                  <input type="tel" name="Phone" class="form-control" required placeholder="01X-XXX XXXX">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Hospital</label>
                <input type="text" name="Hospital" class="form-control" placeholder="Hospital or clinic">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Height (optional)</label>
                  <input type="number" name="Height" class="form-control" placeholder="cm">
                </div>
                <div class="form-group">
                  <label class="form-label">Weight (optional)</label>
                  <input type="number" name="Weight" class="form-control" placeholder="kg">
                </div>
              </div>

              <div class="form-section-title">MEASUREMENTS — TOP</div>
              <div class="form-row">
                ${Utils.inchField('Shoulder','Shoulder','')}
                ${Utils.inchField('Bust','Bust','')}
              </div>
              <div class="form-row">
                ${Utils.inchField('Waist','Waist','')}
                ${Utils.inchField('Hip','Hip','')}
              </div>
              <div class="form-row">
                ${Utils.inchField('Sleeve Length','Sleeve Length','')}
                ${Utils.inchField('Top Length','Top Length','')}
              </div>

              <div class="form-section-title">MEASUREMENTS — PANTS</div>
              <div class="form-row">
                ${Utils.inchField('Pant Waist','Pant Waist','')}
                ${Utils.inchField('Pant Hip','Pant Hip','')}
              </div>
              <div class="form-row">
                ${Utils.inchField('Thigh','Thigh','')}
                ${Utils.inchField('Pant Length','Pant Length','')}
              </div>

              <div class="form-group">
                <label class="form-label">Alteration Notes</label>
                <textarea name="Alteration Notes" class="form-control" rows="2" placeholder="Notes about adjustments needed"></textarea>
              </div>
            </form>
          </div>
        </div>

        <div class="alert alert-warning mt-4">
          ⚠️ Inventory is not deducted until the Base Pattern is confirmed.
        </div>

        <div class="flex gap-3 mt-4">
          <button class="btn btn-secondary" onclick="MediformNewPage.cancelDraft()">✕ Cancel Draft</button>
          <button class="btn btn-secondary" onclick="MediformNewPage.saveDraft()">Save Draft</button>
          ${state?.confirmed
            ? `<button class="btn btn-primary btn-full" onclick="MediformNewPage.saveCustomer()">Save Customer → Alteration</button>`
            : `<button class="btn btn-primary btn-full" onclick="MediformNewPage.saveCustomer()">Save Customer</button>`}
        </div>
      </div>`;

    if (state && !state.confirmed) {
      this._startTimer();
    }
  },

  _timerInterval: null,
  _expiryTime: null,

  _startTimer() {
    if (this._timerInterval) clearInterval(this._timerInterval);
    // Expiry would be set when reservation was created; approximate 60 min from now
    if (!this._expiryTime) this._expiryTime = Date.now() + 60 * 60 * 1000;
    this._timerInterval = setInterval(() => {
      const el = document.getElementById('expiry-timer');
      if (!el) { clearInterval(this._timerInterval); return; }
      const t = Utils.timeUntil(this._expiryTime);
      el.textContent = t;
      if (t === 'Expired') el.classList.add('urgent');
    }, 1000);
  },

  async changeBasePattern() {
    // Cancel current reservation
    if (this._state?.resId) {
      try { await JPMS_API.cancelReservation({ 'Reservation ID': this._state.resId }); } catch(e){}
    }
    const draftCode = this._state?.draftCode || '';
    this._state = null;
    this._expiryTime = null;
    App.navigate('pattern-search', draftCode);
  },

  async confirmBase() {
    if (!this._state) return;
    try {
      await JPMS_API.confirmReservation({
        'Reservation ID': this._state.resId,
        'confirmedPatternCode': this._state.draftCode,
      });
      this._state.confirmed = true;
      if (this._timerInterval) clearInterval(this._timerInterval);
      Utils.toast('Base Pattern confirmed! Inventory deducted.', 'success');
      this.render();
    } catch(e) {
      Utils.toast(e.message, 'error');
    }
  },

  async cancelDraft() {
    if (this._state?.resId) {
      try { await JPMS_API.cancelReservation({ 'Reservation ID': this._state.resId, Notes: 'User cancelled draft' }); } catch(e){}
    }
    this._state = null;
    Utils.toast('Draft cancelled', 'warning');
    App.navigate('mediform-customers');
  },

  async saveDraft() {
    Utils.toast('Draft saved', 'success');
  },

  async saveCustomer() {
    const data = Utils.getFormData('mediform-form');
    data['Customer Code'] = (data['Customer Code'] || '').toUpperCase();
    if (!data['Customer Code'] || !data['Customer Name']) {
      Utils.toast('Customer Code and Name are required', 'error');
      return;
    }
    if (this._state) {
      data['Reference Pattern'] = this._state.baseCode || '';
      data['Current Pattern'] = this._state.draftCode || '';
    }
    try {
      await JPMS_API.createMediformCustomer(data);
      Utils.toast('Customer saved!', 'success');
      if (this._timerInterval) clearInterval(this._timerInterval);
      App.navigate('alteration', data['Customer Code'] + '|' + (this._state?.draftCode || ''));
    } catch(e) {
      Utils.toast(e.message, 'error');
    }
  }
};

// ══════════════════════════════════════════════════════════════
// MEDIFORM CUSTOMERS LIST
// ══════════════════════════════════════════════════════════════
const MediformCustomersPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'MEDIFORM Customers';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const customers = await JPMS_API.getMediformCustomers();
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">MEDIFORM Customers</div>
            <button class="btn btn-primary" onclick="App.navigate('mediform-new')">+ New Customer</button>
          </div>
          <div class="card mb-4">
            <div class="card-body" style="padding:12px 16px">
              <input type="text" id="mc-search" class="form-control" placeholder="Search name, code, phone, hospital..." oninput="MediformCustomersPage.filter()">
            </div>
          </div>
          <div id="mc-list" class="card">
            ${this.renderList(customers)}
          </div>
        </div>`;
      this._all = customers;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  renderList(customers) {
    if (customers.length === 0) return Utils.emptyHTML('👤','No customers yet','Add your first MEDIFORM customer.');
    return customers.map(c => `
      <div class="list-item" onclick="App.navigate('mediform-detail','${c['Customer Code']}')">
        <div class="list-item-main">
          <div class="list-item-title">${c['Customer Name']}</div>
          <div class="list-item-sub">${c['Customer Code']} · ${c['Hospital'] || '—'} · ${c['Phone'] || '—'}</div>
          <div class="list-item-sub">Pattern: ${c['Current Pattern'] || '—'}</div>
        </div>
        <span class="text-muted">›</span>
      </div>`).join('');
  },

  filter() {
    const q = document.getElementById('mc-search').value.toLowerCase();
    const filtered = (this._all || []).filter(c =>
      !q ||
      (c['Customer Name']||'').toLowerCase().includes(q) ||
      (c['Customer Code']||'').toLowerCase().includes(q) ||
      (c['Phone']||'').toLowerCase().includes(q) ||
      (c['Hospital']||'').toLowerCase().includes(q)
    );
    document.getElementById('mc-list').innerHTML = this.renderList(filtered);
  }
};

// ══════════════════════════════════════════════════════════════
// MEDIFORM CUSTOMER DETAIL
// ══════════════════════════════════════════════════════════════
const MediformDetailPage = {
  async render(customerCode) {
    document.getElementById('topbar-title').textContent = customerCode;
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const { customer: c, alterations, shipping } = await JPMS_API.getMediformCustomer(customerCode);
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">${c['Customer Name']}</div>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('repeat-order','${customerCode}')">🔁 Repeat Order</button>
          </div>

          <div class="grid-2 mb-4">
            <div class="card">
              <div class="card-header"><span class="card-title">Customer Info</span></div>
              <div class="card-body">
                ${row('Code', c['Customer Code'])}
                ${row('Phone', c['Phone'])}
                ${row('Hospital', c['Hospital'])}
                ${row('Reference Pattern', c['Reference Pattern'])}
                ${row('Current Pattern', c['Current Pattern'])}
                ${row('Created', Utils.formatDate(c['Created At']))}
              </div>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Measurements</span></div>
              <div class="card-body">
                ${row('Bust', num(c['Bust']))} ${row('Waist', num(c['Waist']))} ${row('Hip', num(c['Hip']))}
                ${row('Shoulder', num(c['Shoulder']))} ${row('Sleeve', num(c['Sleeve Length']))} ${row('Top Length', num(c['Top Length']))}
                ${row('P.Waist', num(c['Pant Waist']))} ${row('P.Hip', num(c['Pant Hip']))} ${row('P.Length', num(c['Pant Length']))}
              </div>
            </div>
          </div>

          ${alterations.length > 0 ? `
          <div class="card mb-4">
            <div class="card-header"><span class="card-title">Alteration History</span></div>
            <div class="card-body">
              ${alterations.map(a => `
                <div class="mb-3 pb-3" style="border-bottom:1px solid var(--border-light)">
                  <div class="flex justify-between"><strong>${a['Pattern Code']}</strong><span class="text-muted text-sm">${Utils.formatDate(a['Created At'])}</span></div>
                  <div class="text-sm text-muted mt-1">
                    ${adjLine('Bust', a['Bust Adj'])} ${adjLine('Waist', a['Waist Adj'])} ${adjLine('Hip', a['Hip Adj'])}
                    ${adjLine('Sleeve', a['Sleeve Adj'])} ${adjLine('P.Length', a['Pant Length Adj'])}
                  </div>
                  ${a['Remarks'] ? `<div class="text-sm mt-1">${a['Remarks']}</div>` : ''}
                </div>`).join('')}
            </div>
          </div>` : ''}

          <div class="flex gap-3">
            <button class="btn btn-primary" onclick="App.navigate('alteration','${customerCode}|${c['Current Pattern']}')">+ New Alteration</button>
            <button class="btn btn-secondary" onclick="App.navigate('shipping-new','${customerCode}')">+ Shipping</button>
          </div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  }
};

function adjLine(label, val) {
  if (!val || val == 0) return '';
  return `<span style="margin-right:8px">${label}: <strong>${val > 0 ? '+' : ''}${val}"</strong></span>`;
}

// ══════════════════════════════════════════════════════════════
// ALTERATION
// ══════════════════════════════════════════════════════════════
const AlterationPage = {
  render(params) {
    const [customerCode, patternCode] = (params || '|').split('|');
    document.getElementById('topbar-title').textContent = 'Alteration';
    document.getElementById('page-content').innerHTML = `
      <div class="page">
        <div class="page-header">
          <div class="page-title">Alteration</div>
          <div class="page-subtitle">Customer: ${customerCode} · Pattern: ${patternCode}</div>
        </div>
        <div class="alert alert-info mb-4">
          ℹ️ Enter adjustments in inches. Use positive values to add, negative to reduce.
        </div>
        <div class="card">
          <div class="card-body">
            <form id="alt-form">
              <input type="hidden" name="Customer Code" value="${customerCode}">
              <input type="hidden" name="Pattern Code" value="${patternCode}">
              <div class="form-section-title">TOP ADJUSTMENTS</div>
              <div class="form-row">
                ${adjField('Bust Adj','Bust')} ${adjField('Waist Adj','Waist')}
              </div>
              <div class="form-row">
                ${adjField('Hip Adj','Hip')} ${adjField('Sleeve Adj','Sleeve')}
              </div>
              <div class="form-row">
                ${adjField('Top Length Adj','Top Length')} <div></div>
              </div>
              <div class="form-section-title">PANTS ADJUSTMENTS</div>
              <div class="form-row">
                ${adjField('Pant Waist Adj','Pant Waist')} ${adjField('Pant Hip Adj','Pant Hip')}
              </div>
              <div class="form-row">
                ${adjField('Pant Thigh Adj','Pant Thigh')} ${adjField('Pant Length Adj','Pant Length')}
              </div>
              <div class="form-group">
                <label class="form-label">Remarks</label>
                <textarea name="Remarks" class="form-control" rows="2" placeholder="Notes about alterations"></textarea>
              </div>
              <button type="button" class="btn btn-primary btn-lg btn-full mt-4" onclick="AlterationPage.save()">Save Alteration</button>
            </form>
          </div>
        </div>
      </div>`;
  },

  async save() {
    const data = Utils.getFormData('alt-form');
    try {
      await JPMS_API.createAlteration(data);
      Utils.toast('Alteration saved!', 'success');
      App.navigate('shipping-new', data['Customer Code']);
    } catch(e) {
      Utils.toast(e.message, 'error');
    }
  }
};

function adjField(name, label) {
  return `
    <div class="form-group">
      <label class="form-label">${label} Adjustment</label>
      <div class="flex items-center gap-2">
        <input type="number" name="${name}" class="form-control" value="0" step="0.25">
        <span class="text-muted text-sm">in</span>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// SHIPPING
// ══════════════════════════════════════════════════════════════
const ShippingPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Shipping';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const shipments = await JPMS_API.getShipping();
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">Shipping</div>
          </div>
          <div class="alert alert-info mb-4">
            ℹ️ Shipping records logistics only. Inventory was already deducted when the Base Pattern was confirmed.
          </div>
          <div class="card">
            ${shipments.length === 0 ? Utils.emptyHTML('📦','No shipments','Create shipments from customer records.') :
              shipments.map(s => `
                <div class="list-item" onclick="ShippingPage.editStatus('${s['Shipping ID']}','${s['Status']}')">
                  <div class="list-item-main">
                    <div class="list-item-title">${s['Customer Code']} · ${s['Pattern Code']}</div>
                    <div class="list-item-sub">${s['Courier'] || '—'} · ${s['Tracking Number'] || 'No tracking'}</div>
                    <div class="list-item-sub">${Utils.formatDateTime(s['Status Updated At'])}</div>
                  </div>
                  <div class="list-item-right">
                    ${Utils.statusBadge(s['Status'])}
                    <span class="text-muted">›</span>
                  </div>
                </div>`).join('')}
          </div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  editStatus(shippingId, currentStatus) {
    Utils.showModal('Update Shipping Status', `
      <div class="form-group">
        <label class="form-label">New Status</label>
        <select id="new-ship-status" class="form-control">
          ${Utils.optionsHTML(Utils.SHIPPING_STATUSES, currentStatus)}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tracking Number</label>
        <input type="text" id="new-ship-tracking" class="form-control" placeholder="Courier tracking number">
      </div>
      <div class="form-group">
        <label class="form-label">Courier</label>
        <input type="text" id="new-ship-courier" class="form-control" placeholder="e.g. Pos Laju, J&T">
      </div>`,
      [
        { id: 'save', label: 'Update', cls: 'btn-primary btn-full', onClick: async () => {
          await JPMS_API.updateShipping({
            'Shipping ID': shippingId,
            'Status': document.getElementById('new-ship-status').value,
            'Tracking Number': document.getElementById('new-ship-tracking').value,
            'Courier': document.getElementById('new-ship-courier').value,
          });
          Utils.hideModal();
          Utils.toast('Shipping updated', 'success');
          this.render();
        }}
      ]
    );
  }
};

// New Shipping
const ShippingNewPage = {
  render(customerCode) {
    document.getElementById('topbar-title').textContent = 'New Shipment';
    document.getElementById('page-content').innerHTML = `
      <div class="page">
        <div class="page-header"><div class="page-title">New Shipment</div></div>
        <div class="card">
          <div class="card-body">
            <form id="ship-form">
              <div class="form-group">
                <label class="form-label">Customer Code</label>
                <input type="text" name="Customer Code" class="form-control" value="${customerCode || ''}" placeholder="M26001">
              </div>
              <div class="form-group">
                <label class="form-label">Pattern Code</label>
                <input type="text" name="Pattern Code" class="form-control" placeholder="M26001">
              </div>
              <div class="form-group">
                <label class="form-label">Courier</label>
                <input type="text" name="Courier" class="form-control" placeholder="e.g. Pos Laju, J&T, Ninja Van">
              </div>
              <div class="form-group">
                <label class="form-label">Tracking Number</label>
                <input type="text" name="Tracking Number" class="form-control" placeholder="Courier tracking number">
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select name="Status" class="form-control">
                  ${Utils.optionsHTML(Utils.SHIPPING_STATUSES, 'Pending')}
                </select>
              </div>
            </form>
          </div>
        </div>
        <button class="btn btn-primary btn-lg btn-full mt-4" onclick="ShippingNewPage.save()">Create Shipment</button>
      </div>`;
  },

  async save() {
    const data = Utils.getFormData('ship-form');
    try {
      await JPMS_API.createShipping(data);
      Utils.toast('Shipment created!', 'success');
      App.navigate('shipping');
    } catch(e) {
      Utils.toast(e.message, 'error');
    }
  }
};

// ══════════════════════════════════════════════════════════════
// REPEAT ORDER
// ══════════════════════════════════════════════════════════════
const RepeatOrderPage = {
  async render(customerCode) {
    document.getElementById('topbar-title').textContent = 'Repeat Order';
    const page = document.getElementById('page-content');

    if (!customerCode) {
      page.innerHTML = `
        <div class="page">
          <div class="page-title mb-4">Repeat Order</div>
          <div class="card">
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Search Customer</label>
                <input type="text" id="ro-search" class="form-control" placeholder="Name, code, or phone...">
              </div>
              <button class="btn btn-primary btn-full mt-2" onclick="RepeatOrderPage.search()">Search</button>
            </div>
          </div>
          <div id="ro-results" class="mt-4"></div>
        </div>`;
      return;
    }

    page.innerHTML = Utils.loadingHTML();
    try {
      const { customer: c, alterations } = await JPMS_API.getMediformCustomer(customerCode);
      const lastAlt = alterations[alterations.length - 1] || {};
      page.innerHTML = `
        <div class="page">
          <div class="page-header">
            <div class="page-title">Repeat Order</div>
          </div>
          <div class="card mb-4">
            <div class="card-header"><span class="card-title">${c['Customer Name']}</span></div>
            <div class="card-body">
              ${row('Current Pattern', c['Current Pattern'])}
              ${row('Base Pattern', c['Reference Pattern'])}
              ${row('Hospital', c['Hospital'])}
              ${row('Bust', num(c['Bust']))} ${row('Waist', num(c['Waist']))} ${row('Hip', num(c['Hip']))}
              ${row('Pant Length', num(c['Pant Length']))}
            </div>
          </div>

          ${Object.keys(lastAlt).length > 0 ? `
          <div class="card mb-4">
            <div class="card-header"><span class="card-title">Last Alteration</span></div>
            <div class="card-body text-sm text-muted">
              ${adjLine('Bust', lastAlt['Bust Adj'])}
              ${adjLine('Waist', lastAlt['Waist Adj'])}
              ${adjLine('Hip', lastAlt['Hip Adj'])}
              ${adjLine('P.Length', lastAlt['Pant Length Adj'])}
              ${lastAlt['Remarks'] || ''}
            </div>
          </div>` : ''}

          <div class="card mb-4">
            <div class="card-body text-center">
              <div class="font-bold mb-2">Are measurements still valid?</div>
            </div>
            <div class="card-footer flex gap-3">
              <button class="btn btn-green btn-full" onclick="RepeatOrderPage.produceSame('${customerCode}','${c['Current Pattern']}')">
                ✓ Yes — Produce with ${c['Current Pattern']}
              </button>
              <button class="btn btn-ghost btn-full" onclick="App.navigate('mediform-new')">
                ✎ No — Update Measurements
              </button>
            </div>
          </div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  async search() {
    const q = document.getElementById('ro-search').value;
    const results = await JPMS_API.getMediformCustomers({ search: q });
    document.getElementById('ro-results').innerHTML = results.length === 0
      ? Utils.emptyHTML('🔍','No customers found','')
      : `<div class="card">${results.map(c => `
          <div class="list-item" onclick="App.navigate('repeat-order','${c['Customer Code']}')">
            <div class="list-item-main">
              <div class="list-item-title">${c['Customer Name']}</div>
              <div class="list-item-sub">${c['Customer Code']} · ${c['Phone'] || '—'}</div>
            </div><span class="text-muted">›</span>
          </div>`).join('')}</div>`;
  },

  async produceSame(customerCode, patternCode) {
    Utils.toast(`Producing with pattern ${patternCode}`, 'success');
    App.navigate('shipping-new', customerCode);
  }
};

// ══════════════════════════════════════════════════════════════
// DELIVERY MODULE
// ══════════════════════════════════════════════════════════════
const DeliveryPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Delivery';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const orders = await JPMS_API.getOrders({ status: 'QC' });
      page.innerHTML = `
        <div class="page">
          <div class="page-header"><div class="page-title">Delivery</div></div>
          <div class="card">
            ${orders.length === 0 ? Utils.emptyHTML('✅','No orders ready for delivery','Orders marked QC will appear here.') :
              orders.map(o => `
                <div class="list-item">
                  <div class="list-item-main">
                    <div class="list-item-title">${o['Customer Name']}</div>
                    <div class="list-item-sub">${o['Pattern Code']} · ${o['Quantity Ordered']} pcs · Extra: ${o['Extra Quantity']}</div>
                  </div>
                  <button class="btn btn-green btn-sm" onclick="DeliveryPage.markDelivered('${o['Order ID']}','${o['Extra Quantity']}')">
                    Mark Delivered
                  </button>
                </div>`).join('')}
          </div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  async markDelivered(orderId, extraQty) {
    const extra = parseInt(extraQty) || 0;
    const msg = extra > 0
      ? `Mark as delivered? ${extra} extra piece(s) will be added to Ready Pattern Inventory.`
      : 'Mark this order as delivered?';

    Utils.showModal('Mark Delivered', `<p>${msg}</p>`, [
      { id: 'confirm', label: 'Confirm Delivery', cls: 'btn-green btn-full', onClick: async () => {
        await JPMS_API.completeDelivery({ 'Order ID': orderId });
        Utils.hideModal();
        Utils.toast('Order delivered' + (extra > 0 ? ' · Inventory created!' : ''), 'success');
        this.render();
      }}
    ]);
  }
};

// ══════════════════════════════════════════════════════════════
// GLOBAL SEARCH PAGE
// ══════════════════════════════════════════════════════════════
const SearchPage = {
  async render(q) {
    document.getElementById('topbar-title').textContent = 'Search';
    const page = document.getElementById('page-content');
    page.innerHTML = `
      <div class="page">
        <div class="page-title mb-4">Global Search</div>
        <div class="card mb-4">
          <div class="card-body" style="padding:12px 16px">
            <input type="text" id="global-search-input" class="form-control" placeholder="Search customers, patterns, orders, phones..." value="${q||''}" oninput="SearchPage.search(this.value)">
          </div>
        </div>
        <div id="search-results">${q ? Utils.loadingHTML('Searching...') : Utils.emptyHTML('🔍','Start typing','Search by name, pattern code, phone, or hospital.')}</div>
      </div>`;

    if (q) this.search(q);
  },

  _timer: null,
  search(q) {
    clearTimeout(this._timer);
    if (!q || q.length < 2) {
      document.getElementById('search-results').innerHTML = Utils.emptyHTML('🔍','Type to search','Minimum 2 characters.');
      return;
    }
    document.getElementById('search-results').innerHTML = Utils.loadingHTML('Searching...');
    this._timer = setTimeout(async () => {
      try {
        const { results } = await JPMS_API.globalSearch(q);
        const el = document.getElementById('search-results');
        if (!results.length) { el.innerHTML = Utils.emptyHTML('😔','No results','Try different keywords.'); return; }

        const grouped = {};
        results.forEach(r => {
          if (!grouped[r.type]) grouped[r.type] = [];
          grouped[r.type].push(r);
        });

        el.innerHTML = Object.entries(grouped).map(([type, items]) => `
          <div class="mb-4">
            <div class="form-section-title">${type}</div>
            <div class="card">
              ${items.map(r => `
                <div class="list-item" onclick="SearchPage.open('${r.type}','${r.id}')">
                  <div class="list-item-main">
                    <div class="list-item-title">${r.label}</div>
                    <div class="list-item-sub">${r.sub}</div>
                  </div>
                  <span class="text-muted">›</span>
                </div>`).join('')}
            </div>
          </div>`).join('');
      } catch(e) {
        document.getElementById('search-results').innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
      }
    }, 400);
  },

  open(type, id) {
    const map = {
      'Order': 'order-detail',
      'Pattern': 'pattern-detail',
      'MEDIFORM Customer': 'mediform-detail',
    };
    if (map[type]) App.navigate(map[type], id);
  }
};

// ══════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════
const SettingsPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Settings';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const settings = await JPMS_API.getSettings();
      const map = {};
      settings.forEach(s => { map[s['Setting Key']] = s['Setting Value']; });

      page.innerHTML = `
        <div class="page">
          <div class="page-title mb-6">Settings</div>

          <div class="card mb-4">
            <div class="card-header"><span class="card-title">App Configuration</span></div>
            <div class="card-body">
              ${settingField('app_name','App Name', map)}
              ${settingField('business_name','Business Name', map)}
              ${settingField('mediform_name','MEDIFORM Name', map)}
              ${settingField('reservation_expiry_minutes','Reservation Expiry (minutes)', map)}
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header"><span class="card-title">Access Control</span></div>
            <div class="card-body">
              ${settingField('admin_emails','Admin Emails (comma-separated)', map)}
              ${settingField('factory_emails','Factory Staff Emails (comma-separated)', map)}
              ${settingField('mediform_emails','MEDIFORM Staff Emails (comma-separated)', map)}
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header"><span class="card-title">Google Integration</span></div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Apps Script URL</label>
                <input type="url" id="script-url-field" class="form-control" value="${localStorage.getItem('jpms_script_url')||''}" placeholder="https://script.google.com/macros/s/...">
                <div class="form-hint">Your deployed Google Apps Script Web App URL</div>
              </div>
              <div class="form-group">
                <label class="form-label">Google OAuth Client ID</label>
                <input type="text" id="client-id-field" class="form-control" value="${localStorage.getItem('jpms_client_id')||''}" placeholder="Your Google OAuth Client ID">
              </div>
              <button class="btn btn-primary" onclick="SettingsPage.saveLocal()">Save Connection Settings</button>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" onclick="SettingsPage.saveAll()">Save All Settings</button>
        </div>`;
      this._settings = settings;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  saveLocal() {
    localStorage.setItem('jpms_script_url', document.getElementById('script-url-field').value);
    localStorage.setItem('jpms_client_id', document.getElementById('client-id-field').value);
    Utils.toast('Connection settings saved! Reload to apply.', 'success');
  },

  async saveAll() {
    const keys = ['app_name','business_name','mediform_name','reservation_expiry_minutes','admin_emails','factory_emails','mediform_emails'];
    for (const key of keys) {
      const el = document.getElementById('setting-' + key);
      if (el) {
        try { await JPMS_API.updateSetting({ key, value: el.value }); } catch(e) {}
      }
    }
    Utils.toast('Settings saved!', 'success');
  }
};

function settingField(key, label, map) {
  return `
    <div class="form-group">
      <label class="form-label">${label}</label>
      <input type="text" id="setting-${key}" class="form-control" value="${map[key]||''}">
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// RESERVATIONS PAGE
// ══════════════════════════════════════════════════════════════
const ReservationsPage = {
  async render() {
    document.getElementById('topbar-title').textContent = 'Inventory Reservations';
    const page = document.getElementById('page-content');
    page.innerHTML = Utils.loadingHTML();
    try {
      const all = await JPMS_API.getReservations();
      const active = all.filter(r => r['Status'] === 'Active');
      const history = all.filter(r => r['Status'] !== 'Active');
      page.innerHTML = `
        <div class="page">
          <div class="page-header"><div class="page-title">Reservations</div></div>
          <div class="tabs">
            <button class="tab active" onclick="ReservationsPage.switchTab(this,'active')">Active (${active.length})</button>
            <button class="tab" onclick="ReservationsPage.switchTab(this,'history')">History (${history.length})</button>
          </div>
          <div id="res-active" class="card">
            ${active.length === 0 ? Utils.emptyHTML('✅','No active reservations','') :
              active.map(r => reservationRow(r)).join('')}
          </div>
          <div id="res-history" class="card hidden">
            ${history.length === 0 ? Utils.emptyHTML('📋','No history','') :
              history.map(r => reservationRow(r)).join('')}
          </div>
        </div>`;
    } catch(e) {
      page.innerHTML = `<div class="page"><div class="alert alert-danger">${e.message}</div></div>`;
    }
  },

  switchTab(btn, which) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('res-active').classList.toggle('hidden', which !== 'active');
    document.getElementById('res-history').classList.toggle('hidden', which !== 'history');
  }
};

function reservationRow(r) {
  return `
    <div class="list-item">
      <div class="list-item-main">
        <div class="list-item-title">${r['Draft Pattern Code']} ← ${r['Pattern Code']}</div>
        <div class="list-item-sub">By: ${r['Reserved By Staff']} · ${Utils.formatDateTime(r['Reserved At'])}</div>
        ${r['Status'] === 'Active' ? `<div class="expiry-timer mt-1" id="timer-${r['Reservation ID']}">${Utils.timeUntil(r['Reservation Expiry'])}</div>` : ''}
      </div>
      ${Utils.statusBadge(r['Status'])}
    </div>`;
}
