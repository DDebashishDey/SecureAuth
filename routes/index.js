var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');

passport.use(new localStrategy(userModel.authenticate()));

// slash(login) route
router.get('/', Loggedin, function (req, res) {
  res.render('index', { error: req.flash('error') });
});

// profile route
router.get('/profile', isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render('profile', { user });
});


// register route
router.get('/register', Loggedin, function (req, res) {
  res.render('register', { error: req.flash('error') });
});

router.post('/registered', async function (req, res) {
  let userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
    gender: req.body.gender,
    profession: req.body.profession,
    hobby: req.body.hobby,
    linkedin: req.body.linkedin,
    github: req.body.github,
    twitter: req.body.twitter,
  });

  let existingUser = await userModel.findOne({ username: req.body.username });
  let existingEmail = await userModel.findOne({ email: req.body.email });

  if (existingUser) {
    req.flash('error', 'Username already exists! Choose a different username.');
    return res.redirect('/register');
  }

  if (existingEmail) {
    req.flash('error', 'Email already exists! Choose a different email.');
    return res.redirect('/register');
  }

  const password = req.body.password;

  if (password.length < 8) {
    req.flash('error', 'Weak password! Must be at least 8 characters long.');
    return res.redirect('/register');
  }
  if (!/[A-Z]/.test(password)) {
    req.flash('error', 'Weak password! Must have at least one uppercase letter.');
    return res.redirect('/register');
  }
  if (!/[a-z]/.test(password)) {
    req.flash('error', 'Weak password! Must have at least one lowercase letter.');
    res.redirect('/register');
  }
  if (!/[0-9]/.test(password)) {
    req.flash('error', 'Weak password! Must have at least one number.');
    return res.redirect('/register');
  }
  if (!/[!@#$%^&.*]/.test(password)) {
    req.flash('error', 'Weak password! Must have at least one special character (!@#$%^&*).');
    return res.redirect('/register');
  } 

  // If password is strong, proceed with user registration
  try {
    userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/profile');
      });
    }); 
  } catch (error) {
    res.status(500).json({ error: "Server error!" });
  }

  
});

router.post('/loggedin', passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: '/',
  failureFlash: true
}), function (req, res) {
});

// logout route 
router.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// isLoggedIn function
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'No user logged in. Please login here!');
  res.redirect('/');
}

function Loggedin(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/profile");
  }
  else {
    return next();
  }
};

module.exports = router;