const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAdmin, adminController.getOverview);
router.post('/users/:id/role', requireAdmin, adminController.updateUserRole);
router.post('/users/:id/delete', requireAdmin, adminController.deleteUser);

module.exports = router;
