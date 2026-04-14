const express = require('express');
const adminController = require('../controllers/adminController');
const tournamentController = require('../controllers/tournamentController');
const teamController = require('../controllers/teamController');
const playerController = require('../controllers/playerController');
const matchController = require('../controllers/matchController');

const router = express.Router();

router.get('/overview', adminController.getOverview);
router.post('/tournaments', tournamentController.createTournament);
router.post('/teams', teamController.create);
router.post('/players', playerController.create);
router.post('/matches', matchController.create);
router.patch('/matches/:id/result', matchController.updateResult);

module.exports = router;

