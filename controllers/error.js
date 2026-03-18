exports.get404 = (req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404' });
};

exports.get505 = (req, res, next) => {
  res.status(505).render('505', { pageTitle: 'Some Error', path: '/505' });
};

