const Goal = require('../models/Goal');
const Progress = require('../models/Progress');

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { title, totalQuestions, startDate, endDate, totalDays } = req.body;
    
    // If user provided start/end dates, compute totalDays
    let calculatedTotalDays = totalDays;
    let finalEndDate = endDate ? new Date(endDate) : null;
    let finalStartDate = new Date(startDate || Date.now());

    if (!totalDays && finalEndDate) {
      const diffTime = Math.abs(finalEndDate - finalStartDate);
      calculatedTotalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (totalDays && !finalEndDate) {
      finalEndDate = new Date(finalStartDate);
      finalEndDate.setDate(finalEndDate.getDate() + calculatedTotalDays);
    }

    const goal = new Goal({
      user: req.user.id,
      title,
      totalQuestions,
      startDate: finalStartDate,
      endDate: finalEndDate,
      totalDays: calculatedTotalDays
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal', error: error.message });
  }
};

// Get all goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
};

// Get specific goal with metrics (CRR, RRR)
exports.getGoalStats = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id).lean();
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Calculate metrics
        const progressEntries = await Progress.find({ goalId: goal._id }).sort({ date: 1 }).lean();
        
        let totalSolved = 0;
        progressEntries.forEach(entry => {
            totalSolved += entry.questionsSolved;
        });

        const today = new Date();
        const start = new Date(goal.startDate);
        
        // Days passed calculation (min 1 day passed to avoid infinity CRR)
        let daysPassed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
        if (daysPassed < 1) daysPassed = 1;
        if (daysPassed > goal.totalDays) daysPassed = goal.totalDays;

        const remainingDays = goal.totalDays - daysPassed;
        const remainingQuestions = goal.totalQuestions - totalSolved;

        const crr = (totalSolved / daysPassed);
        const rrr = remainingDays > 0 ? (remainingQuestions / remainingDays) : 0;

        res.status(200).json({
            ...goal,
            stats: {
                totalSolved,
                remainingQuestions,
                daysPassed,
                remainingDays,
                crr: crr.toFixed(2),
                rrr: rrr.toFixed(2),
                progress: progressEntries
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching goal details', error: error.message });
    }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        
        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Goal.findByIdAndDelete(req.params.id);
        await Progress.deleteMany({ goalId: req.params.id });
        res.status(200).json({ message: 'Goal and associated progress deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting goal', error: error.message });
    }
}

// Update goal
exports.updateGoal = async (req, res) => {
    try {
        const { title, totalQuestions, totalDays, startDate } = req.body;
        const goal = await Goal.findById(req.params.id);
        
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (title) goal.title = title;
        if (totalQuestions) goal.totalQuestions = totalQuestions;
        
        if (startDate || totalDays) {
            const finalStartDate = startDate ? new Date(startDate) : new Date(goal.startDate);
            const calculatedTotalDays = totalDays ? totalDays : goal.totalDays;
            
            const finalEndDate = new Date(finalStartDate);
            finalEndDate.setDate(finalEndDate.getDate() + calculatedTotalDays);

            goal.startDate = finalStartDate;
            goal.totalDays = calculatedTotalDays;
            goal.endDate = finalEndDate;
        }

        await goal.save();
        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error updating goal', error: error.message });
    }
};
