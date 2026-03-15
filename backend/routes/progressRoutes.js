const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// Add or update progress for a specific goal
router.post('/goals/:goalId', progressController.addProgress);

// Get progress heat map data
router.get('/goals/:goalId/heatmap', progressController.getProgressHeatmap);

module.exports = router;
