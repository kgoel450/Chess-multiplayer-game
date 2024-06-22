const path = require("path");

require('dotenv').config()

const { adminFireApp } = require("../config/firebase");
const verifyToken = async (req, res, next) => {
    const idToken = req.cookies.access_token;
    if (!idToken) {
        //return res.status(403).json({ error: 'No token provided' });
        return res.redirect(`http://${process.env.SERVER_IP}:${process.env.N_PORT}/`);
    }

    try {
      const decodedToken = await adminFireApp.auth().verifyIdToken(idToken); 
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.redirect(`http://${process.env.SERVER_IP}:${process.env.N_PORT}/`);
        // return res.status(403).json({ error: 'Unauthorized' });
    }
};

module.exports = verifyToken;