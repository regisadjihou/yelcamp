const express = require('express')
const router = express.Router({mergeParams: true})
const Campground = require('../models/campgrounds');
const Comment   = require("../models/comment");
const middleware = require("../middleware");

// Comment New

router.get('/new',middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campgroundCommnent){
    if(err){
      console.log(err)
    } else{
      res.render("comments/new", {campgroundCommnent:campgroundCommnent})
      
    }
  })
})


// Comment Create

router.post('/',middleware.isLoggedIn,function(req, res){
Campground.findById(req.params.id, function(err, campgroundCommnent){
if(err){
  console.log(err)
} else{
  Comment.create(req.body.comment,function(err, comment){
  if (err){
    req.flash("error", "Somthing Went Wrong")
    console.log(err)
  }else{
    comment.author.id = req.user._id;
    comment.author.username = req.user.username;
    comment.save();
    campgroundCommnent.comments.push(comment);
    campgroundCommnent.save();
    req.flash("success", "Successfully Added Comment")
    res.redirect("/campground/" + campgroundCommnent._id );
  }
})


}
})
})

//comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership,function (req, res) {
  Comment.findById(req.params.comment_id, function(err, foundComment){
    if(err){
      res.redirect("back")
    } else{
      res.render("comments/edit", {campground_id:req.params.id, comment:foundComment})
    }
  })
});


//comment update
router.put("/:comment_id", middleware.checkCommentOwnership,function (req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if(err){
      res.redirect("back")
    } else {
      res.redirect("/campground/" + req.params.id)
    }
  })
});


//comment delete
router.delete("/:comment_id", middleware.checkCommentOwnership,function (req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      res.redirect("back")
    } else {
      req.flash("success", "Comment Deleted")
      res.redirect("/campground/" + req.params.id)
    }
  })
});



//middleware





module.exports = router;