const express = require('express');

const router = express.Router();

// Simple in-memory storage for demo - in production use database
let visitorAchievements = {};

router.post('/unlock', (req, res) => {
  const { achievementId, visitorId } = req.body;

  if (!visitorAchievements[visitorId]) {
    visitorAchievements[visitorId] = [];
  }

  if (!visitorAchievements[visitorId].includes(achievementId)) {
    visitorAchievements[visitorId].push(achievementId);
  }

  res.json({ success: true, unlocked: visitorAchievements[visitorId] });
});

router.get('/unlocked/:visitorId', (req, res) => {
  const { visitorId } = req.params;
  res.json(visitorAchievements[visitorId] || []);
});

module.exports = router;