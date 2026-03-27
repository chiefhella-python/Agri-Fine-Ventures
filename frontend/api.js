// ============================================
// AGRI-FINE VENTURES — API SERVICE
// Connects frontend to backend API
// ============================================

const API_BASE = "https://agri-fine-ventures-production.up.railway.app/api";

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('afv_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Make authenticated request
const authFetch = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };
  return fetch(fullUrl, { ...options, headers });
};

const AFV_API = {
  // Auth
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async register(email, password, displayName) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    return response.json();
  },

  async verifyToken(token) {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return response.json();
  },

  // Greenhouses
  async getGreenhouses() {
    try {
      const response = await authFetch('/greenhouses');
      return await response.json();
    } catch (error) {
      console.error('Error fetching greenhouses:', error);
      return [];
    }
  },

  async getGreenhouse(id) {
    const response = await authFetch(`/greenhouses/${id}`);
    return response.json();
  },

  async createGreenhouse(data) {
    const response = await authFetch('/greenhouses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateGreenhouse(id, data) {
    const response = await authFetch(`/greenhouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteGreenhouse(id) {
    const response = await authFetch(`/greenhouses/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Sensors
  async getSensorReadings(greenhouseId, limit = 50) {
    const response = await authFetch(`/sensors/${greenhouseId}?limit=${limit}`);
    return response.json();
  },

  async getLatestReadings(greenhouseId) {
    const response = await authFetch(`/sensors/${greenhouseId}/latest`);
    return response.json();
  },

  async submitSensorReading(greenhouseId, sensors) {
    const response = await authFetch(`/sensors/${greenhouseId}`, {
      method: 'POST',
      body: JSON.stringify({ sensors })
    });
    return response.json();
  },

  async getSensorAnalytics(greenhouseId) {
    const response = await authFetch(`/sensors/${greenhouseId}/analytics`);
    return response.json();
  },

  async getSensorHistory(greenhouseId, sensorType, limit = 100) {
    const url = new URL(`/sensors/${greenhouseId}/history`, API_BASE);
    if (sensorType) url.searchParams.append('sensorType', sensorType);
    url.searchParams.append('limit', limit);
    const response = await authFetch(url.pathname + url.search);
    return response.json();
  },

  // Admin
  async getStats() {
    const response = await authFetch('/admin/stats');
    return response.json();
  },

  async getSettings() {
    const response = await authFetch('/admin/settings');
    return response.json();
  },

  async updateSettings(settings) {
    const response = await authFetch('/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return response.json();
  },

  async getLogs(limit = 100) {
    const response = await authFetch(`/admin/logs?limit=${limit}`);
    return response.json();
  },

  async createLog(type, message, data) {
    const response = await authFetch('/admin/logs', {
      method: 'POST',
      body: JSON.stringify({ type, message, data })
    });
    return response.json();
  },

  // Utility
  getAuthHeader,

  // Workers
  async getWorkers() {
    try {
      const res = await authFetch('/workers');
      if (!res.ok) {
        console.error('Workers fetch failed:', res.status);
        return [];
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching workers:', error);
      return [];
    }
  },

  async getWorker(id) {
    const response = await authFetch(`/workers/${id}`);
    return response.json();
  },

  async createWorker(data) {
    const response = await authFetch('/workers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateWorker(id, data) {
    const response = await authFetch(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteWorker(id) {
    const response = await authFetch(`/workers/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Initialize: Load data from backend
  async init() {
    try {
      const greenhouses = await this.getGreenhouses();
      if (greenhouses && greenhouses.length > 0) {
        // Convert date strings to Date objects
        AFV.greenhouses = greenhouses.map(gh => ({
          ...gh,
          plantedDate: gh.plantedDate ? new Date(gh.plantedDate) : null,
          expectedHarvest: gh.expectedHarvest ? new Date(gh.expectedHarvest) : null,
          createdAt: gh.createdAt ? new Date(gh.createdAt) : null,
          updatedAt: gh.updatedAt ? new Date(gh.updatedAt) : null,
          tasks: (gh.tasks || []).map(task => ({
            ...task,
            completedAt: task.completedAt ? new Date(task.completedAt) : null
          }))
        }));
      }
    } catch (error) {
      console.log('Using local greenhouse data');
    }
  }
};

// Make available globally
window.API_BASE = API_BASE;
window.AFV_API = AFV_API;
window.authFetch = authFetch;
window.getAuthHeader = getAuthHeader;
