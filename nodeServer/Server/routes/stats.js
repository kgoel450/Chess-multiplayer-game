const express = require('express');
const statsRouter = express.Router();
const verifyToken = require('../middleware/verify')
const statsController = require('../controllers/statsController');

statsRouter.post('/api/checkmate-update', verifyToken, statsController.checkmateUpdate);
statsRouter.post('/api/stalemate-update', verifyToken, statsController.stalemateUpdate);
statsRouter.get('/api/leader-stats', verifyToken, statsController.getLeadersStats);
statsRouter.get('/api/user-stats', verifyToken, statsController.getUserStats);
statsRouter.get('/api/demo',verifyToken, statsController.demo);

module.exports = statsRouter;