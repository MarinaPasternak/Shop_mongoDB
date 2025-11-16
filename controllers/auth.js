exports.getLogin = (req, res, next) => {
  const cookie = req.headers.cookie; 

  let loggedIn = false;

  if (cookie) {
    const parsed = cookie
      .split(';')
      .map(cookieData => cookieData.trim())
      .find(cookieData => cookieData.startsWith('loggedIn='));

    if (parsed) {
      loggedIn = parsed.split('=')[1] === 'true';
    }
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: loggedIn
  });
};

exports.postLogin = (req, res, next) => {
  res.setHeader('Set-Cookie', 'loggedIn=true');
  res.redirect('/');
};

