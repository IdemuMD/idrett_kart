const express = require('express');
const playerController = require('../controllers/playerController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'leader', 'participant'), playerController.index);
router.post('/join', requireAuth, requireRole('participant'), playerController.createForParticipant);
router.post('/', requireAuth, requireRole('admin'), playerController.create);
router.post('/:id/update', requireAuth, requireRole('admin'), playerController.update);
router.post('/:id/delete', requireAuth, requireRole('admin'), playerController.remove);

module.exports = router;
