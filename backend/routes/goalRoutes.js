const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const goalController = require('../controllers/goalController');

router.post('/', protect, goalController.createGoal);
router.get('/', protect, goalController.getGoals);
router.get('/:id', protect, goalController.getGoalStats);
router.put('/:id', protect, goalController.updateGoal);
router.delete('/:id', protect, goalController.deleteGoal);

module.exports = router;
