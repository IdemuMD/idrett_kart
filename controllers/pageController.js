function home(req, res) {
  return res.render('index', {
    title: 'Idrettskart - Turneringssystem',
  });
}

module.exports = {
  home,
};
