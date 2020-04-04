const express = require('express')
const router = express.Router()
const Campground = require('../models/campgrounds');
const middleware = require("../middleware");
//===cloudinary
const multer = require('multer');
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dty41k4sb', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//===end cloudinary


const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);


// ============================
// Campground Route
// ============================
//get request (display all the camp )
router.get('/', function (req, res) {

  Campground.find({}, function(err, data){
  	if(err){
  		console.log(err)
  	}else{
  		res.render("campgrounds/index", {data:data, currentUser:req.user})
  	}
  })	
  
})
//POST request for the form 
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn,upload.single('image'),function(req, res){
  // get data from form and add to campgrounds array
cloudinary.uploader.upload(req.file.path, function(result) {

const dataName = req.body.name
const dataImage = result.secure_url
const imageId = result.public_id
const dataDesc = req.body.description
const price = req.body.price
const phone = req.body.phone
  const author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    const lat = data[0].latitude;
    const lng = data[0].longitude;
    const location = data[0].formattedAddress;
    const dataUser = {name: dataName, image:dataImage,imageId:imageId,price:price, description:dataDesc, author:author,phone:phone ,location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(dataUser, function(err, newcreate){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campground");
        }
    });
  });
  });
});
//take us to the form (to add new campground)
router.get('/new', middleware.isLoggedIn,function (req, res) {
  res.render("campgrounds/new")
})
//Get more info on the campground
router.get('/:id', function (req, res) {
  Campground.findById(req.params.id).populate("comments").exec(function (err, moreview) {
  	if(err){
  		console.log(err)
  	} else {
  		res.render("campgrounds/view", {moreview:moreview})
  	}
  });
})

// edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership ,function(req, res){
Campground.findById(req.params.id, function (err, foundCampground) {
    
    res.render("campgrounds/edit", {campground:foundCampground})
});
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'),function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground,  async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                await cloudinary.v2.uploader.destroy(campground.imageId);
                let result = await cloudinary.v2.uploader.upload(req.file.path);
                campground.imageId = result.public_id;
                campground.image = result.secure_url;
              } catch (err) {
                req.flash("error", err.message);
                return res.render("error");
              }
            }
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campground/" + campground._id);
        }
    });
  });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(campground.imageId);
      campground.remove();
      req.flash("success","Successfully Deleted!");
      res.redirect("/campground");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.render("error");
      }
    }
  });
});






//middleware







module.exports = router;
