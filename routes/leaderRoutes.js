const express = require('express');
const teamController = require('../controllers/teamController');
const playerController = require('../controllers/playerController');

const router = express.Router();

router.post('/teams', teamController.createForLeader);
router.post('/players', playerController.create);

module.exports = router;

