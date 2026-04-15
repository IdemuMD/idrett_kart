const express = require('express');
const pageController = require('../controllers/pageController');

const router = express.Router();

router.get('/', pageController.home);
router.get('/login', pageController.loginPage);

module.exports = router;
