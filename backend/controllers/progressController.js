const Progress = require('../models/Progress');
const Goal = require('../models/Goal');

// Add or update progress for a day
exports.addProgress = async (req, res) => {
    try {
        const { date, questionsSolved, topics, notes } = req.body;
        const goalId = req.params.goalId;

        // Check if goal exists
        const goal = await Goal.findById(goalId);
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        // Normalize date to start of day
        const progressDate = new Date(date);
        progressDate.setUTCHours(0, 0, 0, 0);

        // Try to update existing entry, or create new one via upsert
        const progress = await Progress.findOneAndUpdate(
            { goalId, date: progressDate },
            {
                questionsSolved,
                topics,
                notes
            },
            { new: true, upsert: true }
        );

        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error adding progress', error: error.message });
    }
};

// Get progress heat map data
exports.getProgressHeatmap = async (req, res) => {
    try {
        const goalId = req.params.goalId;
        const progressEntries = await Progress.find({ goalId }).sort({ date: 1 }).lean();

        // format into { date: 'YYYY-MM-DD', count: N } for react-calendar-heatmap
        const heatmapData = progressEntries.map(entry => {
            return {
                date: entry.date.toISOString().split('T')[0],
                count: entry.questionsSolved,
                topics: entry.topics,
                notes: entry.notes
            }
        });

        res.status(200).json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress data', error: error.message });
    }
}
