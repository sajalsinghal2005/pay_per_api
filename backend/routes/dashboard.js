const express = require('express');
const Usage = require('../models/Usage');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const totalUsage = await Usage.countDocuments({ user: req.user._id });
    const creditsUsed = await Usage.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$creditsUsed' } } }
    ]);

    res.json({
      success: true,
      user: req.user,
      summary: {
        totalCalls: totalUsage,
        creditsUsed: creditsUsed.length ? creditsUsed[0].total : 0
      }
    });
  } catch (error) {
    console.error('[Dashboard] Error:', error);
    res.status(500).json({ success: false, message: 'Unable to load dashboard.' });
  }
});

router.get('/usage', authMiddleware, async (req, res) => {
  try {
    const history = await Usage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    res.json({ success: true, history });
  } catch (error) {
    console.error('[Dashboard] Usage error:', error);
    res.status(500).json({ success: false, message: 'Unable to load usage history.' });
  }
});

module.exports = router;
