const express = require('express');
const path = require('path');
const curl = require('curl');

const Point = require('../models/Point');
const Parcours = require('../models/Parcours');

const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth');

const router = express.Router();

router.get('/', function(req, res) {
  var user;
  (req.user) ? user = true: user = false;
  Point.find({}, function(err, points) {
    res.render('map', {
      points,
      user
    });
  });
});

router.get('/point/:id', function(req, res) {
  var user;
  (req.user) ? user = true: user = false;
  Point.findOne({
    _id: req.params.id
  }, function(err, point) {
    res.render('point', {
      point,
      user
    });
  });
});

router.get('/dashboard', ensureAuthenticated, function(req, res) {
  res.render('dashboard');
});

router.get('/addPoint', ensureAuthenticated, function(req, res) {
  res.render('addPoint');
});

router.post('/addPoint', ensureAuthenticated, async (req, res) => {
  req.files.avatar.mv('./views/pictures/' + req.files.avatar.name);
  var query = "https://api-adresse.data.gouv.fr/search/?q=" + req.body.address + req.body.city + req.body.cp;
  curl.getJSON(query, {}, function(err, response, data) {
    req.session.newPoint = {
      date: new Date(Date.now()),
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      cp: req.body.cp,
      description: req.body.description,
      descriptionHTML: req.body.descriptionHTML,
      avatar: req.files.avatar.name,
      position: {
        lat: data.features[0].geometry.coordinates[1],
        lng: data.features[0].geometry.coordinates[0]
      }
    }
    res.redirect('/setPosition')
  });
});

router.get('/setPosition', ensureAuthenticated, function(req, res) {
  res.render('setPosition', {
    position: req.session.newPoint.position
  });
});

router.post('/setPosition', ensureAuthenticated, function(req, res) {
  req.session.newPoint.position.lat = req.body.lng;
  req.session.newPoint.position.lng = req.body.lat;
  var point = new Point(req.session.newPoint)
  point.save(function(err) {
    if (err) return console.log(err);
    delete req.session.newPoint;
    res.redirect('/')
  });
});

router.get('/qr/:id', ensureAuthenticated, function(req, res) {
  res.render('qr', {
    id: req.params.id
  });
});

router.get('/tour', function(req, res) {
  res.render('tour');
});

router.get('/tourOptions', ensureAuthenticated, function(req, res) {
  Parcours.find({}, function(err, parcours) {
    res.render('tourOptions', {
      parcours
    });
  });
});

router.get('/tourOptions/:id', ensureAuthenticated, function(req, res) {
  Parcours.findById(req.params.id, function(err, parcours) {
    res.render('tourOptionsId', {
      parcours
    });
  });
});


router.get('/tourCreate', ensureAuthenticated, function(req, res) {
  Point.find({}, function(err, points) {
    res.render('tourCreate', {
      points
    });
  });
});

router.post('/tourCreate', ensureAuthenticated, function(req, res) {
  Point.find({
    _id: {
      $in: Object.keys(req.body)
    }
  }, function(err, points) {
    res.render('order', {
      points
    });
  });
});

router.post('/tourCreateEnd', ensureAuthenticated, function(req, res) {
  var pName = req.body.name;
  var pts = Object.keys(req.body);
  pts.pop();

  var newParcoursPts = [];

  Point.find({
    _id: {
      $in: pts
    }
  }, function(err, points) {
    for (var i = 0; i < points.length; i++) {
      newParcoursPts.push({
        id: points[i]._id,
        i: i
      })
    }
    var newParcours = new Parcours({
      name: pName,
      points: newParcoursPts
    })
    newParcours.save(function(err) {
      if (err) return console.log(err);
      res.redirect('/tourOptions')
    });
  });
});

module.exports = router;
