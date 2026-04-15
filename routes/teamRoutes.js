const express = require('express');
const teamController = require('../controllers/teamController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', teamController.index);
router.post('/', requireAuth, requireRole('admin'), teamController.create);
router.post('/:id/update', requireAuth, requireRole('admin'), teamController.update);
router.post('/:id/delete', requireAuth, requireRole('admin'), teamController.remove);

module.exports = router;
