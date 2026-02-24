const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const {validationResult } = require('express-validator');

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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg
    });
  }

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

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(31, (err, buffer) => {
    if (err) {
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        req.flash('error', "No message with that email found");
        return res.redirect('/reset');
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(() => {
      res.redirect('/');
    })
    .catch(error => {
      console.log(error);
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
      resetToken: token, 
      resetTokenExpiration: {
        $gt: Date.now()
      }
    })
    .then(user => {
      if (!user) {
      req.flash('error', 'Token is invalid or expired');
      return res.redirect('/reset');
    }

    const message = req.flash('error')[0] || null;

    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      isAuthenticated: false,
      userId: user._id.toString(),
      passwordToken: token,
      csrfToken: req.csrfToken(),
      errorMessage: message
    });
  })
  .catch(error => {
    console.log(error);
  });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken; 
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {
      $gt: Date.now()
    },
    _id: userId
  })
  .then(user => {
    if (!user) {
      req.flash('error', 'Invalid or expired token');
      return res.redirect('/reset');
    }

    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(error => {
    console.log(error);
  });
};

