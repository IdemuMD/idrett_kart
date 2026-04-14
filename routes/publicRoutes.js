const express = require('express');
const tournamentController = require('../controllers/tournamentController');

const router = express.Router();

router.get('/dashboard', tournamentController.getPublicDashboard);

module.exports = router;

