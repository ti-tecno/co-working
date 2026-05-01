const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/spaceTypeController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/admin', authenticate, requireAdmin, ctrl.getAllAdmin);
router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);

module.exports = router;
