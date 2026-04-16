const express = require('express');
const matchController = require('../controllers/matchController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', matchController.index);
router.post('/', requireAuth, requireRole('admin'), matchController.create);
router.post('/:id/update', requireAuth, requireRole('admin'), matchController.update);
router.post('/:id/delete', requireAuth, requireRole('admin'), matchController.remove);

module.exports = router;
