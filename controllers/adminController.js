const playerModel = require('../models/playerModel');
const userModel = require('../models/userModel');

async function getOverview(req, res) {
  const [users, players] = await Promise.all([
    userModel.listUsers(),
    playerModel.listForAdmin(),
  ]);

  return res.json({
    players,
    users,
  });
}

module.exports = {
  getOverview,
};
