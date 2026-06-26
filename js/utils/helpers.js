// JPMS Utilities

const Utils = (() => {

  // ── DATE / TIME ──
  function formatDate(val) {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d)) return String(val);
    return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateTime(val) {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d)) return String(val);
    return d.toLocaleString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function timeUntil(val) {
    if (!val) return null;
    const diff = new Date(val) - Date.now();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  // ── VALIDATION ──
  function validatePatternCode(code) {
    if (!code || !code.trim()) return 'Pattern Code is required';
    if (code.trim().length < 4) return 'Pattern Code must be at least 4 characters';
    return null;
  }

  function validateCustomerCode(code) {
    if (!code || !code.trim()) return 'Customer Code is required';
    return null;
  }

  function validateInches(val, label) {
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) return `${label} must be a positive number`;
    if (n > 100) return `${label} seems too large`;
    return null;
  }

  // ── STATUS BADGE ──
  function statusBadge(status) {
    const map = {
      'Available':       'badge-available',
      'Fully Reserved':  'badge-reserved',
      'Out of Stock':    'badge-out',
      'Archived':        'badge-cancelled',
      'Draft':           'badge-draft',
      'Confirmed':       'badge-confirmed',
      'Cancelled':       'badge-cancelled',
      'Expired':         'badge-cancelled',
      'Active':          'badge-available',
      'New':             'badge-new',
      'In Production':   'badge-production',
      'QC':              'badge-reserved',
      'Delivered':       'badge-confirmed',
      'Pending':         'badge-draft',
      'Ready':           'badge-reserved',
      'Shipped':         'badge-production',
      'Cutting':         'badge-production',
      'Sewing':          'badge-production',
      'Completed':       'badge-confirmed',
    };
    const cls = map[status] || 'badge-cancelled';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  function patternOriginIcon(origin) {
    return origin === 'Original JIWANI Pattern' ? '🏭' : '💊';
  }

  // ── TOAST NOTIFICATIONS ──
  function toast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  // ── LOADING ──
  function loadingHTML(text = 'Loading...') {
    return `<div class="loading"><div class="spinner"></div><span>${text}</span></div>`;
  }

  function emptyHTML(icon, title, text) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <div class="empty-state-title">${title}</div>
        <div class="empty-state-text">${text}</div>
      </div>`;
  }

  // ── MODAL ──
  function showModal(title, contentHTML, buttons = []) {
    const existing = document.getElementById('jpms-modal');
    if (existing) existing.remove();

    const btnsHTML = buttons.map(b =>
      `<button class="btn ${b.cls || 'btn-secondary'}" id="modal-btn-${b.id}">${b.label}</button>`
    ).join('');

    const el = document.createElement('div');
    el.id = 'jpms-modal';
    el.className = 'modal-overlay';
    el.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">${title}</span>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div id="modal-content">${contentHTML}</div>
        ${btnsHTML ? `<div class="flex gap-3 mt-6">${btnsHTML}</div>` : ''}
      </div>`;

    document.body.appendChild(el);
    document.getElementById('modal-close-btn').onclick = hideModal;
    el.addEventListener('click', e => { if (e.target === el) hideModal(); });

    buttons.forEach(b => {
      const btn = document.getElementById(`modal-btn-${b.id}`);
      if (btn && b.onClick) btn.onclick = b.onClick;
    });

    return el;
  }

  function hideModal() {
    const el = document.getElementById('jpms-modal');
    if (el) el.remove();
  }

  // ── FORM HELPERS ──
  function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    const data = {};
    form.querySelectorAll('[name]').forEach(el => {
      data[el.name] = el.value;
    });
    return data;
  }

  function setFormData(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;
    Object.entries(data).forEach(([key, val]) => {
      const el = form.querySelector(`[name="${key}"]`);
      if (el) el.value = val || '';
    });
  }

  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderColor = 'var(--red)';
    const existing = document.getElementById(fieldId + '-error');
    if (existing) existing.remove();
    if (message) {
      const err = document.createElement('span');
      err.id = fieldId + '-error';
      err.className = 'form-error';
      err.textContent = message;
      field.parentNode.appendChild(err);
    }
  }

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.style.borderColor = '';
    const err = document.getElementById(fieldId + '-error');
    if (err) err.remove();
  }

  // ── UNIFORM TYPE OPTIONS ──
  const UNIFORM_TYPES = ['Staff Nurse', 'Sister', 'Matron', 'PPK', 'Man Nurse', 'Medical Assistant (MA)', 'Lab Coat', 'Others'];
  const CLOSURE_TYPES = ['Zip', 'Button'];
  const ORDER_SOURCES = ['JIWANI', 'MEDIFORM'];
  const PRODUCTION_STATUSES = ['Cutting', 'Sewing', 'QC', 'Completed'];
  const SHIPPING_STATUSES = ['Pending', 'Ready', 'Shipped', 'Delivered'];
  const PATTERN_ORIGINS = ['Original JIWANI Pattern', 'Derived MEDIFORM Pattern'];

  function optionsHTML(arr, selected = '', placeholder = 'Select...') {
    const opts = arr.map(o => `<option value="${o}" ${o === selected ? 'selected' : ''}>${o}</option>`).join('');
    return `<option value="">${placeholder}</option>${opts}`;
  }

  // ── INCHES INPUT ──
  function inchField(name, label, value = '') {
    return `
      <div class="form-group">
        <label class="form-label">${label}</label>
        <div class="flex items-center gap-2">
          <input type="number" name="${name}" class="form-control" value="${value}" step="0.25" min="0" max="99" placeholder="0.00">
          <span class="text-muted text-sm" style="white-space:nowrap">in</span>
        </div>
      </div>`;
  }

  return {
    formatDate, formatDateTime, timeUntil,
    validatePatternCode, validateCustomerCode, validateInches,
    statusBadge, patternOriginIcon,
    toast, loadingHTML, emptyHTML,
    showModal, hideModal,
    getFormData, setFormData, showFieldError, clearFieldError,
    UNIFORM_TYPES, CLOSURE_TYPES, ORDER_SOURCES, PRODUCTION_STATUSES, SHIPPING_STATUSES, PATTERN_ORIGINS,
    optionsHTML, inchField,
  };
})();
