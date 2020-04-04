const Campground = require('../models/campgrounds');
const Comment   = require("../models/comment");




const middlewareObj = {};

//middleware

middlewareObj.checkCommentOwnership = function (req, res, next){
  if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function (err, foundComment) {   
  if(err){
    res.redirect("back")
  } else{
    if(foundComment.author.id.equals(req.user._id)|| req.user.isAdmin) {
      next();
    } else {
      req.flash("error", "You dont have permission to do that")
      res.redirect("back")
    }
  }
});
  } else{
    req.flash("error", "You need to be logged in to do that")
    res.redirect("back")
  }
}


middlewareObj.checkCampgroundOwnership = function (req, res, next){
  if(req.isAuthenticated()){
    Campground.findById(req.params.id, function (err, foundCampground) {   
  if(err){
    req.flash("error", "Campground Not Found")
    res.redirect("back")
  } else{
    if(foundCampground.author.id.equals(req.user._id)|| req.user.isAdmin) {
      next();
    } else {
      req.flash("error", "You Don't have permission to do that")
      res.redirect("back")
    }
  }
});
  } else{
    req.flash("error", "You need to be logged first before to do that!!")
    res.redirect("back")
  }
}



middlewareObj.isLoggedIn = function (req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  req.flash("error", "You need to be logged in first before to do that!!")
  res.redirect("/login")

}


module.exports = middlewareObj;