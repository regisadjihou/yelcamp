const express = require('express')
const router = express.Router()
const passport = require("passport");
const User = require("../models/user");


// Route route
router.get("/", function(req, res){
  res.render("home")
})


//SHOW REGISTER FORM
router.get('/register', function (req, res) {
  res.render("register")
})

//Handle sign up logic 
router.post("/register", function(req, res){
  const newUser = new User({username: req.body.username});
  if(req.body.adminCode === 'cotonou') {
    newUser.isAdmin = true;
  }
User.register(newUser, req.body.password, function(err, user){
  if (err) {
    req.flash("error", err.message)
    res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to YelCamp " + req.body.username)
        res.redirect("/campground");
      });
    }
  });

});


//Show login form 
router.get('/login', function (req, res) {
  res.render("login")
})

//Handle login logic 
router.post("/login", passport.authenticate("local",
    {   
         successRedirect:"/campground",
         failureRedirect: "/login"

    }), function(req, res){

})

// logout route
router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "Logged you out ")
  res.redirect("/");
});

// function that check if the user is Logged in or not 

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  
  res.redirect("/login")

}




module.exports = router;