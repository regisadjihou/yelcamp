require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose');
const passport = require("passport");
const LocalStrategy = require("passport-local")
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const Campground = require('./models/campgrounds');
const seedDB  =  require('./seeds')
const Comment   = require("./models/comment");
const User = require("./models/user");
app.use(express.static(__dirname + "/public"))

app.use(methodOverride('_method'));
app.use(flash());
// ==========================
// Import routes
//==============================
const commentRoutes = require("./routes/comments")
const campgroundRoutes = require("./routes/campgrounds")
const indexRoutes = require("./routes/index")
//=======================================================

//seedDB();
app.locals.moment = require('moment');
app.set('view engine', 'ejs');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
app.use(bodyParser.urlencoded({extended:true}));
//passport configuration
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// END OF PASSPORT CONFIGURATION 
app.use(function(req, res, next){
  res.locals.currentUser =  req.user
  res.locals.error = req.flash("error")
  res.locals.success = req.flash("success")
  next();
})
mongoose.connect(process.env.databaseurl, {useNewUrlParser: true});

///create new campground here

// ============================
// Campground Route
// ============================

// ============================
// Comment Route
// ============================

//===================
//AUTH
//===================

// function that check if the user is Logged in or not 
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/login")

}


// tell the app.js to use these route we required it 
app.use("/campground/:id/comments",commentRoutes)
app.use("/campground", campgroundRoutes)
app.use("/",indexRoutes)
//=====================================================================









app.listen(process.env.PORT||3000 , process.env.IP, () =>{
console.log("Server has started!!")
});