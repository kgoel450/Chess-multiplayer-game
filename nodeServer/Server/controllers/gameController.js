const path = require('path');

exports.authPageServe = async (req, res) => {
    return res.sendFile(path.resolve(__dirname, "../../Client/html/sign.html"));
}

exports.menuPageServe = async (req, res) => {
    return res.sendFile(path.resolve(__dirname, "../../Client/html/menu.html"));
}

exports.gamePageServe = async (req, res) => {
    return res.sendFile(path.resolve(__dirname, "../../Client/html/game.html"));
}