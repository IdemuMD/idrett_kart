const express = require('express');
const tournamentController = require('../controllers/tournamentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', tournamentController.index);
router.post('/', requireAuth, requireRole('admin'), tournamentController.createTournament);
router.post('/:id/update', requireAuth, requireRole('admin'), tournamentController.updateTournament);
router.post('/:id/delete', requireAuth, requireRole('admin'), tournamentController.deleteTournament);

module.exports = router;
