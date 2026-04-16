const express = require('express');
const playerController = require('../controllers/playerController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', playerController.index);
router.post('/', requireAuth, requireRole('admin'), playerController.create);
router.post('/:id/update', requireAuth, requireRole('admin'), playerController.update);
router.post('/:id/delete', requireAuth, requireRole('admin'), playerController.remove);

module.exports = router;
