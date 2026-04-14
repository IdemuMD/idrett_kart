const express = require('express');
const tournamentController = require('../controllers/tournamentController');

const router = express.Router();

router.get('/lookups', tournamentController.listLookups);

module.exports = router;

