const userModel = require('../models/userModel');
const playerModel = require('../models/playerModel');

function getOverview(req, res) {
  res.json({
    users: userModel.listUsers(),
    players: playerModel.listForAdmin(),
  });
}

module.exports = { getOverview };

