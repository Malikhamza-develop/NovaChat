const express = require('express');
const protect = require('../middleware/authMiddleware');
const { searchUsers, getCurrentUser, updateCurrentUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.get('/me', getCurrentUser);
router.patch('/me', updateCurrentUser);
router.get('/search', searchUsers);

module.exports = router;
