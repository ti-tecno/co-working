const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservationController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/my', authenticate, ctrl.getMyReservations);
router.get('/all', authenticate, requireAdmin, ctrl.getAllReservations);
router.get('/availability', authenticate, ctrl.getAvailability);
router.post('/', authenticate, ctrl.create);
router.patch('/:id/cancel', authenticate, ctrl.cancel);
router.put('/:id', authenticate, requireAdmin, ctrl.update);

module.exports = router;
