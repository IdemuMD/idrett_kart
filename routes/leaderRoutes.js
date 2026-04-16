const express = require('express');
const teamController = require('../controllers/teamController');
const playerController = require('../controllers/playerController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/teams', requireRole('leader'), teamController.createForLeader);
router.post('/players', requireRole('leader'), playerController.createForLeader);

module.exports = router;

