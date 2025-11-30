const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid credantilans');
        return res.redirect('/login');
      }

      bcrypt.compare(password, user.password)
      .then(isPasswordCorrect => {
        if (isPasswordCorrect) {
          req.session.isLoggedIn = true;
          req.session.user = user;

          return req.session.save(error => {
            console.log(error);
            res.redirect('/');
          });
        } else {
          req.flash('error', 'Invalid credantilans');
          res.redirect('/login');
        }
      })
      .catch(error => {
        console.log(error);
        res.redirect('/login');
      });
    })
    .catch(error => console.log(error));
};

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email }).then(userDoc => {
    if (userDoc) {
      req.flash('error', 'Email is exists already');
      return res.redirect('./signup');
    }

    return bcrypt
      .hash(password, 12).
      then(hashedPassword => {
        const user = new User({
          email: email,
          password: hashedPassword,
          name: email.split('@')[0],
          cart: { items: [] }
        });

        return user.save();
      }).catch(error => {
        console.log(error);
      })
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(error => {
    console.log(error);
  })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

