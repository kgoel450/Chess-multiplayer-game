const express = require('express');
const gameRouter = express.Router();
const verifyToken = require("../middleware/verify.js")

const gameController = require('../controllers/gameController');

gameRouter.get('/', gameController.authPageServe);
gameRouter.get('/menu', verifyToken, gameController.menuPageServe);
gameRouter.get('/game', verifyToken, gameController.gamePageServe);

module.exports = gameRouter;