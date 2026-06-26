// JPMS API Layer
// All backend communication goes through here.

const JPMS_API = (() => {

  // ── Replace this URL after deploying your Apps Script ──
  const SCRIPT_URL = window.JPMS_SCRIPT_URL || localStorage.getItem('jpms_script_url') || '';

  async function call(action, payload = {}) {
    const token = Auth.getToken();
    if (!token && action !== 'getSettings') {
      throw new Error('Not authenticated');
    }

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, token }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    if (!json.success) throw new Error(json.data || 'Server error');
    return json.data;
  }

  return {
    // Orders
    getOrders: (p) => call('getOrders', p),
    createOrder: (p) => call('createOrder', p),
    updateOrder: (p) => call('updateOrder', p),
    completeDelivery: (p) => call('completeDelivery', p),

    // Pattern Library
    getPatterns: (p) => call('getPatterns', p),
    getPattern: (code) => call('getPattern', { patternCode: code }),
    createPattern: (p) => call('createPattern', p),
    updatePattern: (p) => call('updatePattern', p),
    getPatternFamily: (code) => call('getPatternFamily', { patternCode: code }),

    // Measurements
    getMeasurements: (code) => call('getMeasurements', { patternCode: code }),
    saveMeasurements: (p) => call('saveMeasurements', p),

    // Production
    getProduction: (p) => call('getProduction', p),
    createProduction: (p) => call('createProduction', p),
    updateProduction: (p) => call('updateProduction', p),

    // Ready Pattern Inventory
    getRPI: (p) => call('getRPI', p),
    getRPIItem: (id) => call('getRPIItem', { inventoryId: id }),
    updateRPILocation: (p) => call('updateRPILocation', p),
    updateRPIPhoto: (p) => call('updateRPIPhoto', p),

    // Reservations
    getReservations: (p) => call('getReservations', p),
    createReservation: (p) => call('createReservation', p),
    cancelReservation: (p) => call('cancelReservation', p),
    confirmReservation: (p) => call('confirmReservation', p),
    expireReservations: () => call('expireReservations'),

    // MEDIFORM Customers
    getMediformCustomers: (p) => call('getMediformCustomers', p),
    getMediformCustomer: (code) => call('getMediformCustomer', { customerCode: code }),
    createMediformCustomer: (p) => call('createMediformCustomer', p),
    updateMediformCustomer: (p) => call('updateMediformCustomer', p),

    // Alterations
    getAlterations: (p) => call('getAlterations', p),
    createAlteration: (p) => call('createAlteration', p),

    // Shipping (logistics only)
    getShipping: (p) => call('getShipping', p),
    createShipping: (p) => call('createShipping', p),
    updateShipping: (p) => call('updateShipping', p),

    // Search & Dashboard
    globalSearch: (q) => call('globalSearch', { query: q }),
    getDashboard: () => call('getDashboard'),

    // Settings
    getSettings: () => call('getSettings'),
    updateSetting: (p) => call('updateSetting', p),
  };
})();
