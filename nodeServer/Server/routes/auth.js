 
const express = require('express');
const authRouter = express.Router();

const firebaseAuthController = require('../controllers/firebaseAuthController');

authRouter.post('/api/register', firebaseAuthController.registerUser);
authRouter.post('/api/login', firebaseAuthController.loginUser);
authRouter.post('/api/logout', firebaseAuthController.logoutUser);

module.exports = authRouter;