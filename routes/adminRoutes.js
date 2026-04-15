const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAdmin, adminController.getOverview);

module.exports = router;
