// ============================================
// AGRI-FINE VENTURES — SENSORS API ROUTES
// PostgreSQL database (Supabase)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, requireSupervisorOrAdmin } = require('../middleware/auth');

// In-memory sensor data storage (simulates IoT data)
let sensorReadings = {};

// Available sensor types
const sensorTypes = [
  { type: 'temperature', name: 'Temperature', unit: '°C', icon: '🌡️' },
  { type: 'humidity', name: 'Humidity', unit: '%', icon: '💧' },
  { type: 'soil_moisture', name: 'Soil Moisture', unit: '%', icon: '🌱' },
  { type: 'light', name: 'Light Intensity', unit: 'lux', icon: '☀️' },
  { type: 'co2', name: 'CO2 Level', unit: 'ppm', icon: '🌿' },
  { type: 'ph', name: 'pH Level', unit: 'pH', icon: '⚗️' }
];

// GET /api/sensors - Get all sensor types (public)
router.get('/', (req, res) => {
  res.json(sensorTypes);
});

// GET /api/sensors/:greenhouseId - Get sensors for specific greenhouse
router.get('/:greenhouseId', authenticate, async (req, res) => {
  const { greenhouseId } = req.params;
  const { limit = '50' } = req.query;
  
  const readings = sensorReadings[greenhouseId] || [];
  res.json(readings.slice(-parseInt(limit)));
});

// POST /api/sensors/:greenhouseId - Submit sensor reading
router.post('/:greenhouseId', authenticate, requireSupervisorOrAdmin, (req, res) => {
  const { greenhouseId } = req.params;
  const { sensors, timestamp } = req.body;
  
  if (!sensors || typeof sensors !== 'object') {
    return res.status(400).json({ error: 'Sensors data is required' });
  }
  
  const reading = {
    greenhouseId,
    sensors,
    timestamp: timestamp || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  // Initialize if not exists
  if (!sensorReadings[greenhouseId]) {
    sensorReadings[greenhouseId] = [];
  }
  
  reading.id = `reading_${Date.now()}`;
  sensorReadings[greenhouseId].push(reading);
  
  // Keep only last 1000 readings in memory
  if (sensorReadings[greenhouseId].length > 1000) {
    sensorReadings[greenhouseId] = sensorReadings[greenhouseId].slice(-1000);
  }
  
  res.status(201).json(reading);
});

// GET /api/sensors/:greenhouseId/latest - Get latest readings for greenhouse
router.get('/:greenhouseId/latest', authenticate, (req, res) => {
  const { greenhouseId } = req.params;
  
  const readings = sensorReadings[greenhouseId] || [];
  const latest = readings[readings.length - 1] || { 
    greenhouseId, 
    sensors: {}, 
    timestamp: null 
  };
  res.json(latest);
});

// GET /api/sensors/:greenhouseId/history - Get historical data
router.get('/:greenhouseId/history', authenticate, (req, res) => {
  const { greenhouseId } = req.params;
  const { sensorType, limit = '100' } = req.query;
  
  let readings = sensorReadings[greenhouseId] || [];
  
  // Filter by sensor type if provided
  if (sensorType) {
    readings = readings.map(r => ({
      ...r,
      sensors: { [sensorType]: r.sensors?.[sensorType] }
    }));
  }
  
  res.json(readings.slice(-parseInt(limit)));
});

// GET /api/sensors/:greenhouseId/analytics - Get sensor analytics
router.get('/:greenhouseId/analytics', authenticate, (req, res) => {
  const { greenhouseId } = req.params;
  const { period = '24h' } = req.query;
  
  const readings = sensorReadings[greenhouseId] || [];
  
  if (readings.length === 0) {
    return res.json({
      greenhouseId,
      period,
      summary: {},
      stats: {}
    });
  }
  
  // Calculate analytics
  const allSensorTypes = new Set();
  readings.forEach(r => {
    if (r.sensors) {
      Object.keys(r.sensors).forEach(k => allSensorTypes.add(k));
    }
  });
  
  const analytics = {
    greenhouseId,
    period,
    summary: {}
  };
  
  allSensorTypes.forEach(type => {
    const values = readings
      .map(r => r.sensors?.[type])
      .filter(v => typeof v === 'number');
    
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      analytics.summary[type] = {
        average: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        count: values.length,
        unit: sensorTypes.find(s => s.type === type)?.unit || ''
      };
    }
  });
  
  res.json(analytics);
});

// DELETE /api/sensors/:greenhouseId - Clear sensor data for greenhouse (Admin only)
router.delete('/:greenhouseId', authenticate, requireAdmin, (req, res) => {
  const { greenhouseId } = req.params;
  
  if (!sensorReadings[greenhouseId]) {
    return res.status(404).json({ error: 'No sensor data found for this greenhouse' });
  }
  
  delete sensorReadings[greenhouseId];
  res.json({ message: 'Sensor data cleared successfully' });
});

module.exports = router;
