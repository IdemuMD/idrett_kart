const express = require('express');
const pageController = require('../controllers/pageController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', pageController.home);
router.get('/login', pageController.loginPage);
router.get('/readme', requireAdmin, pageController.readmePage);

module.exports = router;
