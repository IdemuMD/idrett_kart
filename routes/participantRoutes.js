const express = require('express');
const playerController = require('../controllers/playerController');

const router = express.Router();

router.post('/join-team', playerController.joinTeam);

module.exports = router;

