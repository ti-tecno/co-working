const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contactController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', ctrl.create);
router.get('/', authenticate, requireAdmin, ctrl.getAll);
router.patch('/:id/read', authenticate, requireAdmin, ctrl.markRead);

module.exports = router;
